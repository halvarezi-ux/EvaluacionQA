<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('respuestas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluacion_id')
                  ->constrained('evaluaciones')
                  ->cascadeOnDelete();
            $table->foreignId('pregunta_id')
                  ->constrained('preguntas')
                  ->restrictOnDelete();
            $table->string('respuesta_valor', 500)->comment('Valor de la respuesta: yes/no, número, texto, opcion_id, etc.');
            $table->decimal('puntaje_obtenido', 5, 2)->default(0);
            $table->text('comentario')->nullable();
            $table->timestamps();

            $table->unique(['evaluacion_id', 'pregunta_id']);
            $table->index('evaluacion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('respuestas');
    }
};
