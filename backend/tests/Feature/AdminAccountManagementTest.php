<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_account(): void
    {
        $admin = User::factory()->create([
            'access_type' => 'admin',
            'is_active' => true,
            'is_authorized' => true,
        ]);

        $response = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->postJson('/admin/accounts', [
                'last_name' => 'User',
                'first_name' => 'Created',
                'email' => 'created.user@gov.ph',
                'username' => 'created.user',
                'access_type' => 'user',
                'role' => [
                    'role_type' => 'user',
                    'designation' => 'Operations',
                    'position' => 'Staff',
                    'role' => 'user',
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'created.user@gov.ph')
            ->assertJsonPath('user.access_type', 'user');
    }

    public function test_admin_can_change_user_to_budget_officer(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);
        $target = User::factory()->create(['access_type' => 'user']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->putJson('/admin/accounts/'.$target->id, [
                'access_type' => 'budget_officer',
            ])
            ->assertOk()
            ->assertJsonPath('user.access_type', 'budget_officer');

        $this->assertDatabaseHas('users', [
            'id' => $target->id,
            'access_type' => 'budget_officer',
        ]);
    }

    public function test_admin_cannot_downgrade_admin_to_user(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);
        $targetAdmin = User::factory()->create(['access_type' => 'admin']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->putJson('/admin/accounts/'.$targetAdmin->id, [
                'access_type' => 'user',
            ])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Admin access type cannot be downgraded by an admin.');
    }

    public function test_non_admin_cannot_access_admin_account_endpoints(): void
    {
        $user = User::factory()->create(['access_type' => 'user']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->getJson('/admin/accounts')
            ->assertForbidden();
    }

    public function test_admin_cannot_update_super_admin_account(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);
        $superAdminRole = Role::create([
            'role_type' => 'super_admin',
            'designation' => 'System',
            'position' => 'Super Admin',
            'role' => 'super_admin',
        ]);
        $superAdmin = User::factory()->create([
            'access_type' => 'super_admin',
            'role_id' => $superAdminRole->id,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->putJson('/admin/accounts/'.$superAdmin->id, [
                'first_name' => 'Nope',
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Admin cannot update super admin accounts.');
    }
}
