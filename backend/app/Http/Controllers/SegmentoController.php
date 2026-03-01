<?php

namespace App\Http\Controllers;

use App\Models\BoletaVersion;
use App\Models\Segmento;
use App\Http\Requests\StoreSegmentoRequest;
use App\Http\Resources\SegmentoResource;
use App\Services\ValidacionEstructuraService;
use Illuminate\Http\JsonResponse;

class SegmentoController extends Controller
{
    public function __construct(
        private readonly ValidacionEstructuraService $validacionService,
    ) {}

    /**
     * GET /boleta-versiones/{version}/segmentos
     * Lista todos los segmentos de una versión, ordenados.
     */
    public function index(string $versionId): JsonResponse
    {
        $version = BoletaVersion::findOrFail($versionId);

        $segmentos = $version->segmentos()->with('preguntas.opciones')->get();

        return response()->json([
            'data' => SegmentoResource::collection($segmentos),
        ]);
    }

    /**
     * POST /boleta-versiones/{version}/segmentos
     * Crea un nuevo segmento en la versión. Solo si la versión es editable.
     */
    public function store(StoreSegmentoRequest $request, string $versionId): JsonResponse
    {
        $version = BoletaVersion::findOrFail($versionId);

        if (!$version->esEditable()) {
            return response()->json([
                'message' => 'Esta versión ya no es editable (tiene evaluaciones asociadas)',
            ], 422);
        }

        // Calcular el siguiente orden automáticamente
        $orden = $version->segmentos()->max('orden') + 1;

        $segmento = $version->segmentos()->create([
            ...$request->validated(),
            'orden' => $orden,
        ]);

        return response()->json([
            'data'    => new SegmentoResource($segmento->load('preguntas')),
            'message' => 'Segmento creado correctamente',
        ], 201);
    }

    /**
     * GET /segmentos/{id}
     */
    public function show(string $id): JsonResponse
    {
        $segmento = Segmento::with('preguntas.opciones')->findOrFail($id);

        return response()->json([
            'data' => new SegmentoResource($segmento),
        ]);
    }

    /**
     * PUT /segmentos/{id}
     */
    public function update(StoreSegmentoRequest $request, string $id): JsonResponse
    {
        $segmento = Segmento::with('version')->findOrFail($id);

        if (!$segmento->version->esEditable()) {
            return response()->json([
                'message' => 'Esta versión ya no es editable',
            ], 422);
        }

        $segmento->update($request->validated());

        return response()->json([
            'data'    => new SegmentoResource($segmento->load('preguntas.opciones')),
            'message' => 'Segmento actualizado correctamente',
        ]);
    }

    /**
     * DELETE /segmentos/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $segmento = Segmento::with('version')->findOrFail($id);

        if (!$segmento->version->esEditable()) {
            return response()->json([
                'message' => 'Esta versión ya no es editable',
            ], 422);
        }

        $segmento->delete();

        return response()->json([
            'message' => 'Segmento eliminado correctamente',
        ]);
    }

    /**
     * POST /segmentos/{id}/distribuir
     * Distribuye el peso del segmento equitativamente entre sus preguntas.
     */
    public function distribuir(string $id): JsonResponse
    {
        $segmento = Segmento::with(['version', 'preguntas'])->findOrFail($id);

        if (!$segmento->version->esEditable()) {
            return response()->json([
                'message' => 'Esta versión ya no es editable',
            ], 422);
        }

        if ($segmento->preguntas->isEmpty()) {
            return response()->json([
                'message' => 'El segmento no tiene preguntas para distribuir',
            ], 422);
        }

        $this->validacionService->distribuirPesosEquitativamente($segmento);

        return response()->json([
            'data'    => new SegmentoResource($segmento->load('preguntas.opciones')),
            'message' => 'Pesos distribuidos equitativamente entre las preguntas',
        ]);
    }
}
