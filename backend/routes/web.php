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
use App\Http\Controllers\SAdminController;
use App\Http\Controllers\SaroController;
use App\Http\Controllers\SrfiAttachmentController;
use App\Http\Controllers\SuperAdminAccountController;
use App\Http\Controllers\SuperAdminReadController;
use App\Http\Controllers\TechnicalSpecificationAttachmentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Utility Routes
|--------------------------------------------------------------------------
|
| This section contains routes that are reachable without authentication.
| They provide general-purpose entry points such as static template downloads
| and the root welcome page. The download route uses a whitelist so the
| backend never exposes arbitrary files from disk.
|
*/

Route::get('/download/template/{filename}', function ($filename) {
    // Whitelist allowed files — never let users pass arbitrary filenames
    $allowed = [
        'NGPA_PPMP.pdf',
        'SRFI.pdf',
    ];

    if (!in_array($filename, $allowed)) {
        abort(404);
    }

    $path = public_path('templates/' . $filename);

    if (!file_exists($path)) {
        abort(404, 'File not found.');
    }

    return response()->download($path, $filename, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'attachment; filename="' . $filename . '"',
    ]);
})->name('download.template');
Route::get('/', function () {
    return view('welcome');
});
/*
|--------------------------------------------------------------------------
| Guest OTP Authentication Routes
|--------------------------------------------------------------------------
|
| These routes are only available to guests and handle the OTP login flow
| for regular users: request a code, verify a code, and resend a code.
|
*/
Route::middleware('guest')->prefix('auth')->group(function (): void {
    Route::post('/request-otp', [AuthController::class, 'requestOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
});
/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
|
| Every route in this block requires a valid authenticated session and a
| matching active device fingerprint. This is the main protected area for
| regular users of the system.
|
*/
Route::middleware(['auth', 'active.device'])->group(function (): void {
    /*
    |--------------------------------------------------------------------------
    | Session + Self-Profile Endpoints
    |--------------------------------------------------------------------------
    |
    | These endpoints expose the current authenticated user's own session and
    | profile data. The update endpoint gives the frontend one place to edit
    | self-managed fields like names, username, and profile picture.
    |
    */
    Route::prefix('auth')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::get('/profile', [AuthController::class, 'profile']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
    /*
    |--------------------------------------------------------------------------
    | Procurement Routes
    |--------------------------------------------------------------------------
    |
    | This is the main procurement workspace: listing, searching, filtering,
    | creating, updating, duplicating, deleting, restoring, and reviewing
    | procurement records.
    |
    */
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

        /*
        |--------------------------------------------------------------------------
        | Generic Procurement Attachments
        |--------------------------------------------------------------------------
        |
        | These routes manage the legacy/general attachment records linked to a
        | procurement. They remain useful for files that are not part of the
        | newer dedicated attachment module tables.
        |
        */
        Route::post('/{procurement}/attachments', [ProcurementController::class, 'uploadAttachment']);
        Route::get('/{procurement}/attachments/{attachment}', [ProcurementController::class, 'showAttachment']);
        Route::get('/{procurement}/attachments/{attachment}/download', [ProcurementController::class, 'downloadAttachment']);

        /*
        |--------------------------------------------------------------------------
        | Single-File Procurement Modules
        |--------------------------------------------------------------------------
        |
        | These document modules each represent one logical file slot per
        | procurement. Every module follows the same upload/replace/show/
        | download/delete pattern for consistent frontend integration.
        |
        */
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

        /*
        |--------------------------------------------------------------------------
        | Technical Specification Attachments
        |--------------------------------------------------------------------------
        |
        | Technical specifications are modeled as a multi-file child
        | collection rather than a single-file slot, so this section uses a
        | collection/item route pattern.
        |
        */
        Route::post('/{procurement}/technical-specifications', [TechnicalSpecificationAttachmentController::class, 'upload']);
        Route::get('/{procurement}/technical-specifications', [TechnicalSpecificationAttachmentController::class, 'index']);
        Route::get('/{procurement}/technical-specifications/{technicalSpecification}', [TechnicalSpecificationAttachmentController::class, 'show']);
        Route::get('/{procurement}/technical-specifications/{technicalSpecification}/download', [TechnicalSpecificationAttachmentController::class, 'download']);
        Route::put('/{procurement}/technical-specifications/{technicalSpecification}', [TechnicalSpecificationAttachmentController::class, 'update']);
        Route::delete('/{procurement}/technical-specifications/{technicalSpecification}', [TechnicalSpecificationAttachmentController::class, 'destroy']);
    });
    /*
    |--------------------------------------------------------------------------
    | Purchase Request Routes
    |--------------------------------------------------------------------------
    |
    | Purchase requests and their item rows are maintained independently from
    | the procurement shell record. These endpoints support the full CRUD-ish
    | lifecycle including soft delete and restore.
    |
    */
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

    /*
    |--------------------------------------------------------------------------
    | In-App Notification Routes
    |--------------------------------------------------------------------------
    |
    | These endpoints power the app's notification center for the logged-in
    | user. They are separate from the workflow code that actually decides
    | when a notification email or record should be created.
    |
    */
    Route::prefix('notifications')->group(function (): void {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('/read-all', [NotificationController::class, 'markAllRead']);   // ← must come BEFORE /{notification}
        Route::patch('/{notification}/read', [NotificationController::class, 'markRead']);
    });

    /*
    |--------------------------------------------------------------------------
    | Shared Reference Data Routes
    |--------------------------------------------------------------------------
    |
    | These read endpoints expose master data used throughout forms, filters,
    | and selection controls across the procurement workflow.
    |
    */
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/procurement-modes', [ProcurementModeController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Reporting Routes
    |--------------------------------------------------------------------------
    |
    | Reporting endpoints return summary and dashboard-style data rather than
    | raw resource CRUD payloads.
    |
    */
    Route::prefix('reports')->group(function (): void {
        Route::get('/overview', [ReportController::class, 'overview']);
    });

    /*
    |--------------------------------------------------------------------------
    | Super Admin Account Management Routes
    |--------------------------------------------------------------------------
    |
    | These are high-privilege account-management endpoints used by super
    | admins to create, update, deactivate, and reactivate system users.
    |
    */
    Route::prefix('super-admin/accounts')->group(function (): void {
        Route::get('/', [SuperAdminAccountController::class, 'index']);
        Route::post('/', [SuperAdminAccountController::class, 'store']);
        Route::put('/{user}', [SuperAdminAccountController::class, 'update']);
        Route::delete('/{user}', [SuperAdminAccountController::class, 'deactivate']);
        Route::patch('/{user}/activate', [SuperAdminAccountController::class, 'activate']);
    });

    /*
    |--------------------------------------------------------------------------
    | Super Admin Read-Only Data Routes
    |--------------------------------------------------------------------------
    |
    | These endpoints support super-admin dashboards and overview pages with
    | broad visibility into system data without mixing that concern into the
    | mutating management controllers.
    |
    */
    Route::prefix('super-admin/data')->group(function (): void {
        Route::get('/overview', [SuperAdminReadController::class, 'overview']);
        Route::get('/users', [SuperAdminReadController::class, 'users']);
        Route::get('/procurements', [SuperAdminReadController::class, 'procurements']);
        Route::get('/purchase-requests', [SuperAdminReadController::class, 'purchaseRequests']);
        Route::get('/revisions', [SuperAdminReadController::class, 'revisions']);
        Route::get('/projects', [SuperAdminReadController::class, 'projects']);
        Route::get('/procurement-modes', [SuperAdminReadController::class, 'procurementModes']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Account Management Routes
    |--------------------------------------------------------------------------
    |
    | Regular admins can manage accounts with a narrower scope than super
    | admins. They can list, create, and update users, but they do not own
    | activate/deactivate lifecycle operations here.
    |
    */
    Route::prefix('admin/accounts')->group(function (): void {
        Route::get('/', [AdminAccountController::class, 'index']);
        Route::post('/', [AdminAccountController::class, 'store']);
        Route::put('/{user}', [AdminAccountController::class, 'update']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Reference Data Creation Routes
    |--------------------------------------------------------------------------
    |
    | These write endpoints let admins create shared reference records used
    | elsewhere in procurement forms and filters.
    |
    */
    Route::prefix('admin/projects')->group(function (): void {
        Route::post('/', [ProjectController::class, 'store']);
    });

    Route::prefix('admin/procurement-modes')->group(function (): void {
        Route::post('/', [ProcurementModeController::class, 'store']);
    });
});

// -- sAdmin routes --------------------------------------------------------------
/*
|--------------------------------------------------------------------------
| sAdmin Routes
|--------------------------------------------------------------------------
|
| The sAdmin area is intentionally separate from the regular user session
| flow. It uses its own OTP login process and a dedicated `active.sadmin`
| middleware instead of the normal `auth` + `active.device` pair.
|
*/
Route::prefix('sadmin')->group(function (): void {

    // -- Open: OTP auth (no session required) ----------------------------------
    /*
    |--------------------------------------------------------------------------
    | Open sAdmin OTP Authentication
    |--------------------------------------------------------------------------
    |
    | These endpoints are public because they are used to establish the
    | sAdmin session before protected workspace access is available.
    |
    */
    Route::post('/request-otp', [SAdminController::class, 'requestSAdminOtp']);
    Route::post('/verify-otp', [SAdminController::class, 'verifySAdminOtp']);
    Route::post('/resend-otp', [SAdminController::class, 'resendSAdminOtp']);

    // -- Protected: require a valid sAdmin session ------------------------------
    /*
    |--------------------------------------------------------------------------
    | Protected sAdmin Workspace
    |--------------------------------------------------------------------------
    |
    | After the sAdmin session is established, these routes expose the
    | dedicated sAdmin workspace for procurement review, procurement
    | creation, user listing/deactivation, and reference-data maintenance.
    |
    */
    Route::middleware('active.sadmin')->group(function (): void {
        Route::get('/me', [SAdminController::class, 'me']);
        Route::post('/logout', [SAdminController::class, 'logoutSAdmin']);
        Route::get('/procurements', [SAdminController::class, 'procurements']);
        Route::get('/procurements/filter', [SAdminController::class, 'filterProcurements']);
        Route::post('/procurements', [SAdminController::class, 'storeProcurement']);
        Route::post('/procurements/{procurement}/attachments', [SAdminController::class, 'uploadProcurementAttachment']);
        Route::get('/users', [SAdminController::class, 'users']);
        Route::delete('/users/{id}', [SAdminController::class, 'deleteUser']);
        // Reference data � readable by sAdmin
        /*
        |--------------------------------------------------------------------------
        | sAdmin Reference Data Routes
        |--------------------------------------------------------------------------
        |
        | sAdmin can read and create the shared reference data required to
        | build and manage procurement records inside this workspace.
        |
        */
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::post('/projects', [SAdminController::class, 'storeProject']);
        Route::get('/procurement-modes', [ProcurementModeController::class, 'index']);
        Route::post('/procurement-modes', [SAdminController::class, 'storeProcurementMode']);
        Route::get('/purchase-requests', [SAdminController::class, 'purchaseRequests']);
    });
});




