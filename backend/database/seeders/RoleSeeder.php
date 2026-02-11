<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'Admin',
            'QA Lead',
            'QA',
            'Analista',
            'Asesor'
        ];

        foreach ($roles as $rol) {
            Role::create(['nombre' => $rol, 'active' => true]);
        }
    }
}