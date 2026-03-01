<?php

namespace App\Enums;

enum TipoSegmento: string
{
    case Normal  = 'normal';
    case Critico = 'critico';
    case Resumen = 'resumen';

    public function label(): string
    {
        return match($this) {
            self::Normal  => 'Normal (suma puntos)',
            self::Critico => 'Crítico (penaliza)',
            self::Resumen => 'Resumen (solo texto)',
        };
    }

    /** Indica si este tipo afecta la nota final */
    public function afectaNota(): bool
    {
        return $this !== self::Resumen;
    }

    /** Indica si este tipo requiere el campo "peso" */
    public function requierePeso(): bool
    {
        return $this === self::Normal;
    }

    /** Indica si este tipo requiere el campo "penalizacion" */
    public function requierePenalizacion(): bool
    {
        return $this === self::Critico;
    }
}
