<?php

namespace App\Models;

use App\Enums\TipoSegmento;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Segmento extends Model
{
    use HasFactory;

    protected $fillable = [
        'boleta_version_id',
        'nombre',
        'tipo',
        'peso',
        'penalizacion',
        'orden',
    ];

    protected $casts = [
        'tipo'         => TipoSegmento::class,
        'peso'         => 'decimal:2',
        'penalizacion' => 'decimal:2',
        'orden'        => 'integer',
    ];

    // ─── Relaciones ─────────────────────────────────────────────────

    public function version(): BelongsTo
    {
        return $this->belongsTo(BoletaVersion::class, 'boleta_version_id');
    }

    public function preguntas(): HasMany
    {
        return $this->hasMany(Pregunta::class)->orderBy('orden');
    }

    // ─── Scopes ─────────────────────────────────────────────────────

    public function scopeNormales($query)
    {
        return $query->where('tipo', TipoSegmento::Normal);
    }

    public function scopeCriticos($query)
    {
        return $query->where('tipo', TipoSegmento::Critico);
    }

    public function scopeResumen($query)
    {
        return $query->where('tipo', TipoSegmento::Resumen);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    public function esNormal(): bool
    {
        return $this->tipo === TipoSegmento::Normal;
    }

    public function esCritico(): bool
    {
        return $this->tipo === TipoSegmento::Critico;
    }

    public function esResumen(): bool
    {
        return $this->tipo === TipoSegmento::Resumen;
    }

    /** Suma de pesos de preguntas con peso definido */
    public function sumaPesosPreguntas(): float
    {
        return (float) $this->preguntas()->whereNotNull('peso')->sum('peso');
    }
}
