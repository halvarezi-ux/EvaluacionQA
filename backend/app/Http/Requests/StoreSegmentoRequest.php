<?php

namespace App\Http\Requests;

use App\Enums\TipoSegmento;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreSegmentoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role?->nombre, ['Admin', 'QA Lead']);
    }

    public function rules(): array
    {
        $tipo = $this->input('tipo');

        return [
            'nombre'       => ['required', 'string', 'max:255'],
            'tipo'         => ['required', new Enum(TipoSegmento::class)],
            'peso'         => $tipo === 'normal'
                                ? ['required', 'numeric', 'min:0.01', 'max:100']
                                : ['nullable', 'numeric'],
            'penalizacion' => $tipo === 'critico'
                                ? ['required', 'numeric', 'min:0.01', 'max:100']
                                : ['nullable', 'numeric'],
            'orden'        => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'peso.required'         => 'El peso es obligatorio para segmentos de tipo normal.',
            'penalizacion.required' => 'La penalización es obligatoria para segmentos de tipo crítico.',
        ];
    }
}
