<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\Procurement;
use App\Models\ProcurementMode;
use App\Models\Project;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminReadDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_access_system_data_endpoints(): void
    {
        $superAdmin = User::factory()->create(['access_type' => 'super_admin']);
        $requester = User::factory()->create(['access_type' => 'user']);
        $project = Project::firstOrCreate(['name' => 'Read Data Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $procurement = Procurement::create([
            'procurement_no' => 'PR-2026-900001',
            'title' => 'Read Data Procurement',
            'procurement_mode_id' => $mode->id,
            'project_id' => $project->id,
            'status' => 'pending',
            'description' => 'Data inspection',
            'requested_by' => $requester->id,
            'deleted' => false,
        ]);

        $purchaseRequest = PurchaseRequest::create([
            'procurement_id' => $procurement->id,
            'purchase_request_number' => 'PUR-2026-900001',
            'office' => 'Admin Office',
            'date_created' => now()->toDateString(),
            'responsibility_center_code' => 'RCC-SA-DATA',
            'purpose' => 'System data visibility check',
            'deleted' => false,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->getJson('/super-admin/data/overview')
            ->assertOk()
            ->assertJsonPath('users.total', 2)
            ->assertJsonPath('procurements.total', 1);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->getJson('/super-admin/data/users')
            ->assertOk()
            ->assertJsonPath('total', 2);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->getJson('/super-admin/data/procurements')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $procurement->id);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->getJson('/super-admin/data/purchase-requests')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('data.0.id', $purchaseRequest->id);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->getJson('/super-admin/data/projects')
            ->assertOk();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->getJson('/super-admin/data/procurement-modes')
            ->assertOk();
    }

    public function test_non_super_admin_cannot_access_system_data_endpoints(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->getJson('/super-admin/data/overview')
            ->assertForbidden()
            ->assertJsonPath('message', 'Only super admins can access system data.');
    }
}
