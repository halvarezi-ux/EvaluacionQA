<?php

namespace App\Enums;

enum EstadoBoleta: string
{
    case Draft     = 'draft';
    case Activa    = 'activa';
    case Archivada = 'archivada';

    public function label(): string
    {
        return match($this) {
            self::Draft     => 'Borrador',
            self::Activa    => 'Activa',
            self::Archivada => 'Archivada',
        };
    }

    public function esEditable(): bool
    {
        return $this === self::Draft;
    }
}
