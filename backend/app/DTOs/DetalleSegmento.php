<?php

namespace App\DTOs;

final class DetalleSegmento
{
    public function __construct(
        public readonly int    $segmento_id,
        public readonly string $nombre,
        public readonly string $tipo,
        public readonly float  $puntaje_obtenido,
        public readonly bool   $fue_anulado,
        public readonly bool   $aplico_penalizacion,
    ) {}

    public function toArray(): array
    {
        return [
            'segmento_id'          => $this->segmento_id,
            'nombre'               => $this->nombre,
            'tipo'                 => $this->tipo,
            'puntaje_obtenido'     => $this->puntaje_obtenido,
            'fue_anulado'          => $this->fue_anulado,
            'aplico_penalizacion'  => $this->aplico_penalizacion,
        ];
    }
}
