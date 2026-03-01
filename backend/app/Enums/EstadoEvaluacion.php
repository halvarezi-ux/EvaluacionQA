<?php

namespace App\Enums;

/**
 * Lección: Enums tipados en PHP 8.1+
 *
 * Usar un Enum en lugar de strings mágicos ('borrador', 'completada') ofrece:
 * - Autocompletado en el IDE
 * - Errores de compilación si escribes mal el valor (typo)
 * - Métodos de dominio centralizados (label, esFinal, etc.)
 * - Consistencia con EstadoBoleta que ya sigue este patrón
 *
 * Los Backed Enums (': string') serializan directamente a su valor raw
 * en la base de datos gracias al cast del modelo.
 */
enum EstadoEvaluacion: string
{
    case Borrador   = 'borrador';
    case Completada = 'completada';

    /**
     * Etiqueta legible para mostrar en UI o reportes.
     */
    public function label(): string
    {
        return match($this) {
            self::Borrador   => 'Borrador',
            self::Completada => 'Completada',
        };
    }

    /**
     * Indica si la evaluación ya no puede modificarse.
     * Una evaluación completada es inmutable por diseño del sistema.
     */
    public function esFinal(): bool
    {
        return $this === self::Completada;
    }
}
