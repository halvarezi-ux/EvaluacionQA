<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PreguntaOpcionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'     => $this->id,
            'texto'  => $this->texto,
            'valor'  => (float) $this->valor,
            'orden'  => $this->orden,
        ];
    }
}
