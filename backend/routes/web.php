<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminAccountController;
use App\Http\Controllers\AppAttachmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProcurementModeController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PpmpAttachmentController;
use App\Http\Controllers\MsriAttachmentController;
use App\Http\Controllers\PurchaseRequestController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaroController;
use App\Http\Controllers\SrfiAttachmentController;
use App\Http\Controllers\SuperAdminAccountController;
use App\Http\Controllers\SuperAdminReadController;
use App\Http\Controllers\TechnicalSpecificationAttachmentController;
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
        Route::get('/mine', [ProcurementController::class, 'mine']);
        Route::get('/search', [ProcurementController::class, 'search'])->middleware('throttle:procurement-search');
        Route::get('/filter', [ProcurementController::class, 'filter']);
        Route::post('/', [ProcurementController::class, 'store']);
        Route::post('/{procurement}/duplicate', [ProcurementController::class, 'duplicate']);
        Route::get('/{procurement}', [ProcurementController::class, 'show']);
        Route::get('/{procurement}/revisions', [ProcurementController::class, 'revisions']);
        Route::put('/{procurement}', [ProcurementController::class, 'update']);
        Route::delete('/{procurement}', [ProcurementController::class, 'destroy']);
        Route::patch('/{procurement}/restore', [ProcurementController::class, 'restore']);

        Route::post('/{procurement}/attachments', [ProcurementController::class, 'uploadAttachment']);
        Route::get('/{procurement}/attachments/{attachment}', [ProcurementController::class, 'showAttachment']);
        Route::get('/{procurement}/attachments/{attachment}/download', [ProcurementController::class, 'downloadAttachment']);
        Route::post('/{procurement}/saro', [SaroController::class, 'upload']);
        Route::put('/{procurement}/saro', [SaroController::class, 'replace']);
        Route::get('/{procurement}/saro', [SaroController::class, 'show']);
        Route::get('/{procurement}/saro/download', [SaroController::class, 'download']);
        Route::delete('/{procurement}/saro', [SaroController::class, 'destroy']);

        Route::post('/{procurement}/app', [AppAttachmentController::class, 'upload']);
        Route::put('/{procurement}/app', [AppAttachmentController::class, 'replace']);
        Route::get('/{procurement}/app', [AppAttachmentController::class, 'show']);
        Route::get('/{procurement}/app/download', [AppAttachmentController::class, 'download']);
        Route::delete('/{procurement}/app', [AppAttachmentController::class, 'destroy']);

        Route::post('/{procurement}/ppmp', [PpmpAttachmentController::class, 'upload']);
        Route::put('/{procurement}/ppmp', [PpmpAttachmentController::class, 'replace']);
        Route::get('/{procurement}/ppmp', [PpmpAttachmentController::class, 'show']);
        Route::get('/{procurement}/ppmp/download', [PpmpAttachmentController::class, 'download']);
        Route::delete('/{procurement}/ppmp', [PpmpAttachmentController::class, 'destroy']);

        Route::post('/{procurement}/msri', [MsriAttachmentController::class, 'upload']);
        Route::put('/{procurement}/msri', [MsriAttachmentController::class, 'replace']);
        Route::get('/{procurement}/msri', [MsriAttachmentController::class, 'show']);
        Route::get('/{procurement}/msri/download', [MsriAttachmentController::class, 'download']);
        Route::delete('/{procurement}/msri', [MsriAttachmentController::class, 'destroy']);

        Route::post('/{procurement}/srfi', [SrfiAttachmentController::class, 'upload']);
        Route::put('/{procurement}/srfi', [SrfiAttachmentController::class, 'replace']);
        Route::get('/{procurement}/srfi', [SrfiAttachmentController::class, 'show']);
        Route::get('/{procurement}/srfi/download', [SrfiAttachmentController::class, 'download']);
        Route::delete('/{procurement}/srfi', [SrfiAttachmentController::class, 'destroy']);
        Route::post('/{procurement}/technical-specifications', [TechnicalSpecificationAttachmentController::class, 'upload']);
        Route::get('/{procurement}/technical-specifications', [TechnicalSpecificationAttachmentController::class, 'index']);
        Route::get('/{procurement}/technical-specifications/{technicalSpecification}', [TechnicalSpecificationAttachmentController::class, 'show']);
        Route::get('/{procurement}/technical-specifications/{technicalSpecification}/download', [TechnicalSpecificationAttachmentController::class, 'download']);
        Route::put('/{procurement}/technical-specifications/{technicalSpecification}', [TechnicalSpecificationAttachmentController::class, 'update']);
        Route::delete('/{procurement}/technical-specifications/{technicalSpecification}', [TechnicalSpecificationAttachmentController::class, 'destroy']);
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

    // super admin account management routes
    Route::prefix('super-admin/accounts')->group(function (): void {
        Route::get('/', [SuperAdminAccountController::class, 'index']);
        Route::post('/', [SuperAdminAccountController::class, 'store']);
        Route::put('/{user}', [SuperAdminAccountController::class, 'update']);
        Route::delete('/{user}', [SuperAdminAccountController::class, 'deactivate']);
        Route::patch('/{user}/activate', [SuperAdminAccountController::class, 'activate']);
    });

    // super admin read-only data routes
    Route::prefix('super-admin/data')->group(function (): void {
        Route::get('/overview', [SuperAdminReadController::class, 'overview']);
        Route::get('/users', [SuperAdminReadController::class, 'users']);
        Route::get('/procurements', [SuperAdminReadController::class, 'procurements']);
        Route::get('/purchase-requests', [SuperAdminReadController::class, 'purchaseRequests']);
        Route::get('/revisions', [SuperAdminReadController::class, 'revisions']);
        Route::get('/projects', [SuperAdminReadController::class, 'projects']);
        Route::get('/procurement-modes', [SuperAdminReadController::class, 'procurementModes']);
    });

    // admin account management routes (no deactivate)
    Route::prefix('admin/accounts')->group(function (): void {
        Route::get('/', [AdminAccountController::class, 'index']);
        Route::post('/', [AdminAccountController::class, 'store']);
        Route::put('/{user}', [AdminAccountController::class, 'update']);
    });

    Route::prefix('admin/projects')->group(function (): void {
        Route::post('/', [ProjectController::class, 'store']);
    });

    Route::prefix('admin/procurement-modes')->group(function (): void {
        Route::post('/', [ProcurementModeController::class, 'store']);
    });
});

// -- sAdmin routes --------------------------------------------------------------











