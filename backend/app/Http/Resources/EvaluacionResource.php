<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'boleta_version_id'  => $this->boleta_version_id,
            'area_id'            => $this->area_id,
            'evaluador_id'       => $this->evaluador_id,
            'agente_nombre'      => $this->agente_nombre,
            'total_normal'       => (float) $this->total_normal,
            'total_penalizacion' => (float) $this->total_penalizacion,
            'nota_final'         => (float) $this->nota_final,
            'nivel_calidad'      => $this->nivelCalidad(),
            'estado'             => $this->estado,
            'area'               => new AreaResource($this->whenLoaded('area')),
            'evaluador'          => new UserResource($this->whenLoaded('evaluador')),
            'respuestas'         => RespuestaResource::collection($this->whenLoaded('respuestas')),
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
