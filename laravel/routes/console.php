<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('sensor:purge', function () {
    $deleted = DB::table('sensor_logs')
        ->where('created_at', '<', now()->subDays(30))
        ->delete();
    $this->info("Purged {$deleted} sensor log rows older than 30 hari.");
})->purpose('Hapus sensor logs lebih dari 30 hari');

Schedule::command('sensor:purge')->dailyAt('03:00');
