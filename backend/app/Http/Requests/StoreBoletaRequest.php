<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBoletaRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (!$this->user()) return false;

        if (!$this->user()->relationLoaded('role')) {
            $this->user()->load('role');
        }

        $rol = $this->user()->role?->nombre;
        return in_array($rol, ['Admin', 'QA Lead']);
    }

    public function rules(): array
    {
        return [
            'nombre'           => ['required', 'string', 'max:255'],
            'descripcion'      => ['sometimes', 'nullable', 'string', 'max:2000'],
            'pais'             => ['sometimes', 'nullable', 'string', 'max:100'],
            'cliente'          => ['sometimes', 'nullable', 'string', 'max:255'],
            'tipo_interaccion' => ['sometimes', 'nullable', 'in:llamada,chat,email'],
            'total_global'     => ['sometimes', 'numeric', 'min:1', 'max:9999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'            => 'El nombre de la boleta es obligatorio',
            'pais.required'              => 'El país es obligatorio',
            'cliente.required'           => 'El cliente es obligatorio',
            'tipo_interaccion.required'  => 'El tipo de interacción es obligatorio',
            'tipo_interaccion.in'        => 'El tipo de interacción debe ser: llamada, chat o email',
        ];
    }
}
