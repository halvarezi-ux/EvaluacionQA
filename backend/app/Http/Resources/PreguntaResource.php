<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PreguntaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'segmento_id'          => $this->segmento_id,
            'texto'                => $this->texto,
            'tipo'                 => $this->tipo->value,
            'tipo_label'           => $this->tipo->label(),
            'peso'                 => $this->peso !== null ? (float) $this->peso : null,
            'anula_segmento'       => $this->anula_segmento,
            'comentario_requerido' => $this->comentario_requerido->value,
            'comentario_requerido_label' => $this->comentario_requerido->label(),
            'orden'                => $this->orden,
            'opciones'             => PreguntaOpcionResource::collection(
                                         $this->whenLoaded('opciones')
                                     ),
            'created_at'           => $this->created_at,
        ];
    }
}
