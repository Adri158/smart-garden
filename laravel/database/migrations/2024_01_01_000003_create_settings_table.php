<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('settings')) return;
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key_name', 64)->primary();
            $table->string('value', 255)->nullable();
        });

        // Insert default values
        \DB::table('settings')->insertOrIgnore([
            ['key_name' => 'soil_min',         'value' => '40'],
            ['key_name' => 'soil_max',         'value' => '80'],
            ['key_name' => 'temp_max',         'value' => '35'],
            ['key_name' => 'hum_min',          'value' => '30'],
            ['key_name' => 'publish_interval', 'value' => '5000'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
