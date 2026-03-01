<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BoletaVersion extends Model
{
    use HasFactory;

    protected $table = 'boleta_versiones';

    protected $fillable = [
        'boleta_id',
        'numero_version',
        'es_activa',
    ];

    protected $casts = [
        'numero_version' => 'integer',
        'es_activa'      => 'boolean',
    ];

    // ─── Relaciones ─────────────────────────────────────────────────

    public function boleta(): BelongsTo
    {
        return $this->belongsTo(Boleta::class);
    }

    public function segmentos(): HasMany
    {
        return $this->hasMany(Segmento::class, 'boleta_version_id')->orderBy('orden');
    }

    public function areas(): BelongsToMany
    {
        return $this->belongsToMany(Area::class, 'boleta_version_area', 'boleta_version_id', 'area_id');
    }

    public function evaluaciones(): HasMany
    {
        return $this->hasMany(Evaluacion::class, 'boleta_version_id');
    }

    // ─── Scopes ─────────────────────────────────────────────────────

    public function scopeActiva($query)
    {
        return $query->where('es_activa', true);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    public function tieneEvaluaciones(): bool
    {
        return $this->evaluaciones()->exists();
    }

    public function esEditable(): bool
    {
        return $this->es_activa && ! $this->tieneEvaluaciones();
    }
}
