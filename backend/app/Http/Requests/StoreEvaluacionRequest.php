<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role?->nombre, ['Admin', 'QA Lead', 'QA']);
    }

    public function rules(): array
    {
        return [
            'boleta_version_id'            => ['required', 'exists:boleta_versiones,id'],
            'area_id'                      => ['sometimes', 'nullable', 'exists:areas,id'],
            'agente_nombre'                => ['sometimes', 'nullable', 'string', 'max:255'],
            'respuestas'                   => ['required', 'array', 'min:1'],
            'respuestas.*.pregunta_id'     => ['required', 'exists:preguntas,id'],
            'respuestas.*.respuesta_valor' => ['required', 'string', 'max:500'],
            'respuestas.*.comentario'      => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'boleta_version_id.required' => 'Debe especificar la versión de boleta a evaluar.',
            'boleta_version_id.exists'   => 'La versión de boleta no existe.',
            'respuestas.required'        => 'Debe proporcionar al menos una respuesta.',
            'respuestas.*.pregunta_id.exists' => 'Una de las preguntas no existe en el sistema.',
        ];
    }
}
