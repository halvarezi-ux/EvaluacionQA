<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;  // ← IMPORTANTE: Siempre mantener esto

    /**
     * Los atributos que pueden ser asignados masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'active'
    ];

    /**
     * Relación: Un rol tiene muchos usuarios
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}