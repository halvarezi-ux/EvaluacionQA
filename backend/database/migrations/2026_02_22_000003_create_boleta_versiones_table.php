<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boleta_versiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boleta_id')
                  ->constrained('boletas')
                  ->cascadeOnDelete();
            $table->unsignedInteger('numero_version')->default(1);
            $table->boolean('es_activa')->default(false);
            $table->timestamps();

            $table->unique(['boleta_id', 'numero_version']);
            $table->index(['boleta_id', 'es_activa']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boleta_versiones');
    }
};
