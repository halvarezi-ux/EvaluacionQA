<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_id',
        'label',
        'type',
        'options',
        'validation',
        'order',
        'weight',
        'is_required',
    ];

    protected $casts = [
        'options' => 'array',
        'validation' => 'array',
        'is_required' => 'boolean',
    ];

    /**
     * Get the form that owns this field.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Get the responses for this field.
     */
    public function responses()
    {
        return $this->hasMany(EvaluationResponse::class);
    }
}
