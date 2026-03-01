<?php

namespace App\Http\Controllers;

use App\Enums\EstadoBoleta;
use App\Models\Boleta;
use App\Models\BoletaVersion;
use App\Http\Requests\StoreBoletaRequest;
use App\Http\Requests\UpdateBoletaRequest;
use App\Http\Resources\BoletaResource;
use App\Services\ValidacionEstructuraService;
use App\Services\VersionamientoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BoletaController extends Controller
{
    public function __construct(
        private readonly VersionamientoService $versionamientoService,
        private readonly ValidacionEstructuraService $validacionService,
    ) {}

    /**
     * GET /boletas
     * Lista paginada con filtros opcionales: estado, tipo_interaccion, pais, cliente.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Boleta::with([
                'creador',
                'versiones' => fn($q) => $q->select('id', 'boleta_id', 'numero_version', 'es_activa')->orderByDesc('numero_version'),
            ])
            ->withCount('versiones');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('tipo_interaccion')) {
            $query->where('tipo_interaccion', $request->tipo_interaccion);
        }
        if ($request->filled('pais')) {
            $query->where('pais', 'like', '%' . $request->pais . '%');
        }
        if ($request->filled('cliente')) {
            $query->where('cliente', 'like', '%' . $request->cliente . '%');
        }
        if ($request->filled('busqueda')) {
            $term = $request->busqueda;
            $query->where(fn($q) => $q
                ->where('nombre', 'like', "%$term%")
                ->orWhere('cliente', 'like', "%$term%")
            );
        }

        $boletas = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => BoletaResource::collection($boletas),
            'meta' => [
                'current_page' => $boletas->currentPage(),
                'last_page'    => $boletas->lastPage(),
                'per_page'     => $boletas->perPage(),
                'total'        => $boletas->total(),
            ],
        ]);
    }

    /**
     * POST /boletas
     * Crea una boleta en estado draft y genera automáticamente la versión 1 (activa, sin segmentos).
     */
    public function store(StoreBoletaRequest $request): JsonResponse
    {
        $boleta = Boleta::create([
            ...$request->validated(),
            'estado'     => EstadoBoleta::Draft,
            'created_by' => $request->user()->id,
        ]);

        $boleta->versiones()->create([
            'numero_version' => 1,
            'es_activa'      => true,
        ]);

        return response()->json([
            'data'    => new BoletaResource($boleta->load('versiones', 'creador')),
            'message' => 'Boleta creada en estado draft',
        ], 201);
    }

    /**
     * GET /boletas/{id}
     * Retorna boleta con versión activa y su estructura completa (segmentos → preguntas → opciones).
     */
    public function show(string $id): JsonResponse
    {
        $boleta = Boleta::with([
            'creador',
            'versiones.segmentos.preguntas.opciones',
            'versiones.areas',
        ])->findOrFail($id);

        return response()->json([
            'data' => new BoletaResource($boleta),
        ]);
    }

    /**
     * PUT /boletas/{id}
     * Actualiza los metadatos de una boleta. Solo si está en estado draft.
     */
    public function update(UpdateBoletaRequest $request, string $id): JsonResponse
    {
        $boleta = Boleta::findOrFail($id);

        if (!$boleta->esEditable()) {
            return response()->json([
                'message' => 'Solo se pueden editar boletas en estado draft',
            ], 422);
        }

        $boleta->update($request->validated());

        return response()->json([
            'data'    => new BoletaResource($boleta->load('versiones', 'creador')),
            'message' => 'Boleta actualizada correctamente',
        ]);
    }

    /**
     * DELETE /boletas/{id}
     * Soft-delete de la boleta. Solo si está en estado draft.
     */
    public function destroy(string $id): JsonResponse
    {
        $boleta = Boleta::findOrFail($id);

        if (!$boleta->esEditable()) {
            return response()->json([
                'message' => 'Solo se pueden eliminar boletas en estado draft. Para archivar una boleta activa, usa el endpoint de archivar.',
            ], 422);
        }

        $boleta->delete();

        return response()->json([
            'message' => 'Boleta eliminada correctamente',
        ]);
    }

    /**
     * POST /boletas/{id}/activar
     * Activa la boleta: valida la estructura y cambia estado a 'activa'.
     * Una boleta activa puede ser evaluada pero no editada directamente.
     */
    public function activar(string $id): JsonResponse
    {
        $boleta = Boleta::with('versionActiva.segmentos.preguntas')->findOrFail($id);

        if ($boleta->estado !== EstadoBoleta::Draft) {
            return response()->json([
                'message'       => 'Solo se pueden activar boletas en estado draft',
                'estado_actual' => $boleta->estado->value,
            ], 422);
        }

        $version = $boleta->versionActiva;

        if (!$version) {
            return response()->json([
                'message' => 'La boleta no tiene ninguna versión activa',
            ], 422);
        }

        // Validar que la suma de pesos de segmentos normales == total_global
        try {
            $this->validacionService->validarSumaSegmentos($version);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'La estructura de la boleta no es válida',
                'errors'  => $e->errors(),
            ], 422);
        }

        $boleta->update(['estado' => EstadoBoleta::Activa]);

        return response()->json([
            'data'    => new BoletaResource($boleta->load('versiones.segmentos.preguntas.opciones', 'creador')),
            'message' => 'Boleta activada correctamente. Ya está disponible para evaluaciones.',
        ]);
    }

    /**
     * POST /boletas/{id}/archivar
     * Archiva la boleta (ya no disponible para nuevas evaluaciones).
     */
    public function archivar(string $id): JsonResponse
    {
        $boleta = Boleta::findOrFail($id);

        if ($boleta->estado === EstadoBoleta::Archivada) {
            return response()->json(['message' => 'La boleta ya está archivada'], 422);
        }

        $boleta->update(['estado' => EstadoBoleta::Archivada]);

        return response()->json([
            'data'    => new BoletaResource($boleta),
            'message' => 'Boleta archivada correctamente',
        ]);
    }

    /**
     * POST /boletas/{id}/publicar-borrador/{versionId}
     * Activa una versión borrador como la nueva versión activa de la boleta.
     * La versión activa anterior queda desactivada (sus evaluaciones se conservan).
     */
    public function publicarBorrador(string $id, string $versionId): JsonResponse
    {
        $boleta  = Boleta::findOrFail($id);
        $version = BoletaVersion::where('boleta_id', $id)->where('id', $versionId)->firstOrFail();

        if ($version->es_activa) {
            return response()->json(['message' => 'Esta versión ya es la activa'], 422);
        }

        $this->versionamientoService->activarVersion($version);

        return response()->json([
            'data'    => new BoletaResource($boleta->fresh()),
            'message' => "Versión {$version->numero_version} publicada. Es ahora la versión activa.",
        ]);
    }

    /**
     * DELETE /boletas/{id}/borrador/{versionId}
     * Descarta una versión borrador (no activa) y todo su contenido.
     */
    public function descartarBorrador(string $id, string $versionId): JsonResponse
    {
        $boleta  = Boleta::findOrFail($id);
        $version = BoletaVersion::where('boleta_id', $id)->where('id', $versionId)->firstOrFail();

        if ($version->es_activa) {
            return response()->json(['message' => 'No se puede descartar la versión activa'], 422);
        }

        \DB::transaction(function () use ($version) {
            foreach ($version->segmentos()->with('preguntas.opciones')->get() as $segmento) {
                foreach ($segmento->preguntas as $pregunta) {
                    $pregunta->opciones()->delete();
                    $pregunta->delete();
                }
                $segmento->delete();
            }
            $version->delete();
        });

        return response()->json(['message' => 'Borrador descartado correctamente']);
    }

    /**
     * POST /boletas/{id}/reactivar
     * Reactiva una boleta archivada → la vuelve a estado activa.
     */
    public function reactivar(string $id): JsonResponse
    {
        $boleta = Boleta::findOrFail($id);

        if ($boleta->estado !== EstadoBoleta::Archivada) {
            return response()->json([
                'message'       => 'Solo se pueden reactivar boletas archivadas',
                'estado_actual' => $boleta->estado->value,
            ], 422);
        }

        $boleta->update(['estado' => EstadoBoleta::Activa]);

        return response()->json([
            'data'    => new BoletaResource($boleta),
            'message' => 'Boleta reactivada. Ya está disponible para nuevas evaluaciones.',
        ]);
    }

    /**
     * POST /boletas/{id}/clonar-version
     * Clona la versión activa de la boleta creando una nueva versión editable.
     * Útil cuando la versión activa ya tiene evaluaciones y se requieren cambios.
     */
    public function clonarVersion(string $id): JsonResponse
    {
        $boleta = Boleta::with('versionActiva')->findOrFail($id);

        if (!$boleta->versionActiva) {
            return response()->json([
                'message' => 'La boleta no tiene una versión activa para clonar',
            ], 422);
        }

        $nuevaVersion = $this->versionamientoService->clonarVersionActiva($boleta);

        return response()->json([
            'data'    => new BoletaResource($boleta->load('versiones.segmentos.preguntas.opciones', 'creador')),
            'message' => "Versión {$nuevaVersion->numero_version} creada como clon editable",
        ], 201);
    }
}
