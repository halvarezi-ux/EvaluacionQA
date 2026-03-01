<?php

namespace App\Actions;

use App\Models\BoletaVersion;
use Illuminate\Support\Facades\DB;

class ClonarVersionAction
{
    /**
     * Clona una versión activa creando una nueva con número incrementado.
     *
     * Deep clone: boleta_version → segmentos → preguntas → opciones
     * La nueva versión queda como es_activa=true y la anterior como false.
     *
     * @param  BoletaVersion $versionOrigen  La versión a clonar
     * @return BoletaVersion                 La nueva versión clonada y activa
     */
    public function execute(BoletaVersion $versionOrigen): BoletaVersion
    {
        return DB::transaction(function () use ($versionOrigen) {

            // 1. Desactivar versión origen
            $versionOrigen->update(['es_activa' => false]);

            // 2. Crear nueva versión con numero_version + 1
            $nuevaVersion = BoletaVersion::create([
                'boleta_id'      => $versionOrigen->boleta_id,
                'numero_version' => $versionOrigen->numero_version + 1,
                'es_activa'      => true,
            ]);

            // 3. Clonar áreas (pivot)
            $areaIds = $versionOrigen->areas()->pluck('areas.id')->toArray();
            $nuevaVersion->areas()->sync($areaIds);

            // 4. Clonar segmentos (con sus preguntas y opciones)
            $segmentos = $versionOrigen->segmentos()->with('preguntas.opciones')->get();

            foreach ($segmentos as $segmento) {
                $nuevoSegmento = $nuevaVersion->segmentos()->create([
                    'nombre'       => $segmento->nombre,
                    'tipo'         => $segmento->tipo->value,
                    'peso'         => $segmento->peso,
                    'penalizacion' => $segmento->penalizacion,
                    'orden'        => $segmento->orden,
                ]);

                foreach ($segmento->preguntas as $pregunta) {
                    $nuevaPregunta = $nuevoSegmento->preguntas()->create([
                        'texto'                => $pregunta->texto,
                        'tipo'                 => $pregunta->tipo->value,
                        'peso'                 => $pregunta->peso,
                        'anula_segmento'       => $pregunta->anula_segmento,
                        'comentario_requerido' => $pregunta->comentario_requerido->value,
                        'orden'                => $pregunta->orden,
                    ]);

                    foreach ($pregunta->opciones as $opcion) {
                        $nuevaPregunta->opciones()->create([
                            'texto'  => $opcion->texto,
                            'valor'  => $opcion->valor,
                            'orden'  => $opcion->orden,
                        ]);
                    }
                }
            }

            return $nuevaVersion->fresh(['segmentos.preguntas.opciones', 'areas']);
        });
    }
}
