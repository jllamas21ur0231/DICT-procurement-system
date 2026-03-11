<?php

namespace Tests\Feature;

use App\Http\Controllers\AdminAccountController;
use App\Http\Controllers\AppAttachmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MsriAttachmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\ProcurementModeController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PpmpAttachmentController;
use App\Http\Controllers\PurchaseRequestController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SAdminController;
use App\Http\Controllers\SaroController;
use App\Http\Controllers\SrfiAttachmentController;
use App\Http\Controllers\SuperAdminAccountController;
use App\Http\Controllers\SuperAdminReadController;
use App\Http\Controllers\TechnicalSpecificationAttachmentController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route as LaravelRoute;
use Tests\TestCase;

class WebRoutesRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_web_endpoint_is_registered_with_expected_method_and_action(): void
    {
        // Root
        $this->assertRegistered('GET', '/');

        // Guest auth OTP
        $this->assertRegistered('POST', '/auth/request-otp', AuthController::class.'@requestOtp');
        $this->assertRegistered('POST', '/auth/verify-otp', AuthController::class.'@verifyOtp');
        $this->assertRegistered('POST', '/auth/resend-otp', AuthController::class.'@resendOtp');

        // Auth profile/session
        $this->assertRegistered('GET', '/auth/me', AuthController::class.'@me');
        $this->assertRegistered('GET', '/auth/profile', AuthController::class.'@profile');
        $this->assertRegistered('POST', '/auth/logout', AuthController::class.'@logout');

        // Procurements core
        $this->assertRegistered('GET', '/procurements', ProcurementController::class.'@index');
        $this->assertRegistered('GET', '/procurements/mine', ProcurementController::class.'@mine');
        $this->assertRegistered('GET', '/procurements/search', ProcurementController::class.'@search');
        $this->assertRegistered('GET', '/procurements/filter', ProcurementController::class.'@filter');
        $this->assertRegistered('POST', '/procurements', ProcurementController::class.'@store');
        $this->assertRegistered('POST', '/procurements/{procurement}/duplicate', ProcurementController::class.'@duplicate');
        $this->assertRegistered('GET', '/procurements/{procurement}', ProcurementController::class.'@show');
        $this->assertRegistered('GET', '/procurements/{procurement}/revisions', ProcurementController::class.'@revisions');
        $this->assertRegistered('PUT', '/procurements/{procurement}', ProcurementController::class.'@update');
        $this->assertRegistered('DELETE', '/procurements/{procurement}', ProcurementController::class.'@destroy');
        $this->assertRegistered('PATCH', '/procurements/{procurement}/restore', ProcurementController::class.'@restore');

        // Legacy generic procurement attachments
        $this->assertRegistered('POST', '/procurements/{procurement}/attachments', ProcurementController::class.'@uploadAttachment');
        $this->assertRegistered('GET', '/procurements/{procurement}/attachments/{attachment}', ProcurementController::class.'@showAttachment');
        $this->assertRegistered('GET', '/procurements/{procurement}/attachments/{attachment}/download', ProcurementController::class.'@downloadAttachment');

        // Single-file module attachments (SARO/APP/PPMP/MSRI/SRFI)
        $singleModules = [
            ['segment' => 'saro', 'controller' => SaroController::class],
            ['segment' => 'app', 'controller' => AppAttachmentController::class],
            ['segment' => 'ppmp', 'controller' => PpmpAttachmentController::class],
            ['segment' => 'msri', 'controller' => MsriAttachmentController::class],
            ['segment' => 'srfi', 'controller' => SrfiAttachmentController::class],
        ];

        foreach ($singleModules as $module) {
            $base = '/procurements/{procurement}/'.$module['segment'];
            $controller = $module['controller'];

            $this->assertRegistered('POST', $base, $controller.'@upload');
            $this->assertRegistered('PUT', $base, $controller.'@replace');
            $this->assertRegistered('GET', $base, $controller.'@show');
            $this->assertRegistered('GET', $base.'/download', $controller.'@download');
            $this->assertRegistered('DELETE', $base, $controller.'@destroy');
        }

        // Technical specifications (multi-file)
        $this->assertRegistered('POST', '/procurements/{procurement}/technical-specifications', TechnicalSpecificationAttachmentController::class.'@upload');
        $this->assertRegistered('GET', '/procurements/{procurement}/technical-specifications', TechnicalSpecificationAttachmentController::class.'@index');
        $this->assertRegistered('GET', '/procurements/{procurement}/technical-specifications/{technicalSpecification}', TechnicalSpecificationAttachmentController::class.'@show');
        $this->assertRegistered('GET', '/procurements/{procurement}/technical-specifications/{technicalSpecification}/download', TechnicalSpecificationAttachmentController::class.'@download');
        $this->assertRegistered('PUT', '/procurements/{procurement}/technical-specifications/{technicalSpecification}', TechnicalSpecificationAttachmentController::class.'@update');
        $this->assertRegistered('DELETE', '/procurements/{procurement}/technical-specifications/{technicalSpecification}', TechnicalSpecificationAttachmentController::class.'@destroy');

        // Purchase requests + items
        $this->assertRegistered('GET', '/purchase-requests', PurchaseRequestController::class.'@index');
        $this->assertRegistered('GET', '/purchase-requests/{purchaseRequest}', PurchaseRequestController::class.'@show');
        $this->assertRegistered('PUT', '/purchase-requests/{purchaseRequest}', PurchaseRequestController::class.'@update');
        $this->assertRegistered('DELETE', '/purchase-requests/{purchaseRequest}', PurchaseRequestController::class.'@destroy');
        $this->assertRegistered('PATCH', '/purchase-requests/{purchaseRequest}/restore', PurchaseRequestController::class.'@restore');
        $this->assertRegistered('POST', '/purchase-requests/{purchaseRequest}/items', PurchaseRequestController::class.'@storeItem');
        $this->assertRegistered('PUT', '/purchase-requests/{purchaseRequest}/items/{item}', PurchaseRequestController::class.'@updateItem');
        $this->assertRegistered('DELETE', '/purchase-requests/{purchaseRequest}/items/{item}', PurchaseRequestController::class.'@destroyItem');
        $this->assertRegistered('PATCH', '/purchase-requests/{purchaseRequest}/items/{item}/restore', PurchaseRequestController::class.'@restoreItem');

        // Notifications
        $this->assertRegistered('GET', '/notifications', NotificationController::class.'@index');
        $this->assertRegistered('GET', '/notifications/unread-count', NotificationController::class.'@unreadCount');
        $this->assertRegistered('PATCH', '/notifications/{notification}/read', NotificationController::class.'@markRead');
        $this->assertRegistered('PATCH', '/notifications/read-all', NotificationController::class.'@markAllRead');

        // References + reports
        $this->assertRegistered('GET', '/projects', ProjectController::class.'@index');
        $this->assertRegistered('GET', '/procurement-modes', ProcurementModeController::class.'@index');
        $this->assertRegistered('GET', '/reports/overview', ReportController::class.'@overview');

        // Super admin accounts
        $this->assertRegistered('GET', '/super-admin/accounts', SuperAdminAccountController::class.'@index');
        $this->assertRegistered('POST', '/super-admin/accounts', SuperAdminAccountController::class.'@store');
        $this->assertRegistered('PUT', '/super-admin/accounts/{user}', SuperAdminAccountController::class.'@update');
        $this->assertRegistered('DELETE', '/super-admin/accounts/{user}', SuperAdminAccountController::class.'@deactivate');
        $this->assertRegistered('PATCH', '/super-admin/accounts/{user}/activate', SuperAdminAccountController::class.'@activate');

        // Super admin read
        $this->assertRegistered('GET', '/super-admin/data/overview', SuperAdminReadController::class.'@overview');
        $this->assertRegistered('GET', '/super-admin/data/users', SuperAdminReadController::class.'@users');
        $this->assertRegistered('GET', '/super-admin/data/procurements', SuperAdminReadController::class.'@procurements');
        $this->assertRegistered('GET', '/super-admin/data/purchase-requests', SuperAdminReadController::class.'@purchaseRequests');
        $this->assertRegistered('GET', '/super-admin/data/revisions', SuperAdminReadController::class.'@revisions');
        $this->assertRegistered('GET', '/super-admin/data/projects', SuperAdminReadController::class.'@projects');
        $this->assertRegistered('GET', '/super-admin/data/procurement-modes', SuperAdminReadController::class.'@procurementModes');

        // Admin account + refs
        $this->assertRegistered('GET', '/admin/accounts', AdminAccountController::class.'@index');
        $this->assertRegistered('POST', '/admin/accounts', AdminAccountController::class.'@store');
        $this->assertRegistered('PUT', '/admin/accounts/{user}', AdminAccountController::class.'@update');
        $this->assertRegistered('POST', '/admin/projects', ProjectController::class.'@store');
        $this->assertRegistered('POST', '/admin/procurement-modes', ProcurementModeController::class.'@store');

        // sAdmin open auth
        $this->assertRegistered('POST', '/sadmin/request-otp', SAdminController::class.'@requestSAdminOtp');
        $this->assertRegistered('POST', '/sadmin/verify-otp', SAdminController::class.'@verifySAdminOtp');
        $this->assertRegistered('POST', '/sadmin/resend-otp', SAdminController::class.'@resendSAdminOtp');

        // sAdmin protected area
        $this->assertRegistered('GET', '/sadmin/me', SAdminController::class.'@me');
        $this->assertRegistered('POST', '/sadmin/logout', SAdminController::class.'@logoutSAdmin');
        $this->assertRegistered('GET', '/sadmin/procurements', SAdminController::class.'@procurements');
        $this->assertRegistered('GET', '/sadmin/procurements/filter', SAdminController::class.'@filterProcurements');
        $this->assertRegistered('POST', '/sadmin/procurements', SAdminController::class.'@storeProcurement');
        $this->assertRegistered('POST', '/sadmin/procurements/{procurement}/attachments', SAdminController::class.'@uploadProcurementAttachment');
        $this->assertRegistered('GET', '/sadmin/users', SAdminController::class.'@users');
        $this->assertRegistered('DELETE', '/sadmin/users/{id}', SAdminController::class.'@deleteUser');
        $this->assertRegistered('GET', '/sadmin/projects', ProjectController::class.'@index');
        $this->assertRegistered('POST', '/sadmin/projects', SAdminController::class.'@storeProject');
        $this->assertRegistered('GET', '/sadmin/procurement-modes', ProcurementModeController::class.'@index');
        $this->assertRegistered('POST', '/sadmin/procurement-modes', SAdminController::class.'@storeProcurementMode');
        $this->assertRegistered('GET', '/sadmin/purchase-requests', SAdminController::class.'@purchaseRequests');
    }

    private function assertRegistered(string $method, string $uri, ?string $expectedAction = null): void
    {
        $method = strtoupper($method);
        $targetUri = trim($uri, '/');

        $route = collect(app('router')->getRoutes()->getRoutes())
            ->first(function (LaravelRoute $route) use ($method, $targetUri): bool {
                $routeUri = trim($route->uri(), '/');

                // Root route can be represented as '' or '/'
                $isUriMatch = $targetUri === ''
                    ? ($routeUri === '' || $route->uri() === '/')
                    : $routeUri === $targetUri;

                return $isUriMatch && in_array($method, $route->methods(), true);
            });

        $this->assertNotNull($route, sprintf('Route not registered: %s %s', $method, $uri));

        if ($expectedAction !== null) {
            $this->assertSame(
                ltrim($expectedAction, '\\'),
                ltrim($route->getActionName(), '\\'),
                sprintf('Unexpected action for route %s %s', $method, $uri)
            );
        }
    }
}
