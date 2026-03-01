<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\EstadoEvaluacion;

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
        // Ahora 'estado' es de tipo EstadoEvaluacion — no un string libre
        // Lanza excepción si la BD tiene un valor que no está en el Enum
        'estado'            => EstadoEvaluacion::class,
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

    // Usar el Enum en los scopes garantiza type-safety:
    // si cambias el valor en el Enum, el scope se actualiza automáticamente
    public function scopeCompletadas($query)
    {
        return $query->where('estado', EstadoEvaluacion::Completada);
    }

    public function scopeBorradores($query)
    {
        return $query->where('estado', EstadoEvaluacion::Borrador);
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
        return $this->estado === EstadoEvaluacion::Completada;
    }
}
