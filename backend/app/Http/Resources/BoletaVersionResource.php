<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\AreaResource;
use App\Http\Resources\SegmentoResource;

class BoletaVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'boleta_id'       => $this->boleta_id,
            'numero_version'  => $this->numero_version,
            'es_activa'       => (bool) $this->es_activa,
            'es_editable'     => $this->esEditable(),
            'tiene_evaluaciones' => $this->tieneEvaluaciones(),
            'areas'           => AreaResource::collection($this->whenLoaded('areas')),
            'segmentos'       => SegmentoResource::collection($this->whenLoaded('segmentos')),
            'created_at'      => $this->created_at?->toDateTimeString(),
        ];
    }
}
