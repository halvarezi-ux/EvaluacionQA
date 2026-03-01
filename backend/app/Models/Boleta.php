<?php

namespace App\Models;

use App\Enums\EstadoBoleta;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Boleta extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre',
        'descripcion',
        'pais',
        'cliente',
        'tipo_interaccion',
        'total_global',
        'estado',
        'created_by',
    ];

    protected $casts = [
        'total_global' => 'decimal:2',
        'estado'       => EstadoBoleta::class,
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
        'deleted_at'   => 'datetime',
    ];

    // ─── Relaciones ──────────────────────────────────────────

    public function versiones(): HasMany
    {
        return $this->hasMany(BoletaVersion::class)->orderBy('numero_version', 'desc');
    }

    public function versionActiva(): HasOne
    {
        return $this->hasOne(BoletaVersion::class)->where('es_activa', true);
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeDraft($query)
    {
        return $query->where('estado', EstadoBoleta::Draft);
    }

    public function scopeActiva($query)
    {
        return $query->where('estado', EstadoBoleta::Activa);
    }

    public function scopeArchivada($query)
    {
        return $query->where('estado', EstadoBoleta::Archivada);
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function esEditable(): bool
    {
        return $this->estado === EstadoBoleta::Draft;
    }

    public function puedeEvaluarse(): bool
    {
        return $this->estado === EstadoBoleta::Activa;
    }
}
