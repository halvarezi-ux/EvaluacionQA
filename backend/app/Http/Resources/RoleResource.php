<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource para el modelo Role.
 * 
 * Transforma el modelo Role a un formato JSON consistente.
 * 
 * Uso:
 * return new RoleResource($role);                    // Un rol
 * return RoleResource::collection($roles);           // Colección de roles
 */
class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'active' => (bool) $this->active,
            
            // Count de usuarios con este rol (si la relación está cargada)
            'users_count' => $this->when(
                $this->relationLoaded('users'),
                fn() => $this->users->count()
            ),
            
            // Timestamps (opcional)
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
