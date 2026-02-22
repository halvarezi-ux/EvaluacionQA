<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

/**
 * Controller para gestión de usuarios.
 * 
 * Implementa CRUD completo con:
 * - Validación mediante Form Requests
 * - Autorización mediante Middleware y Policies
 * - Respuestas estandarizadas con API Resources
 * 
 * Rutas protegidas con middleware: auth:sanctum y role:Admin
 */
class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * GET /api/users
     * 
     * Retorna todos los usuarios con sus roles.
     * Usa eager loading para evitar N+1 queries.
     */
    public function index()
    {
        // Eager loading de la relación 'role' para optimizar
        $users = User::with('role')->get();
        
        // Retornar colección de recursos
        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     * 
     * POST /api/users
     * 
     * Crea un nuevo usuario con los datos validados.
     * La validación y autorización ya fueron ejecutadas por StoreUserRequest.
     * 
     * @param  \App\Http\Requests\StoreUserRequest  $request
     */
    public function store(StoreUserRequest $request)
    {
        // Obtener solo los datos validados
        $validated = $request->validated();
        
        // Hash del password antes de guardar
        // IMPORTANTE: Nunca guardar passwords en texto plano
        $validated['password'] = Hash::make($validated['password']);
        
        // Crear el usuario
        $user = User::create($validated);
        
        // Cargar la relación 'role' para el resource
        $user->load('role');
        
        // Retornar el usuario creado con status 201 Created
        return (new UserResource($user))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     * 
     * GET /api/users/{id}
     * 
     * Retorna un usuario específico por su ID.
     * 
     * @param  int  $id
     */
    public function show($id)
    {
        // Buscar usuario con su rol
        $user = User::with('role')->findOrFail($id);
        
        // findOrFail() automáticamente retorna 404 si no existe
        // No necesitamos validar manualmente
        
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     * 
     * PUT/PATCH /api/users/{id}
     * 
     * Actualiza un usuario existente.
     * Solo actualiza los campos enviados (gracias a 'sometimes' en UpdateUserRequest).
     * 
     * @param  \App\Http\Requests\UpdateUserRequest  $request
     * @param  int  $id
     */
    public function update(UpdateUserRequest $request, $id)
    {
        // Buscar el usuario
        $user = User::findOrFail($id);
        
        // Obtener datos validados
        $validated = $request->validated();
        
        // Si se envió un nuevo password, hashearlo
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }
        
        // Actualizar el usuario
        // Solo actualiza los campos presentes en $validated
        $user->update($validated);
        
        // Recargar el modelo con la relación
        $user->load('role');
        
        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     * 
     * DELETE /api/users/{id}
     * 
     * Elimina un usuario de la base de datos.
     * 
     * Consideraciones:
     * - En producción, considera usar "soft deletes" en vez de eliminar
     * - Verifica que no sea el propio usuario quien se elimina
     * 
     * @param  int  $id
     */
    public function destroy($id)
    {
        // Buscar el usuario
        $user = User::findOrFail($id);
        
        // Prevenir que el admin se elimine a sí mismo
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'No puedes eliminar tu propia cuenta'
            ], Response::HTTP_FORBIDDEN);
        }
        
        // Eliminar el usuario
        $user->delete();
        
        // Retornar respuesta 204 No Content (estándar REST para deletes exitosos)
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
