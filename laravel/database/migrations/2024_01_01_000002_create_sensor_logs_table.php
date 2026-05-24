<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('sensor_logs')) return;
        Schema::create('sensor_logs', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 64);
            $table->float('soil')->nullable();
            $table->float('temp_dht')->nullable();
            $table->float('temp_ds')->nullable();
            $table->float('humidity')->nullable();
            $table->tinyInteger('relay')->nullable();
            $table->string('mode', 16)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('device_id')->references('device_id')->on('devices');
            $table->index(['device_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_logs');
    }
};
