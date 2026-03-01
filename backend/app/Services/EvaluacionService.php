<?php

namespace App\Services;

use App\DTOs\DetalleSegmento;
use App\DTOs\ResultadoEvaluacion;
use App\Enums\TipoSegmento;
use App\Models\Evaluacion;
use App\Models\Respuesta;
use Illuminate\Support\Facades\DB;

class EvaluacionService
{
    /**
     * Calcula la nota final de una evaluación dado el set de respuestas proporcionado.
     *
     * La lógica es:
     *  • Segmentos NORMAL   → suma puntajes; si una pregunta con anula_segmento=true falla → subtotal=0
     *  • Segmentos CRÍTICO  → si cualquier pregunta falla → acumula penalizacion (solo una vez por segmento)
     *  • Segmentos RESUMEN  → ignorados, no afectan nota
     *  • nota_final = max(0, total_normal - total_penalizacion)
     *
     * @param  Evaluacion $evaluacion  Con relaciones version.segmentos.preguntas + respuestas cargadas
     * @param  array      $respuestas  Mapa [pregunta_id => ['valor' => string, 'comentario' => ?string]]
     */
    public function calcular(Evaluacion $evaluacion, array $respuestas): ResultadoEvaluacion
    {
        $totalNormal      = 0.0;
        $totalPenalizacion = 0.0;
        $detalleSegmentos  = [];

        $version = $evaluacion->version->load('segmentos.preguntas');

        foreach ($version->segmentos as $segmento) {

            if ($segmento->tipo === TipoSegmento::Resumen) {
                continue;
            }

            if ($segmento->tipo === TipoSegmento::Normal) {
                [$subtotal, $fueAnulado] = $this->calcularSegmentoNormal($segmento, $respuestas);
                $totalNormal += $subtotal;

                $detalleSegmentos[] = new DetalleSegmento(
                    segmento_id:         $segmento->id,
                    nombre:              $segmento->nombre,
                    tipo:                $segmento->tipo->value,
                    puntaje_obtenido:    round($subtotal, 2),
                    fue_anulado:         $fueAnulado,
                    aplico_penalizacion: false,
                );
            }

            if ($segmento->tipo === TipoSegmento::Critico) {
                [$penalizacion, $aplico] = $this->calcularSegmentoCritico($segmento, $respuestas);
                $totalPenalizacion += $penalizacion;

                $detalleSegmentos[] = new DetalleSegmento(
                    segmento_id:         $segmento->id,
                    nombre:              $segmento->nombre,
                    tipo:                $segmento->tipo->value,
                    puntaje_obtenido:    0,
                    fue_anulado:         false,
                    aplico_penalizacion: $aplico,
                );
            }
        }

        return ResultadoEvaluacion::calcular($totalNormal, $totalPenalizacion, $detalleSegmentos);
    }

    /**
     * Guarda la evaluación completa en base de datos dentro de una transacción.
     * Calcula la nota, persiste respuestas e imputa el resultado.
     *
     * @param  array $data     Datos validados de StoreEvaluacionRequest
     * @param  int   $userId   ID del evaluador autenticado
     */
    public function guardar(array $data, int $userId): Evaluacion
    {
        return DB::transaction(function () use ($data, $userId) {
            // 1. Crear la evaluación en borrador
            $evaluacion = Evaluacion::create([
                'boleta_version_id' => $data['boleta_version_id'],
                'area_id'           => $data['area_id'] ?? null,
                'evaluador_id'      => $userId,
                'agente_nombre'     => $data['agente_nombre'] ?? null,
                'estado'            => 'borrador',
            ]);

            // 2. Construir mapa de respuestas
            $mapaRespuestas = collect($data['respuestas'])->keyBy('pregunta_id')->map(fn($r) => [
                'valor'      => $r['respuesta_valor'],
                'comentario' => $r['comentario'] ?? null,
            ])->toArray();

            // 3. Calcular resultado
            $resultado = $this->calcular($evaluacion, $mapaRespuestas);

            // 4. Persistir respuestas
            $respuestasBulk = [];
            foreach ($data['respuestas'] as $item) {
                $respuestasBulk[] = [
                    'evaluacion_id'    => $evaluacion->id,
                    'pregunta_id'      => $item['pregunta_id'],
                    'respuesta_valor'  => $item['respuesta_valor'],
                    'puntaje_obtenido' => $mapaRespuestas[$item['pregunta_id']] !== null
                        ? $this->calcularPuntajeRespuesta($evaluacion, $item)
                        : 0,
                    'comentario'       => $item['comentario'] ?? null,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
            }
            Respuesta::insert($respuestasBulk);

            // 5. Actualizar evaluación con resultado final
            $evaluacion->update([
                'total_normal'       => $resultado->total_normal,
                'total_penalizacion' => $resultado->total_penalizacion,
                'nota_final'         => $resultado->nota_final,
                'estado'             => 'completada',
            ]);

            return $evaluacion->fresh(['version', 'area', 'evaluador', 'respuestas']);
        });
    }

    // ─── Privados ────────────────────────────────────────────────────────────

    /**
     * Calcula el subtotal de un segmento normal.
     * @return array{float, bool} [subtotal, fue_anulado]
     */
    private function calcularSegmentoNormal($segmento, array $respuestas): array
    {
        $subtotal   = 0.0;
        $fueAnulado = false;

        foreach ($segmento->preguntas as $pregunta) {
            $respuestaValor = $respuestas[$pregunta->id]['valor'] ?? null;

            if ($respuestaValor === null) {
                continue;
            }

            // Si anula_segmento y falla → segmento vale 0
            if ($pregunta->anula_segmento && $pregunta->fallo($respuestaValor)) {
                $fueAnulado = true;
                $subtotal   = 0.0;
                break;
            }

            $subtotal += $pregunta->calcularPuntaje($respuestaValor);
        }

        return [$subtotal, $fueAnulado];
    }

    /**
     * Determina si un segmento crítico aplica penalización.
     * @return array{float, bool} [penalizacion_aplicada, aplico]
     */
    private function calcularSegmentoCritico($segmento, array $respuestas): array
    {
        foreach ($segmento->preguntas as $pregunta) {
            $respuestaValor = $respuestas[$pregunta->id]['valor'] ?? null;

            if ($respuestaValor === null) {
                continue;
            }

            if ($pregunta->fallo($respuestaValor)) {
                // Penalización se aplica solo UNA VEZ por segmento crítico
                return [(float) $segmento->penalizacion, true];
            }
        }

        return [0.0, false];
    }

    /** Calcula el puntaje individual de una respuesta para persistir en la tabla respuestas */
    private function calcularPuntajeRespuesta(Evaluacion $evaluacion, array $item): float
    {
        $pregunta = \App\Models\Pregunta::find($item['pregunta_id']);
        if (! $pregunta) {
            return 0;
        }
        return $pregunta->calcularPuntaje($item['respuesta_valor']);
    }
}
