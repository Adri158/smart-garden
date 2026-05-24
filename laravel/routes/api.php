<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ServerController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DokumentasiController;

Route::get('/status', [StatusController::class, 'index']);

Route::get('/devices', [DeviceController::class, 'index']);
Route::get('/devices/{deviceId}', [DeviceController::class, 'show']);

Route::get('/devices/{deviceId}/sensors', [SensorController::class, 'history']);
Route::get('/devices/{deviceId}/sensors/latest', [SensorController::class, 'latest']);
Route::post('/devices/{deviceId}/sensors', [SensorController::class, 'store'])->middleware('api.key');

Route::get('/devices/{deviceId}/settings', [SettingsController::class, 'deviceSettings']);
Route::put('/devices/{deviceId}/settings', [SettingsController::class, 'updateDeviceSettings'])->middleware('api.key');

Route::get('/settings', [SettingsController::class, 'globalSettings']);

Route::get('/schedules', [ScheduleController::class, 'index']);
Route::post('/schedules', [ScheduleController::class, 'store'])->middleware('api.key');
Route::put('/schedules/{id}', [ScheduleController::class, 'update'])->middleware('api.key');
Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy'])->middleware('api.key');

Route::get('/server/stats', [ServerController::class, 'index']);

Route::post('/chat', [ChatController::class, 'chat']);

Route::get('/dokumentasi/files', [DokumentasiController::class, 'files']);
Route::get('/dokumentasi/content/{name}', [DokumentasiController::class, 'content']);
