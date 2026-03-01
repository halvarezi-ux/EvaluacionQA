<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boleta_version_area', function (Blueprint $table) {
            $table->foreignId('boleta_version_id')
                  ->constrained('boleta_versiones')
                  ->cascadeOnDelete();
            $table->foreignId('area_id')
                  ->constrained('areas')
                  ->cascadeOnDelete();

            $table->primary(['boleta_version_id', 'area_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boleta_version_area');
    }
};
