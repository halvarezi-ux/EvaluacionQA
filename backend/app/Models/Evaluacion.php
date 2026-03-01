<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluacion extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones';

    protected $fillable = [
        'boleta_version_id',
        'area_id',
        'evaluador_id',
        'agente_nombre',
        'total_normal',
        'total_penalizacion',
        'nota_final',
        'estado',
    ];

    protected $casts = [
        'total_normal'      => 'decimal:2',
        'total_penalizacion'=> 'decimal:2',
        'nota_final'        => 'decimal:2',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    // ─── Relaciones ─────────────────────────────────────────────────

    public function version(): BelongsTo
    {
        return $this->belongsTo(BoletaVersion::class, 'boleta_version_id');
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function evaluador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluador_id');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(Respuesta::class);
    }

    // ─── Scopes ─────────────────────────────────────────────────────

    public function scopeCompletadas($query)
    {
        return $query->where('estado', 'completada');
    }

    public function scopeBorradores($query)
    {
        return $query->where('estado', 'borrador');
    }

    // ─── Helpers ────────────────────────────────────────────────────

    public function nivelCalidad(): string
    {
        return match(true) {
            $this->nota_final >= 90 => 'Excelente',
            $this->nota_final >= 75 => 'Bueno',
            $this->nota_final >= 60 => 'Regular',
            default                 => 'Crítico',
        };
    }

    public function estaCompleta(): bool
    {
        return $this->estado === 'completada';
    }
}
