<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('segmentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boleta_version_id')
                  ->constrained('boleta_versiones')
                  ->cascadeOnDelete();
            $table->string('nombre', 255);
            $table->enum('tipo', ['normal', 'critico', 'resumen']);
            $table->decimal('peso', 5, 2)->nullable()->comment('Solo para tipo normal: porcentaje del total_global');
            $table->decimal('penalizacion', 5, 2)->nullable()->comment('Solo para tipo critico: puntos a descontar');
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();

            $table->index(['boleta_version_id', 'orden']);
            $table->index(['boleta_version_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('segmentos');
    }
};
