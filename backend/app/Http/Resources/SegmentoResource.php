<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SegmentoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'boleta_version_id' => $this->boleta_version_id,
            'nombre'            => $this->nombre,
            'tipo'              => $this->tipo->value,
            'tipo_label'        => $this->tipo->label(),
            'peso'              => $this->peso !== null ? (float) $this->peso : null,
            'penalizacion'      => $this->penalizacion !== null ? (float) $this->penalizacion : null,
            'orden'             => $this->orden,
            'preguntas'         => PreguntaResource::collection(
                                       $this->whenLoaded('preguntas')
                                   ),
            'created_at'        => $this->created_at,
        ];
    }
}
