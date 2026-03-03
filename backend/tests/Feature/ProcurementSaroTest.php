<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\Procurement;
use App\Models\ProcurementMode;
use App\Models\Project;
use App\Models\Saro;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProcurementSaroTest extends TestCase
{
    use RefreshDatabase;

    public function test_budget_officer_can_upload_saro_and_create_revision_and_notification(): void
    {
        Storage::fake('public');

        [$procurement, $requester] = $this->createProcurementWithRequester();
        $budgetOfficer = User::factory()->create(['access_type' => 'budget_officer']);

        $response = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->post('/procurements/'.$procurement->id.'/saro', [
                'file' => UploadedFile::fake()->create('Official SARO.pdf', 512, 'application/pdf'),
                'remarks' => 'Initial SARO upload',
            ], ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('saro.procurement_id', $procurement->id);

        $saro = Saro::where('procurement_id', $procurement->id)->firstOrFail();

        Storage::disk('public')->assertExists($saro->file_path);
        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $procurement->id,
            'action' => 'saro_uploaded',
            'entity_type' => 'saro',
            'entity_id' => $saro->id,
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $requester->id,
            'type' => 'saro_uploaded',
        ]);
    }

    public function test_unauthorized_user_cannot_upload_saro(): void
    {
        Storage::fake('public');

        [$procurement] = $this->createProcurementWithRequester();
        $plainUser = User::factory()->create(['access_type' => 'user']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($plainUser)
            ->post('/procurements/'.$procurement->id.'/saro', [
                'file' => UploadedFile::fake()->create('Denied SARO.pdf', 100, 'application/pdf'),
            ], ['Accept' => 'application/json'])
            ->assertForbidden();
    }

    public function test_download_saro_enforces_access_control(): void
    {
        Storage::fake('public');

        [$procurement, $requester] = $this->createProcurementWithRequester();
        $budgetOfficer = User::factory()->create(['access_type' => 'budget_officer']);
        $otherUser = User::factory()->create(['access_type' => 'user']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->post('/procurements/'.$procurement->id.'/saro', [
                'file' => UploadedFile::fake()->create('Downloadable SARO.pdf', 120, 'application/pdf'),
            ], ['Accept' => 'application/json'])->assertCreated();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($otherUser)
            ->get('/procurements/'.$procurement->id.'/saro/download')
            ->assertForbidden();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($requester)
            ->get('/procurements/'.$procurement->id.'/saro/download')
            ->assertOk();
    }

    public function test_replace_and_delete_saro_create_revision_rows(): void
    {
        Storage::fake('public');

        [$procurement] = $this->createProcurementWithRequester();
        $budgetOfficer = User::factory()->create(['access_type' => 'budget_officer']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->post('/procurements/'.$procurement->id.'/saro', [
                'file' => UploadedFile::fake()->create('First SARO.pdf', 100, 'application/pdf'),
            ], ['Accept' => 'application/json'])->assertCreated();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->post('/procurements/'.$procurement->id.'/saro', [
                'file' => UploadedFile::fake()->create('Second SARO.pdf', 130, 'application/pdf'),
                'remarks' => 'Updated file',
            ], ['Accept' => 'application/json'])->assertOk();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->deleteJson('/procurements/'.$procurement->id.'/saro')
            ->assertOk();

        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $procurement->id,
            'action' => 'saro_uploaded',
        ]);
        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $procurement->id,
            'action' => 'saro_replaced',
        ]);
        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $procurement->id,
            'action' => 'saro_deleted',
        ]);
    }

    private function createProcurementWithRequester(): array
    {
        $requester = User::factory()->create(['access_type' => 'user']);
        $project = Project::firstOrCreate(['name' => 'SARO Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $procurement = Procurement::create([
            'procurement_no' => 'PR-2026-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT),
            'title' => 'SARO Test Procurement',
            'procurement_mode_id' => $mode->id,
            'project_id' => $project->id,
            'status' => 'pending',
            'description' => 'SARO testing record',
            'requested_by' => $requester->id,
            'deleted' => false,
        ]);

        return [$procurement, $requester];
    }
}
