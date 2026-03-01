<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boleta_version_id')
                  ->constrained('boleta_versiones')
                  ->restrictOnDelete();
            $table->foreignId('area_id')
                  ->nullable()
                  ->constrained('areas')
                  ->nullOnDelete();
            $table->foreignId('evaluador_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->string('agente_nombre', 255)->nullable()->comment('Nombre del agente evaluado');
            $table->decimal('total_normal', 5, 2)->default(0);
            $table->decimal('total_penalizacion', 5, 2)->default(0);
            $table->decimal('nota_final', 5, 2)->default(0);
            $table->enum('estado', ['borrador', 'completada'])->default('borrador');
            $table->timestamps();

            $table->index(['boleta_version_id', 'estado']);
            $table->index('evaluador_id');
            $table->index('area_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluaciones');
    }
};
