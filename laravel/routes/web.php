<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;

Route::prefix('admin')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('admin.login');
    Route::post('/login', [AuthController::class, 'login'])->name('admin.login.post');
    Route::post('/logout', [AuthController::class, 'logout'])->name('admin.logout');


    Route::middleware('admin.auth')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('/dashboard', [DashboardController::class, 'index']);


        Route::post('/feedback/{id}/reply', [DashboardController::class, 'replyFeedback']);
        Route::delete('/feedback/{id}', [DashboardController::class, 'deleteFeedback']);
        Route::get('/feedback', [DashboardController::class, 'listFeedback']);


        Route::get('/admins', [DashboardController::class, 'listAdmins']);
        Route::post('/admins', [DashboardController::class, 'addAdmin']);
        Route::delete('/admins/{id}', [DashboardController::class, 'deleteAdmin']);
    });
});
