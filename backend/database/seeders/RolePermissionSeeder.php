<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Permissions
        $permissions = [
            // User permissions
            ['name' => 'View Users', 'slug' => 'users.view', 'module' => 'users'],
            ['name' => 'Create Users', 'slug' => 'users.create', 'module' => 'users'],
            ['name' => 'Edit Users', 'slug' => 'users.edit', 'module' => 'users'],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'module' => 'users'],

            // Role permissions
            ['name' => 'View Roles', 'slug' => 'roles.view', 'module' => 'roles'],
            ['name' => 'Create Roles', 'slug' => 'roles.create', 'module' => 'roles'],
            ['name' => 'Edit Roles', 'slug' => 'roles.edit', 'module' => 'roles'],
            ['name' => 'Delete Roles', 'slug' => 'roles.delete', 'module' => 'roles'],

            // Form permissions
            ['name' => 'View Forms', 'slug' => 'forms.view', 'module' => 'forms'],
            ['name' => 'Create Forms', 'slug' => 'forms.create', 'module' => 'forms'],
            ['name' => 'Edit Forms', 'slug' => 'forms.edit', 'module' => 'forms'],
            ['name' => 'Delete Forms', 'slug' => 'forms.delete', 'module' => 'forms'],

            // Evaluation permissions
            ['name' => 'View Evaluations', 'slug' => 'evaluations.view', 'module' => 'evaluations'],
            ['name' => 'Create Evaluations', 'slug' => 'evaluations.create', 'module' => 'evaluations'],
            ['name' => 'Edit Evaluations', 'slug' => 'evaluations.edit', 'module' => 'evaluations'],
            ['name' => 'Delete Evaluations', 'slug' => 'evaluations.delete', 'module' => 'evaluations'],
            ['name' => 'Submit Evaluations', 'slug' => 'evaluations.submit', 'module' => 'evaluations'],

            // Feedback permissions
            ['name' => 'View Feedback', 'slug' => 'feedback.view', 'module' => 'feedback'],
            ['name' => 'Create Feedback', 'slug' => 'feedback.create', 'module' => 'feedback'],
            ['name' => 'Edit Feedback', 'slug' => 'feedback.edit', 'module' => 'feedback'],
            ['name' => 'Delete Feedback', 'slug' => 'feedback.delete', 'module' => 'feedback'],

            // Metrics permissions
            ['name' => 'View Dashboard', 'slug' => 'dashboard.view', 'module' => 'dashboard'],
            ['name' => 'View Metrics', 'slug' => 'metrics.view', 'module' => 'metrics'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Create Roles
        $adminRole = Role::create([
            'name' => 'Administrator',
            'slug' => 'admin',
            'description' => 'Full access to all features',
            'is_active' => true,
        ]);

        $managerRole = Role::create([
            'name' => 'Manager',
            'slug' => 'manager',
            'description' => 'Can manage evaluations and view reports',
            'is_active' => true,
        ]);

        $evaluatorRole = Role::create([
            'name' => 'Evaluator',
            'slug' => 'evaluator',
            'description' => 'Can perform evaluations',
            'is_active' => true,
        ]);

        $userRole = Role::create([
            'name' => 'User',
            'slug' => 'user',
            'description' => 'Basic user access',
            'is_active' => true,
        ]);

        // Assign all permissions to Admin
        $adminRole->permissions()->attach(Permission::all());

        // Assign specific permissions to Manager
        $managerPermissions = Permission::whereIn('module', [
            'forms', 'evaluations', 'feedback', 'dashboard', 'metrics'
        ])->pluck('id');
        $managerRole->permissions()->attach($managerPermissions);

        // Assign specific permissions to Evaluator
        $evaluatorPermissions = Permission::whereIn('slug', [
            'forms.view',
            'evaluations.view',
            'evaluations.create',
            'evaluations.submit',
            'feedback.view',
            'feedback.create',
            'dashboard.view',
        ])->pluck('id');
        $evaluatorRole->permissions()->attach($evaluatorPermissions);

        // Assign basic permissions to User
        $userPermissions = Permission::whereIn('slug', [
            'dashboard.view',
            'feedback.view',
        ])->pluck('id');
        $userRole->permissions()->attach($userPermissions);

        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@evaluacionqa.com',
            'password' => Hash::make('password'),
            'department' => 'Administration',
            'position' => 'System Administrator',
            'is_active' => true,
        ]);
        $admin->roles()->attach($adminRole);

        // Create Manager User
        $manager = User::create([
            'name' => 'Manager User',
            'email' => 'manager@evaluacionqa.com',
            'password' => Hash::make('password'),
            'department' => 'Quality Assurance',
            'position' => 'QA Manager',
            'is_active' => true,
        ]);
        $manager->roles()->attach($managerRole);

        // Create Evaluator User
        $evaluator = User::create([
            'name' => 'Evaluator User',
            'email' => 'evaluator@evaluacionqa.com',
            'password' => Hash::make('password'),
            'department' => 'Quality Assurance',
            'position' => 'QA Evaluator',
            'is_active' => true,
        ]);
        $evaluator->roles()->attach($evaluatorRole);
    }
}
