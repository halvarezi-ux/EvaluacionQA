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
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained()->onDelete('cascade');
            $table->string('label');
            $table->string('type'); // text, textarea, select, radio, checkbox, date, number, email
            $table->json('options')->nullable(); // for select, radio, checkbox
            $table->json('validation')->nullable(); // required, min, max, regex, etc
            $table->integer('order')->default(0);
            $table->integer('weight')->default(0); // For scoring
            $table->boolean('is_required')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
