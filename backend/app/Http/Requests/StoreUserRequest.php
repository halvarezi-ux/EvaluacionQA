<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request para crear un nuevo usuario.
 * 
 * Valida que:
 * - El usuario autenticado sea Admin
 * - Los datos cumplan las reglas de validación
 * - El email y username sean únicos
 */
class StoreUserRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta request.
     * Solo los Admin pueden crear usuarios.
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

        // Solo Admin puede crear usuarios
        return $this->user()->role && $this->user()->role->nombre === 'Admin';
    }

    /**
     * Reglas de validación para crear un usuario.
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'min:3'
            ],
            'user' => [
                'required',
                'string',
                'min:4',
                'max:50',
                'unique:users,user',        // Único en la tabla users, columna user
                'regex:/^[a-z0-9._]+$/',    // Minúsculas, números, punto y guión bajo
            ],
            'email' => [
                'required',
                'email:rfc,dns',            // Validación estricta de email
                'max:255',
                'unique:users,email'        // Único en la tabla users
            ],
            'password' => [
                'required',
                'string',
                'min:6',
                'max:255'
            ],
            'role_id' => [
                'required',
                'integer',
                'exists:roles,id'           // Debe existir en tabla roles
            ],
            'active' => [
                'boolean'                   // true o false, opcional (default: true en migration)
            ]
        ];
    }

    /**
     * Mensajes de error personalizados en español.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio',
            'name.min' => 'El nombre debe tener al menos 3 caracteres',
            'name.max' => 'El nombre no puede exceder 255 caracteres',
            
            'user.required' => 'El nombre de usuario es obligatorio',
            'user.min' => 'El usuario debe tener al menos 4 caracteres',
            'user.max' => 'El usuario no puede exceder 50 caracteres',
            'user.unique' => 'Este nombre de usuario ya está en uso',
            'user.regex' => 'El usuario solo puede contener letras minúsculas, números, punto (.) y guión bajo (_)',
            
            'email.required' => 'El email es obligatorio',
            'email.email' => 'El email debe ser una dirección válida',
            'email.unique' => 'Este email ya está registrado',
            
            'password.required' => 'La contraseña es obligatoria',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres',
            
            'role_id.required' => 'El rol es obligatorio',
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
