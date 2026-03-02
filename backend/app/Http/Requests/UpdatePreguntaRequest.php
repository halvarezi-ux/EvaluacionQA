<?php

namespace App\Http\Requests;

use App\Enums\ComentarioRequerido;
use App\Enums\TipoPregunta;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdatePreguntaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role?->nombre, ['Admin', 'QA Lead']);
    }

    public function rules(): array
    {
        return [
            'texto'                => ['required', 'string', 'max:1000'],
            'tipo'                 => ['required', new Enum(TipoPregunta::class)],
            'peso'                 => ['sometimes', 'nullable', 'numeric', 'min:0.01', 'max:100'],
            'anula_segmento'       => ['sometimes', 'boolean'],
            'comentario_requerido' => ['sometimes', new Enum(ComentarioRequerido::class)],
            'orden'                => ['sometimes', 'integer', 'min:0'],
            'max_selecciones'      => ['sometimes', 'integer', 'min:0'],
            // Opciones son opcionales en updates: si vienen se reemplazan, si no vienen se conservan.
            'opciones'             => ['sometimes', 'array', 'min:2'],
            'opciones.*.texto'     => ['required_with:opciones', 'string', 'max:500'],
            'opciones.*.valor'     => ['required_with:opciones', 'numeric', 'min:0'],
            'opciones.*.orden'     => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'opciones.min' => 'Las preguntas de tipo opción múltiple y checklist requieren al menos 2 opciones.',
        ];
    }
}
