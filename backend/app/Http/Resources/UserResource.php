<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource para el modelo User.
 * 
 * Transforma el modelo User a un formato JSON consistente y seguro.
 * 
 * Características:
 * - No expone password ni tokens sensibles
 * - Transforma el role_id en el nombre del rol (string)
 * - Convierte active a boolean real
 * - Solo incluye campos necesarios para el frontend
 * 
 * Uso:
 * return new UserResource($user);                    // Un usuario
 * return UserResource::collection($users);           // Colección de usuarios
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Información básica
            'id' => $this->id,
            'name' => $this->name,
            'user' => $this->user,
            'email' => $this->email,
            
            // ID del rol para formularios
            'role_id' => $this->role_id,
            
            // Rol completo (objeto con id, nombre, active)
            // Si la relación 'role' está cargada, retorna el objeto completo
            // Si no está cargada, retorna null (evita N+1 queries)
            'role' => $this->when(
                $this->relationLoaded('role'),
                function() {
                    return $this->role ? [
                        'id' => $this->role->id,
                        'nombre' => $this->role->nombre,
                        'active' => (bool) $this->role->active
                    ] : null;
                }
            ),
            
            // Estado (convertido a boolean real)
            'active' => (bool) $this->active,
            
            // Timestamps (opcional, útil para auditoría)
            // Puedes comentar estas líneas si el frontend no las necesita
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            
            // Nota: NO incluimos password, remember_token, email_verified_at
            // por razones de seguridad
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * Esto agrega metadata a la respuesta cuando se usa collection()
     *
     * @return array<string, mixed>
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'version' => '1.0',
                'timestamp' => now()->toISOString()
            ]
        ];
    }
}
