<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuthProfileUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_own_profile_with_profile_picture(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'first_name' => 'Old',
            'last_name' => 'Name',
            'middle_name' => 'Middle',
            'username' => 'old.username',
        ]);

        $image = UploadedFile::fake()->createWithContent(
            'profile.png',
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s4k74sAAAAASUVORK5CYII=')
        );

        $response = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->put('/auth/profile', [
                'first_name' => 'New',
                'last_name' => 'Person',
                'middle_name' => 'Updated',
                'username' => 'new.username',
                'profile_picture' => $image,
            ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Profile updated successfully.')
            ->assertJsonPath('user.first_name', 'New')
            ->assertJsonPath('user.last_name', 'Person')
            ->assertJsonPath('user.middle_name', 'Updated')
            ->assertJsonPath('user.username', 'new.username');

        $user->refresh();

        $this->assertSame('New', $user->first_name);
        $this->assertSame('Person', $user->last_name);
        $this->assertSame('Updated', $user->middle_name);
        $this->assertSame('new.username', $user->username);
        $this->assertNotNull($user->profile_picture);
        Storage::disk('public')->assertExists($user->profile_picture);
    }

    public function test_guest_cannot_update_profile(): void
    {
        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->putJson('/auth/profile', [
                'first_name' => 'Nope',
            ])
            ->assertStatus(401)
            ->assertJsonPath('message', 'Unauthenticated.');
    }
}
