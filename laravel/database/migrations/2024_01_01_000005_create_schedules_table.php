<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('schedules')) return;
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->string('days', 32);      // CSV of 0-6 (Sun-Sat)
            $table->string('time', 8);       // HH:MM
            $table->boolean('enabled')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
