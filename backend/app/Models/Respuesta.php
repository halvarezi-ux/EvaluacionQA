<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Respuesta extends Model
{
    use HasFactory;

    protected $table = 'respuestas';

    protected $fillable = [
        'evaluacion_id',
        'pregunta_id',
        'respuesta_valor',
        'puntaje_obtenido',
        'comentario',
    ];

    protected $casts = [
        'puntaje_obtenido' => 'decimal:2',
    ];

    // ─── Relaciones ─────────────────────────────────────────────────

    public function evaluacion(): BelongsTo
    {
        return $this->belongsTo(Evaluacion::class);
    }

    public function pregunta(): BelongsTo
    {
        return $this->belongsTo(Pregunta::class);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    public function fallo(): bool
    {
        return $this->pregunta->fallo($this->respuesta_valor);
    }
}
