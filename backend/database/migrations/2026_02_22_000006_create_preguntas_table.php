<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preguntas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('segmento_id')
                  ->constrained('segmentos')
                  ->cascadeOnDelete();
            $table->text('texto');
            $table->enum('tipo', [
                'si_no',
                'opcion_multiple',
                'porcentaje',
                'numerica',
                'checklist',
                'texto_libre',
            ]);
            $table->decimal('peso', 5, 2)->nullable()->comment('Peso dentro del segmento normal. Null = distribución automática');
            $table->boolean('anula_segmento')->default(false)->comment('Si falla esta pregunta, el segmento vale 0');
            $table->enum('comentario_requerido', [
                'nunca',
                'siempre',
                'si_es_no',
                'si_es_si',
                'si_penaliza',
            ])->default('nunca');
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();

            $table->index(['segmento_id', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preguntas');
    }
};
