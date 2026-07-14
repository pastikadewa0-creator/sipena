<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EmployeeController;
use App\Http\Middleware\IsAdmin;
use App\Http\Middleware\IsEmployee;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::post('/notifications/read', function () {
        auth()->user()->notifications()->update(['is_read' => true]);
        return back();
    })->name('notifications.read');

    // Admin Routes
    Route::middleware([IsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/employees', [AdminController::class, 'employees'])->name('employees');
        Route::get('/attendances', [AdminController::class, 'attendances'])->name('attendances');
        Route::get('/leaves', [AdminController::class, 'leaveRequests'])->name('leaves');
        Route::post('/leaves/{id}', [AdminController::class, 'updateLeaveStatus'])->name('leaves.update');
        Route::get('/settings', [AdminController::class, 'settings'])->name('settings');
        Route::post('/settings', [AdminController::class, 'updateSettings'])->name('settings.update');
    });

    // Employee Routes
    Route::middleware([IsEmployee::class])->prefix('employee')->name('employee.')->group(function () {
        Route::get('/dashboard', [EmployeeController::class, 'dashboard'])->name('dashboard');
        Route::post('/clock-in', [EmployeeController::class, 'clockIn'])->name('clock-in');
        Route::post('/clock-out', [EmployeeController::class, 'clockOut'])->name('clock-out');
        Route::post('/apply-leave', [EmployeeController::class, 'applyLeave'])->name('apply-leave');
    });
});
