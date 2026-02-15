<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed de usuarios de prueba
     * Crea un usuario por cada rol para testing
     */
    public function run(): void
    {
        // Array de usuarios de prueba con sus roles
        $users = [
            [
                'name' => 'Administrador del Sistema',
                'user' => 'admin',
                'email' => 'admin@evaluacionqa.com',
                'password' => 'admin123',
                'role' => 'Admin'
            ],
            [
                'name' => 'Líder QA',
                'user' => 'qalead',
                'email' => 'qalead@evaluacionqa.com',
                'password' => 'qalead123',
                'role' => 'QA Lead'
            ],
            [
                'name' => 'Evaluador QA',
                'user' => 'qauser',
                'email' => 'qa@evaluacionqa.com',
                'password' => 'qa123456',
                'role' => 'QA'
            ],
            [
                'name' => 'Analista de Métricas',
                'user' => 'analista',
                'email' => 'analista@evaluacionqa.com',
                'password' => 'analista123',
                'role' => 'Analista'
            ],
            [
                'name' => 'Asesor de Atención',
                'user' => 'asesor',
                'email' => 'asesor@evaluacionqa.com',
                'password' => 'asesor123',
                'role' => 'Asesor'
            ]
        ];

        // Crear cada usuario
        foreach ($users as $userData) {
            $role = Role::where('nombre', $userData['role'])->first();

            if ($role) {
                User::create([
                    'name' => $userData['name'],
                    'user' => $userData['user'],
                    'email' => $userData['email'],
                    'password' => Hash::make($userData['password']),
                    'role_id' => $role->id,
                    'active' => true
                ]);
            }
        }
    }
}