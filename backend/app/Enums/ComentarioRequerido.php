<?php

namespace App\Enums;

enum ComentarioRequerido: string
{
    case Nunca     = 'nunca';
    case Siempre   = 'siempre';
    case SiEsNo    = 'si_es_no';
    case SiEsSi    = 'si_es_si';
    case SiPenaliza = 'si_penaliza';

    public function label(): string
    {
        return match($this) {
            self::Nunca      => 'Nunca',
            self::Siempre    => 'Siempre',
            self::SiEsNo     => 'Si la respuesta es No',
            self::SiEsSi     => 'Si la respuesta es Sí',
            self::SiPenaliza => 'Si penaliza',
        };
    }

    /**
     * Determina si el comentario es requerido dada la respuesta y si hubo penalización.
     */
    public function esRequerido(string $respuestaValor, bool $penaliza = false): bool
    {
        $respuesta = strtolower(trim($respuestaValor));

        return match($this) {
            self::Nunca      => false,
            self::Siempre    => true,
            self::SiEsNo     => in_array($respuesta, ['no', '0', 'false']),
            self::SiEsSi     => in_array($respuesta, ['si', 'sí', '1', 'true']),
            self::SiPenaliza => $penaliza,
        };
    }
}
