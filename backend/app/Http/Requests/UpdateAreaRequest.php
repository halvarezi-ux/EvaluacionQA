<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Lección SOLID - Principio S (Single Responsibility):
 * StoreAreaRequest valida creación; UpdateAreaRequest valida actualización.
 * Son responsabilidades diferentes porque el update necesita ignorar el registro
 * actual en la regla unique (si keeps el mismo nombre, no debe lanzar error).
 */
class UpdateAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role?->nombre, ['Admin', 'QA Lead']);
    }

    public function rules(): array
    {
        return [
            // Rule::unique()->ignore() excluye el registro actual del check de unicidad
            // $this->route('area') obtiene el {area} de la URL: PUT /areas/{area}
            'nombre' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('areas', 'nombre')->ignore($this->route('area')),
            ],
            'activa' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.unique' => 'Ya existe otra área con ese nombre.',
        ];
    }
}
