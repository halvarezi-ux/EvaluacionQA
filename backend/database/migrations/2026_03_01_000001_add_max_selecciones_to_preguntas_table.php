<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preguntas', function (Blueprint $table) {
            // 1  = solo una opción (default — radio/select)
            // 0  = ilimitadas (checkboxes sin límite)
            // N  = hasta N selecciones (checkboxes con límite)
            $table->tinyInteger('max_selecciones')
                  ->default(1)
                  ->after('comentario_requerido')
                  ->comment('Solo aplica a opcion_multiple. 1=una, 0=ilimitadas, N=hasta N');
        });
    }

    public function down(): void
    {
        Schema::table('preguntas', function (Blueprint $table) {
            $table->dropColumn('max_selecciones');
        });
    }
};
