<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role?->nombre, ['Admin', 'QA Lead']);
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100', 'unique:areas,nombre'],
            'activa' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del área es obligatorio.',
            'nombre.unique'   => 'Ya existe un área con ese nombre.',
        ];
    }
}
