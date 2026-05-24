<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('device_settings')) return;
        Schema::create('device_settings', function (Blueprint $table) {
            $table->string('device_id', 64);
            $table->string('key_name', 64);
            $table->string('value', 255)->nullable();

            $table->primary(['device_id', 'key_name']);
            $table->foreign('device_id')->references('device_id')->on('devices');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_settings');
    }
};
