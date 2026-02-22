<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'user' => 'required|string',
            'password' => 'required|string',
        ]);

        // Eager loading: carga la relación 'role' en la misma consulta
        $user = User::where('user', $request->user)
            ->with('role')  // ← CLAVE: Carga el rol inmediatamente
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Validar que el usuario esté activo
        if (!$user->active) {
            return response()->json(['message' => 'Usuario inactivo. Contacte al administrador.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Transformación manual: solo datos necesarios para el frontend
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'user' => $user->user,
                'email' => $user->email,
                'role' => [
                    'id' => $user->role->id,
                    'nombre' => $user->role->nombre
                ],
                'active' => $user->active
            ]
        ]);
    }
    
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }
}