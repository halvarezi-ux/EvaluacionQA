<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Evaluation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'form_id',
        'evaluator_id',
        'evaluated_user_id',
        'status',
        'score',
        'comments',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the form used in this evaluation.
     */
    public function form()
    {
        return $this->belongsTo(Form::class);
    }

    /**
     * Get the evaluator (user performing the evaluation).
     */
    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    /**
     * Get the evaluated user.
     */
    public function evaluatedUser()
    {
        return $this->belongsTo(User::class, 'evaluated_user_id');
    }

    /**
     * Get the responses for this evaluation.
     */
    public function responses()
    {
        return $this->hasMany(EvaluationResponse::class);
    }

    /**
     * Get the feedback for this evaluation.
     */
    public function feedback()
    {
        return $this->hasMany(Feedback::class);
    }
}
