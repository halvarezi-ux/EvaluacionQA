<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Http\Resources\RoleResource;

/**
 * Controller para gestión de roles.
 * 
 * Por ahora solo implementa lectura (index, show).
 * Los roles se gestionan mediante seeders, no se crean/editan desde la app.
 * 
 * Esto es común en sistemas donde los roles son fijos:
 * - Admin, QA Lead, QA, Analista, Asesor
 * 
 * En el futuro se puede extender a CRUD completo si es necesario.
 */
class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * GET /api/roles
     * 
     * Retorna todos los roles disponibles.
     * Útil para formularios de selección de rol al crear/editar usuarios.
     */
    public function index()
    {
        // Obtener roles activos
        $roles = Role::where('active', true)->get();
        
        return RoleResource::collection($roles);
    }

    /**
     * Display the specified resource.
     * 
     * GET /api/roles/{id}
     * 
     * Retorna un rol específico por su ID.
     * 
     * @param  int  $id
     */
    public function show($id)
    {
        // Buscar rol con count de usuarios
        $role = Role::withCount('users')->findOrFail($id);
        
        return new RoleResource($role);
    }
}
