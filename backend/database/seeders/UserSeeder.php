<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('nombre', 'Admin')->first();

        User::create([
            'name' => 'Administrador',
            'email' => 'admin@qa.com',
            'password' => Hash::make('admin123'),
            'role_id' => $adminRole->id,
            'active' => true
        ]);
    }
}