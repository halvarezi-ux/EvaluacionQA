<?php

namespace App\Http\Controllers;

use App\Models\Segmento;
use App\Models\Pregunta;
use App\Models\PreguntaOpcion;
use App\Http\Requests\StorePreguntaRequest;
use App\Http\Resources\PreguntaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PreguntaController extends Controller
{
    /**
     * GET /segmentos/{segmento}/preguntas
     * Lista todas las preguntas de un segmento con sus opciones.
     */
    public function index(string $segmentoId): JsonResponse
    {
        $segmento = Segmento::findOrFail($segmentoId);

        $preguntas = $segmento->preguntas()->with('opciones')->get();

        return response()->json([
            'data' => PreguntaResource::collection($preguntas),
        ]);
    }

    /**
     * POST /segmentos/{segmento}/preguntas
     * Crea una pregunta en el segmento. Si tiene opciones, las crea también.
     */
    public function store(StorePreguntaRequest $request, string $segmentoId): JsonResponse
    {
        $segmento = Segmento::with('version')->findOrFail($segmentoId);

        if (!$segmento->version->esEditable()) {
            return response()->json([
                'message' => 'Esta versión ya no es editable',
            ], 422);
        }

        $pregunta = DB::transaction(function () use ($request, $segmento) {
            $orden = $segmento->preguntas()->max('orden') + 1;

            $pregunta = $segmento->preguntas()->create([
                ...$request->safe()->except('opciones'),
                'orden' => $orden,
            ]);

            if ($request->filled('opciones')) {
                foreach ($request->opciones as $index => $opcionData) {
                    $pregunta->opciones()->create([
                        'texto'  => $opcionData['texto'],
                        'valor'  => $opcionData['valor'],
                        'orden'  => $opcionData['orden'] ?? ($index + 1),
                    ]);
                }
            }

            return $pregunta;
        });

        return response()->json([
            'data'    => new PreguntaResource($pregunta->load('opciones')),
            'message' => 'Pregunta creada correctamente',
        ], 201);
    }

    /**
     * GET /preguntas/{id}
     */
    public function show(string $id): JsonResponse
    {
        $pregunta = Pregunta::with('opciones')->findOrFail($id);

        return response()->json([
            'data' => new PreguntaResource($pregunta),
        ]);
    }

    /**
     * PUT /preguntas/{id}
     * Actualiza la pregunta y reemplaza completamente sus opciones (si las tiene).
     */
    public function update(StorePreguntaRequest $request, string $id): JsonResponse
    {
        $pregunta = Pregunta::with(['segmento.version', 'opciones'])->findOrFail($id);

        if (!$pregunta->segmento->version->esEditable()) {
            return response()->json([
                'message' => 'Esta versión ya no es editable',
            ], 422);
        }

        DB::transaction(function () use ($request, $pregunta) {
            $pregunta->update($request->safe()->except('opciones'));

            // Reemplazar opciones si están presentes en el request
            if ($request->has('opciones')) {
                $pregunta->opciones()->delete();

                foreach ($request->opciones as $index => $opcionData) {
                    $pregunta->opciones()->create([
                        'texto'  => $opcionData['texto'],
                        'valor'  => $opcionData['valor'],
                        'orden'  => $opcionData['orden'] ?? ($index + 1),
                    ]);
                }
            }
        });

        return response()->json([
            'data'    => new PreguntaResource($pregunta->load('opciones')),
            'message' => 'Pregunta actualizada correctamente',
        ]);
    }

    /**
     * DELETE /preguntas/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $pregunta = Pregunta::with('segmento.version')->findOrFail($id);

        if (!$pregunta->segmento->version->esEditable()) {
            return response()->json([
                'message' => 'Esta versión ya no es editable',
            ], 422);
        }

        $pregunta->delete();

        return response()->json([
            'message' => 'Pregunta eliminada correctamente',
        ]);
    }
}
