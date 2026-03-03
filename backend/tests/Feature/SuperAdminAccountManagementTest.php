<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminAccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_user_with_role_payload(): void
    {
        $superAdmin = User::factory()->create([
            'access_type' => 'super_admin',
            'is_active' => true,
            'is_authorized' => true,
        ]);

        $response = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->postJson('/super-admin/accounts', [
                'last_name' => 'Dela Cruz',
                'first_name' => 'Maria',
                'middle_name' => 'Santos',
                'email' => 'maria.delacruz@gov.ph',
                'username' => 'maria.delacruz',
                'access_type' => 'budget_officer',
                'is_authorized' => true,
                'role' => [
                    'role_type' => 'budget_officer',
                    'designation' => 'Budget Division',
                    'position' => 'Budget Officer I',
                    'role' => 'budget_officer',
                ],
            ]);

        $response->assertCreated()
            ->assertJsonPath('user.access_type', 'budget_officer')
            ->assertJsonPath('user.email', 'maria.delacruz@gov.ph');

        $this->assertDatabaseHas('users', [
            'email' => 'maria.delacruz@gov.ph',
            'username' => 'maria.delacruz',
            'access_type' => 'budget_officer',
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('roles', [
            'role_type' => 'budget_officer',
            'position' => 'Budget Officer I',
        ]);
    }

    public function test_non_super_admin_cannot_create_accounts(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->postJson('/super-admin/accounts', [
                'last_name' => 'Test',
                'first_name' => 'User',
                'email' => 'test.user@gov.ph',
                'username' => 'test.user',
                'access_type' => 'user',
            ])->assertForbidden();
    }

    public function test_super_admin_can_update_user_and_deactivate_then_activate(): void
    {
        $superAdmin = User::factory()->create([
            'access_type' => 'super_admin',
            'is_active' => true,
            'is_authorized' => true,
        ]);

        $role = Role::create([
            'role_type' => 'user',
            'designation' => 'Operations',
            'position' => 'Staff',
            'role' => 'user',
        ]);

        $user = User::factory()->create([
            'access_type' => 'user',
            'role_id' => $role->id,
            'is_active' => true,
            'is_authorized' => true,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->putJson('/super-admin/accounts/'.$user->id, [
                'first_name' => 'Updated',
                'access_type' => 'admin',
                'role' => [
                    'role_type' => 'admin',
                    'designation' => 'Administration',
                    'position' => 'Admin Officer',
                    'role' => 'admin',
                ],
            ])
            ->assertOk()
            ->assertJsonPath('user.first_name', 'Updated')
            ->assertJsonPath('user.access_type', 'admin');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'first_name' => 'Updated',
            'access_type' => 'admin',
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->deleteJson('/super-admin/accounts/'.$user->id)
            ->assertOk()
            ->assertJsonPath('user.is_active', false);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_active' => false,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->patchJson('/super-admin/accounts/'.$user->id.'/activate')
            ->assertOk()
            ->assertJsonPath('user.is_active', true);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_active' => true,
        ]);
    }
}
