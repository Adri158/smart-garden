<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('feedback')) return;
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 128)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('category', 32)->nullable();
            $table->text('pesan');
            $table->tinyInteger('rating')->default(0);
            $table->text('reply')->nullable();
            $table->string('reply_by', 128)->nullable();
            $table->timestamp('reply_at')->nullable();
            $table->string('ip', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
