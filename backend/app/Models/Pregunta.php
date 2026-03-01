<?php

namespace App\Models;

use App\Enums\ComentarioRequerido;
use App\Enums\TipoPregunta;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pregunta extends Model
{
    use HasFactory;

    protected $fillable = [
        'segmento_id',
        'texto',
        'tipo',
        'peso',
        'anula_segmento',
        'comentario_requerido',
        'orden',
    ];

    protected $casts = [
        'tipo'                 => TipoPregunta::class,
        'comentario_requerido' => ComentarioRequerido::class,
        'peso'                 => 'decimal:2',
        'anula_segmento'       => 'boolean',
        'orden'                => 'integer',
    ];

    // ─── Relaciones ─────────────────────────────────────────────────

    public function segmento(): BelongsTo
    {
        return $this->belongsTo(Segmento::class);
    }

    public function opciones(): HasMany
    {
        return $this->hasMany(PreguntaOpcion::class)->orderBy('orden');
    }

    public function respuestas(): HasMany
    {
        return $this->hasMany(Respuesta::class);
    }

    // ─── Scopes ─────────────────────────────────────────────────────

    public function scopeAnulanSegmento($query)
    {
        return $query->where('anula_segmento', true);
    }

    // ─── Helpers ────────────────────────────────────────────────────

    /**
     * Calcula el puntaje de esta pregunta dado el valor de respuesta.
     * Delega al Enum TipoPregunta.
     */
    public function calcularPuntaje(string $respuestaValor): float
    {
        $peso = (float) ($this->peso ?? 0);
        return $this->tipo->calcularPuntaje($respuestaValor, $peso);
    }

    /**
     * Determina si la respuesta dada representa un "fallo" (puntaje = 0 para si_no o similar).
     */
    public function fallo(string $respuestaValor): bool
    {
        return $this->calcularPuntaje($respuestaValor) === 0.0
            && $this->tipo !== TipoPregunta::TextoLibre;
    }

    /**
     * Indica si el comentario es requerido para esta respuesta.
     */
    public function comentarioEsRequerido(string $respuestaValor, bool $penaliza = false): bool
    {
        return $this->comentario_requerido->esRequerido($respuestaValor, $penaliza);
    }
}
