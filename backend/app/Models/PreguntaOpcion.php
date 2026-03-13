<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreguntaOpcion extends Model
{
    use HasFactory;

    protected $table = 'pregunta_opciones';

    protected $fillable = [
        'pregunta_id',
        'texto',
        'valor',
        'orden',
        'next_pregunta_id',
    ];

    protected $casts = [
        'valor'            => 'decimal:2',
        'orden'            => 'integer',
        'next_pregunta_id' => 'integer',
    ];

    // ─── Relaciones ─────────────────────────────────────────────

    public function pregunta(): BelongsTo
    {
        return $this->belongsTo(Pregunta::class);
    }

    public function nextPregunta(): BelongsTo
    {
        return $this->belongsTo(Pregunta::class, 'next_pregunta_id');
    }
}
