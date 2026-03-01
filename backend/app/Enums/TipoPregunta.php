<?php

namespace App\Enums;

enum TipoPregunta: string
{
    case SiNo          = 'si_no';
    case OpcionMultiple = 'opcion_multiple';
    case Porcentaje    = 'porcentaje';
    case Numerica      = 'numerica';
    case Checklist     = 'checklist';
    case TextoLibre    = 'texto_libre';

    public function label(): string
    {
        return match($this) {
            self::SiNo           => 'Sí / No',
            self::OpcionMultiple => 'Opción Múltiple',
            self::Porcentaje     => 'Porcentaje',
            self::Numerica       => 'Numérica',
            self::Checklist      => 'Checklist',
            self::TextoLibre     => 'Texto Libre',
        };
    }

    /** Tipos que suben puntos al segmento */
    public function sumaPuntos(): bool
    {
        return ! in_array($this, [self::TextoLibre]);
    }

    /** Tipos que requieren opciones configuradas */
    public function requiereOpciones(): bool
    {
        return in_array($this, [self::OpcionMultiple, self::Checklist]);
    }

    /**
     * Calcula el puntaje obtenido dado el valor de respuesta y el peso de la pregunta.
     * Para si_no: "si" = peso, "no" = 0.
     * Para porcentaje / numerica: se interpreta como porcentaje aplicado al peso.
     * Para opcion_multiple / checklist: el valor ya es el puntaje calculado (viene de la opción).
     * Para texto_libre: siempre 0.
     */
    public function calcularPuntaje(string $respuestaValor, float $peso): float
    {
        return match($this) {
            self::SiNo           => strtolower($respuestaValor) === 'si' ? $peso : 0,
            self::Porcentaje,
            self::Numerica       => ($peso * min(max((float) $respuestaValor, 0), 100)) / 100,
            self::OpcionMultiple,
            self::Checklist      => (float) $respuestaValor,
            self::TextoLibre     => 0,
        };
    }
}
