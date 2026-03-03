<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProcurementModeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_procurement_mode(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->postJson('/admin/procurement-modes', [
                'code' => 'svp',
                'name' => 'Small Value Procurement',
                'legal_basis' => 'RA 12009',
                'description' => 'Alternative mode for low-value procurements',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('procurement_mode.code', 'SVP')
            ->assertJsonPath('procurement_mode.name', 'Small Value Procurement');

        $this->assertDatabaseHas('procurement_modes', [
            'code' => 'SVP',
            'name' => 'Small Value Procurement',
        ]);
    }

    public function test_non_admin_cannot_create_procurement_mode(): void
    {
        $user = User::factory()->create(['access_type' => 'user']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->postJson('/admin/procurement-modes', [
                'name' => 'Blocked Mode',
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Only admins can create procurement modes.');
    }

    public function test_procurement_mode_code_and_name_must_be_unique(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->postJson('/admin/procurement-modes', [
                'code' => 'TVP',
                'name' => 'Test Value Procurement',
            ])
            ->assertCreated();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->postJson('/admin/procurement-modes', [
                'code' => 'TVP',
                'name' => 'Test Value Procurement',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['code', 'name']);
    }
}
