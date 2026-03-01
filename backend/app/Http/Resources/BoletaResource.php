<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BoletaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'nombre'           => $this->nombre,
            'descripcion'      => $this->descripcion,
            'pais'             => $this->pais,
            'cliente'          => $this->cliente,
            'tipo_interaccion' => $this->tipo_interaccion,
            'total_global'     => (float) $this->total_global,
            'estado'           => $this->estado?->value,
            'estado_label'     => $this->estado?->label(),
            'es_editable'      => $this->esEditable(),
            'puede_evaluarse'  => $this->puedeEvaluarse(),
            'created_by'       => $this->created_by,
            'creador'          => $this->whenLoaded('creador', fn() => [
                'id'   => $this->creador->id,
                'name' => $this->creador->name,
            ]),
            'versiones_count'  => $this->whenCounted('versiones'),
            'versiones'        => BoletaVersionResource::collection($this->whenLoaded('versiones')),
            'version_activa'   => new BoletaVersionResource($this->whenLoaded('versionActiva')),
            'borrador_version_id' => $this->whenLoaded('versiones', function () {
                return $this->versiones
                    ->where('es_activa', false)
                    ->sortByDesc('numero_version')
                    ->first()?->id;
            }),
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
