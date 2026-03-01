<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'activa',
    ];

    protected $casts = [
        'activa' => 'boolean',
    ];

    // ─── Relaciones ─────────────────────────────────────────────────

    public function versiones(): BelongsToMany
    {
        return $this->belongsToMany(BoletaVersion::class, 'boleta_version_area', 'area_id', 'boleta_version_id');
    }

    public function evaluaciones(): HasMany
    {
        return $this->hasMany(Evaluacion::class);
    }

    // ─── Scopes ─────────────────────────────────────────────────────

    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }
}
