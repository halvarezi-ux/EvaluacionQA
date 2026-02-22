<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para verificar que el usuario autenticado tenga uno de los roles permitidos.
 * 
 * Uso en rutas:
 * Route::get('/users', [UserController::class, 'index'])->middleware('role:Admin');
 * Route::get('/metrics', [MetricController::class, 'index'])->middleware('role:Admin,Analista');
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Roles permitidos (uno o más)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Verificar que el usuario esté autenticado
        if (!$request->user()) {
            return response()->json([
                'message' => 'No autenticado'
            ], 401);
        }

        // Obtener el rol del usuario (con eager loading desde el controller o aquí)
        $user = $request->user();
        
        // Cargar la relación 'role' si no está cargada
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        // Verificar que el usuario tenga un rol asignado
        if (!$user->role) {
            return response()->json([
                'message' => 'Usuario sin rol asignado'
            ], 403);
        }

        $userRole = $user->role->nombre;

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'No autorizado. Requiere uno de estos roles: ' . implode(', ', $roles),
                'user_role' => $userRole,
                'required_roles' => $roles
            ], 403);
        }

        // Usuario autorizado, continuar con la request
        return $next($request);
    }
}
