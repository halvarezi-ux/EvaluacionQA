<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['nombre' => 'Atención al Cliente', 'activa' => true],
            ['nombre' => 'Soporte Técnico', 'activa' => true],
            ['nombre' => 'Ventas', 'activa' => true],
            ['nombre' => 'Cobranza', 'activa' => true],
            ['nombre' => 'Retención', 'activa' => true],
        ];

        foreach ($areas as $area) {
            DB::table('areas')->insertOrIgnore([
                'nombre'     => $area['nombre'],
                'activa'     => $area['activa'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
