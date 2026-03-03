<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminProjectManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_project(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->postJson('/admin/projects', [
                'name' => 'National Broadband Upgrade',
                'description' => 'Priority infrastructure program',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('project.name', 'National Broadband Upgrade')
            ->assertJsonPath('project.is_active', true);

        $this->assertDatabaseHas('projects', [
            'name' => 'National Broadband Upgrade',
            'is_active' => true,
        ]);
    }

    public function test_non_admin_cannot_create_project(): void
    {
        $user = User::factory()->create(['access_type' => 'user']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->postJson('/admin/projects', [
                'name' => 'Blocked Project',
            ])
            ->assertForbidden()
            ->assertJsonPath('message', 'Only admins can create projects.');
    }

    public function test_project_name_must_be_unique(): void
    {
        $admin = User::factory()->create(['access_type' => 'admin']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->postJson('/admin/projects', [
                'name' => 'Unique Name Project',
            ])
            ->assertCreated();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($admin)
            ->postJson('/admin/projects', [
                'name' => 'Unique Name Project',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}
