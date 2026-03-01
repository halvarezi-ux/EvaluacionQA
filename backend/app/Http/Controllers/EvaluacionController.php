<?php

namespace App\Http\Controllers;

use App\Models\Evaluacion;
use App\Http\Requests\StoreEvaluacionRequest;
use App\Http\Resources\EvaluacionResource;
use App\Services\EvaluacionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EvaluacionController extends Controller
{
    public function __construct(
        private readonly EvaluacionService $evaluacionService,
    ) {}

    /**
     * GET /evaluaciones
     * Lista evaluaciones con filtros: area_id, boleta_version_id, evaluador_id, estado.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Evaluacion::with(['area', 'evaluador', 'version.boleta']);

        if ($request->filled('area_id')) {
            $query->where('area_id', $request->area_id);
        }
        if ($request->filled('boleta_version_id')) {
            $query->where('boleta_version_id', $request->boleta_version_id);
        }
        if ($request->filled('evaluador_id')) {
            $query->where('evaluador_id', $request->evaluador_id);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('agente_nombre')) {
            $query->where('agente_nombre', 'like', '%' . $request->agente_nombre . '%');
        }

        $evaluaciones = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'data' => EvaluacionResource::collection($evaluaciones),
            'meta' => [
                'current_page' => $evaluaciones->currentPage(),
                'last_page'    => $evaluaciones->lastPage(),
                'per_page'     => $evaluaciones->perPage(),
                'total'        => $evaluaciones->total(),
            ],
        ]);
    }

    /**
     * POST /evaluaciones
     * Registra una nueva evaluación. El backend calcula nota_final exclusivamente.
     */
    public function store(StoreEvaluacionRequest $request): JsonResponse
    {
        $evaluacion = $this->evaluacionService->guardar(
            $request->validated(),
            $request->user()->id,
        );

        return response()->json([
            'data'    => new EvaluacionResource($evaluacion->load(['area', 'evaluador', 'respuestas.pregunta', 'version'])),
            'message' => 'Evaluación registrada correctamente',
        ], 201);
    }

    /**
     * GET /evaluaciones/{id}
     * Retorna evaluación completa con respuestas, área, evaluador y nivel de calidad.
     */
    public function show(string $id): JsonResponse
    {
        $evaluacion = Evaluacion::with([
            'area',
            'evaluador',
            'version.boleta',
            'version.segmentos.preguntas',
            'respuestas.pregunta',
        ])->findOrFail($id);

        return response()->json([
            'data' => new EvaluacionResource($evaluacion),
        ]);
    }
}
