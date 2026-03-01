<?php

namespace App\Services;

use App\Models\BoletaVersion;
use App\Models\Segmento;
use Illuminate\Validation\ValidationException;

class ValidacionEstructuraService
{
    /**
     * Valida que la suma de pesos de los segmentos NORMALES sea igual al total_global de la boleta.
     * Lanza ValidationException si no es válido.
     */
    public function validarSumaSegmentos(BoletaVersion $version): void
    {
        $boleta      = $version->boleta;
        $totalGlobal = (float) $boleta->total_global;

        $sumaSegmentosNormales = (float) $version->segmentos()
            ->where('tipo', 'normal')
            ->whereNotNull('peso')
            ->sum('peso');

        if (abs($sumaSegmentosNormales - $totalGlobal) > 0.01) {
            throw ValidationException::withMessages([
                'segmentos' => "La suma de pesos de segmentos normales ({$sumaSegmentosNormales}) debe ser igual al total global ({$totalGlobal}).",
            ]);
        }
    }

    /**
     * Valida que la suma de pesos de preguntas de un segmento normal sea igual al peso del segmento.
     */
    public function validarSumaPreguntas(Segmento $segmento): void
    {
        if ($segmento->tipo->value !== 'normal') {
            return; // Solo aplica a segmentos normales
        }

        $pesoSegmento = (float) $segmento->peso;

        $sumaPreguntas = (float) $segmento->preguntas()
            ->whereNotNull('peso')
            ->sum('peso');

        if ($sumaPreguntas > 0 && abs($sumaPreguntas - $pesoSegmento) > 0.01) {
            throw ValidationException::withMessages([
                'preguntas' => "La suma de pesos de preguntas ({$sumaPreguntas}) debe ser igual al peso del segmento ({$pesoSegmento}).",
            ]);
        }
    }

    /**
     * Distribuye automáticamente el peso del segmento entre sus preguntas de forma equitativa.
     */
    public function distribuirPesosEquitativamente(Segmento $segmento): void
    {
        $preguntas = $segmento->preguntas()->get();
        $cantidad  = $preguntas->count();

        if ($cantidad === 0) {
            return;
        }

        $pesoPorPregunta = round((float) $segmento->peso / $cantidad, 2);
        $resto           = round((float) $segmento->peso - ($pesoPorPregunta * $cantidad), 2);

        foreach ($preguntas as $index => $pregunta) {
            // Si hay decimales residuales, ajustarlos a la primera pregunta
            $pesoFinal = $index === 0
                ? round($pesoPorPregunta + $resto, 2)
                : $pesoPorPregunta;

            $pregunta->update(['peso' => $pesoFinal]);
        }
    }
}
