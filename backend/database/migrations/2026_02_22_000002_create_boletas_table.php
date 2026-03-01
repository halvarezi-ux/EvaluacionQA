<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boletas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 255);
            $table->text('descripcion')->nullable();
            $table->string('pais', 100)->nullable();
            $table->string('cliente', 255)->nullable();
            $table->enum('tipo_interaccion', ['llamada', 'chat', 'email'])->nullable();
            $table->decimal('total_global', 5, 2)->default(100.00);
            $table->enum('estado', ['draft', 'activa', 'archivada'])->default('draft');
            $table->foreignId('created_by')
                  ->constrained('users')
                  ->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('estado');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boletas');
    }
};
