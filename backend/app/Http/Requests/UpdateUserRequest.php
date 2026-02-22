<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form Request para actualizar un usuario existente.
 * 
 * Valida que:
 * - El usuario autenticado sea Admin
 * - Los datos cumplan las reglas de validación
 * - El email y username sean únicos (excepto para el propio usuario)
 * - Los campos son opcionales (solo actualiza lo que se envía)
 */
class UpdateUserRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta request.
     * Solo los Admin pueden actualizar usuarios.
     */
    public function authorize(): bool
    {
        // Verificar que el usuario esté autenticado
        if (!$this->user()) {
            return false;
        }

        // Cargar la relación 'role' si no está cargada
        if (!$this->user()->relationLoaded('role')) {
            $this->user()->load('role');
        }

        // Solo Admin puede actualizar usuarios
        return $this->user()->role && $this->user()->role->nombre === 'Admin';
    }

    /**
     * Reglas de validación para actualizar un usuario.
     * 
     * Nota: Todos los campos son opcionales (sometimes) porque en un UPDATE
     * el cliente puede enviar solo los campos que quiere cambiar.
     */
    public function rules(): array
    {
        // Obtener el ID del usuario que se está editando desde la ruta
        // Ejemplo: PUT /api/users/5 → $userId = 5
        $userId = $this->route('user');

        return [
            'name' => [
                'sometimes',                // Solo validar si está presente
                'string',
                'max:255',
                'min:3'
            ],
            'user' => [
                'sometimes',
                'string',
                'min:4',
                'max:50',
                // Único, pero ignorar el usuario actual (puede mantener su propio username)
                Rule::unique('users', 'user')->ignore($userId),
                'regex:/^[a-z0-9._]+$/',
            ],
            'email' => [
                'sometimes',
                'email:rfc,dns',
                'max:255',
                // Único, pero ignorar el usuario actual (puede mantener su propio email)
                Rule::unique('users', 'email')->ignore($userId)
            ],
            'password' => [
                'sometimes',                // Password es opcional en updates
                'string',
                'min:6',
                'max:255'
            ],
            'role_id' => [
                'sometimes',
                'integer',
                'exists:roles,id'
            ],
            'active' => [
                'sometimes',
                'boolean'
            ]
        ];
    }

    /**
     * Mensajes de error personalizados en español.
     */
    public function messages(): array
    {
        return [
            'name.min' => 'El nombre debe tener al menos 3 caracteres',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            
            'user.min' => 'El usuario debe tener al menos 4 caracteres',
            'user.max' => 'El usuario no puede exceder 50 caracteres',
            'user.unique' => 'Este nombre de usuario ya está en uso',
            'user.regex' => 'El usuario solo puede contener letras minúsculas, números, punto (.) y guión bajo (_)',
            
            'email.email' => 'El email debe ser una dirección válida',
            'email.unique' => 'Este email ya está registrado',
            
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            
            'role_id.exists' => 'El rol seleccionado no existe',
            
            'active.boolean' => 'El campo activo debe ser verdadero o falso'
        ];
    }

    /**
     * Nombres de atributos personalizados para los mensajes de error.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'user' => 'usuario',
            'email' => 'correo electrónico',
            'password' => 'contraseña',
            'role_id' => 'rol',
            'active' => 'activo'
        ];
    }
}
