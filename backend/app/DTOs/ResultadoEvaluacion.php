<?php

namespace App\DTOs;

final class ResultadoEvaluacion
{
    public function __construct(
        public readonly float $total_normal,
        public readonly float $total_penalizacion,
        public readonly float $nota_final,
        /** @var array<int, DetalleSegmento> */
        public readonly array $detalle_segmentos = [],
    ) {}

    public static function calcular(float $totalNormal, float $totalPenalizacion, array $detalleSegmentos = []): self
    {
        $notaFinal = max(0, $totalNormal - $totalPenalizacion);

        return new self(
            total_normal:       round($totalNormal, 2),
            total_penalizacion: round($totalPenalizacion, 2),
            nota_final:         round($notaFinal, 2),
            detalle_segmentos:  $detalleSegmentos,
        );
    }

    public function toArray(): array
    {
        return [
            'total_normal'       => $this->total_normal,
            'total_penalizacion' => $this->total_penalizacion,
            'nota_final'         => $this->nota_final,
            'detalle_segmentos'  => array_map(fn($d) => $d->toArray(), $this->detalle_segmentos),
        ];
    }
}
