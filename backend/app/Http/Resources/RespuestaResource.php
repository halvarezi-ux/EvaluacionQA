<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RespuestaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'pregunta_id'      => $this->pregunta_id,
            'respuesta_valor'  => $this->respuesta_valor,
            'puntaje_obtenido' => (float) $this->puntaje_obtenido,
            'comentario'       => $this->comentario,
            'pregunta'         => $this->when($this->relationLoaded('pregunta'), function () {
                return [
                    'id'             => $this->pregunta->id,
                    'texto'          => $this->pregunta->texto,
                    'segmento_id'    => $this->pregunta->segmento_id,
                    'segmento_nombre'=> $this->pregunta->segmento->nombre ?? null,
                ];
            }),
        ];
    }
}
