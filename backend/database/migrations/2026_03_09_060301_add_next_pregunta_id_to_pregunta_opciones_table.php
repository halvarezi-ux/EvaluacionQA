<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pregunta_opciones', function (Blueprint $table) {
            $table->foreignId('next_pregunta_id')
                  ->nullable()
                  ->after('orden')
                  ->constrained('preguntas')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('pregunta_opciones', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Pregunta::class, 'next_pregunta_id');
            $table->dropColumn('next_pregunta_id');
        });
    }
};
