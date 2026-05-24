<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('admins')) return;
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('username', 64)->unique();
            $table->string('name', 128)->nullable();
            $table->string('password', 255);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
