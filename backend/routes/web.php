<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProcurementModeController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PurchaseRequestController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
    //otp login routes
Route::middleware('guest')->prefix('auth')->group(function (): void {
    Route::post('/request-otp', [AuthController::class, 'requestOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
});
    // auth routes
Route::middleware(['auth', 'active.device'])->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
    // procurement routes
    Route::prefix('procurements')->group(function (): void {
        Route::get('/', [ProcurementController::class, 'index']);
        Route::get('/search', [ProcurementController::class, 'search'])->middleware('throttle:procurement-search');
        Route::get('/filter', [ProcurementController::class, 'filter']);
        Route::post('/', [ProcurementController::class, 'store']);
        Route::get('/{procurement}', [ProcurementController::class, 'show']);
        Route::put('/{procurement}', [ProcurementController::class, 'update']);
        Route::delete('/{procurement}', [ProcurementController::class, 'destroy']);
        Route::patch('/{procurement}/restore', [ProcurementController::class, 'restore']);

        Route::post('/{procurement}/attachments', [ProcurementController::class, 'uploadAttachment']);
        Route::get('/{procurement}/attachments/{attachment}', [ProcurementController::class, 'showAttachment']);
        Route::get('/{procurement}/attachments/{attachment}/download', [ProcurementController::class, 'downloadAttachment']);
    });
    // purchase request routes
    Route::prefix('purchase-requests')->group(function (): void {
        Route::get('/', [PurchaseRequestController::class, 'index']);
        Route::get('/{purchaseRequest}', [PurchaseRequestController::class, 'show']);
        Route::put('/{purchaseRequest}', [PurchaseRequestController::class, 'update']);
        Route::delete('/{purchaseRequest}', [PurchaseRequestController::class, 'destroy']);
        Route::patch('/{purchaseRequest}/restore', [PurchaseRequestController::class, 'restore']);

        Route::post('/{purchaseRequest}/items', [PurchaseRequestController::class, 'storeItem']);
        Route::put('/{purchaseRequest}/items/{item}', [PurchaseRequestController::class, 'updateItem']);
        Route::delete('/{purchaseRequest}/items/{item}', [PurchaseRequestController::class, 'destroyItem']);
        Route::patch('/{purchaseRequest}/items/{item}/restore', [PurchaseRequestController::class, 'restoreItem']);
    });

    // notification routes
    Route::prefix('notifications')->group(function (): void {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('/{notification}/read', [NotificationController::class, 'markRead']);
        Route::patch('/read-all', [NotificationController::class, 'markAllRead']);
    });

    // reference data routes (projects & modes)
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/procurement-modes', [ProcurementModeController::class, 'index']);

    // reports routes
    Route::prefix('reports')->group(function (): void {
        Route::get('/overview', [ReportController::class, 'overview']);
    });
});
