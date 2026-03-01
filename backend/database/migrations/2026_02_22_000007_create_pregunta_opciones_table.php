<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pregunta_opciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pregunta_id')
                  ->constrained('preguntas')
                  ->cascadeOnDelete();
            $table->string('texto', 500);
            $table->decimal('valor', 5, 2)->comment('Valor numérico de esta opción (0 a peso del segmento)');
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();

            $table->index(['pregunta_id', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pregunta_opciones');
    }
};
