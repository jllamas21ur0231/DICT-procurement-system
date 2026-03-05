<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\Procurement;
use App\Models\ProcurementMode;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProcurementAttachmentModulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_budget_officer_can_manage_app_ppmp_msri_and_srfi_and_requester_can_view_download(): void
    {
        Storage::fake('public');

        [$procurement, $requester] = $this->createProcurementWithRequester();
        $budgetOfficer = User::factory()->create(['access_type' => 'budget_officer']);

        $modules = [
            [
                'name' => 'app',
                'table' => 'apps',
                'route' => 'app',
                'uploaded_action' => 'app_uploaded',
                'replaced_action' => 'app_replaced',
                'deleted_action' => 'app_deleted',
            ],
            [
                'name' => 'ppmp',
                'table' => 'ppmps',
                'route' => 'ppmp',
                'uploaded_action' => 'ppmp_uploaded',
                'replaced_action' => 'ppmp_replaced',
                'deleted_action' => 'ppmp_deleted',
            ],
            [
                'name' => 'msri',
                'table' => 'msris',
                'route' => 'msri',
                'uploaded_action' => 'msri_uploaded',
                'replaced_action' => 'msri_replaced',
                'deleted_action' => 'msri_deleted',
            ],
            [
                'name' => 'srfi',
                'table' => 'srfis',
                'route' => 'srfi',
                'uploaded_action' => 'srfi_uploaded',
                'replaced_action' => 'srfi_replaced',
                'deleted_action' => 'srfi_deleted',
            ],
        ];

        foreach ($modules as $module) {
            $uploadResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
                ->actingAs($budgetOfficer)
                ->post('/procurements/'.$procurement->id.'/'.$module['route'], [
                    'file' => UploadedFile::fake()->create(strtoupper($module['name']).' Initial.pdf', 200, 'application/pdf'),
                    'remarks' => 'Initial upload',
                ], ['Accept' => 'application/json']);

            $uploadResponse->assertCreated();

            $attachmentId = (int) $uploadResponse->json($module['name'].'.id');

            $this->assertDatabaseHas($module['table'], [
                'id' => $attachmentId,
                'procurement_id' => $procurement->id,
            ]);

            $this->assertDatabaseHas('procurement_revisions', [
                'procurement_id' => $procurement->id,
                'action' => $module['uploaded_action'],
                'entity_id' => $attachmentId,
            ]);

            $this->withoutMiddleware(EnsureActiveDeviceSession::class)
                ->actingAs($requester)
                ->get('/procurements/'.$procurement->id.'/'.$module['route'])
                ->assertOk();

            $this->withoutMiddleware(EnsureActiveDeviceSession::class)
                ->actingAs($requester)
                ->get('/procurements/'.$procurement->id.'/'.$module['route'].'/download')
                ->assertOk();

            $replaceResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
                ->actingAs($budgetOfficer)
                ->put('/procurements/'.$procurement->id.'/'.$module['route'], [
                    'file' => UploadedFile::fake()->create(strtoupper($module['name']).' Replaced.pdf', 220, 'application/pdf'),
                    'remarks' => 'Replaced upload',
                ], ['Accept' => 'application/json']);

            $replaceResponse->assertOk();

            $this->assertDatabaseHas('procurement_revisions', [
                'procurement_id' => $procurement->id,
                'action' => $module['replaced_action'],
            ]);

            $this->withoutMiddleware(EnsureActiveDeviceSession::class)
                ->actingAs($budgetOfficer)
                ->deleteJson('/procurements/'.$procurement->id.'/'.$module['route'])
                ->assertOk();

            $this->assertDatabaseMissing($module['table'], [
                'procurement_id' => $procurement->id,
            ]);

            $this->assertDatabaseHas('procurement_revisions', [
                'procurement_id' => $procurement->id,
                'action' => $module['deleted_action'],
            ]);
        }
    }

    public function test_plain_user_cannot_upload_app_ppmp_msri_and_srfi(): void
    {
        Storage::fake('public');

        [$procurement] = $this->createProcurementWithRequester();
        $plainUser = User::factory()->create(['access_type' => 'user']);

        foreach (['app', 'ppmp', 'msri'] as $route) {
            $this->withoutMiddleware(EnsureActiveDeviceSession::class)
                ->actingAs($plainUser)
                ->post('/procurements/'.$procurement->id.'/'.$route, [
                    'file' => UploadedFile::fake()->create(strtoupper($route).' Denied.pdf', 100, 'application/pdf'),
                ], ['Accept' => 'application/json'])
                ->assertForbidden();
        }
    }

    public function test_budget_officer_can_manage_technical_specifications_full_flow(): void
    {
        Storage::fake('public');

        [$procurement, $requester] = $this->createProcurementWithRequester();
        $budgetOfficer = User::factory()->create(['access_type' => 'budget_officer']);

        $uploadA = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->post('/procurements/'.$procurement->id.'/technical-specifications', [
                'file' => UploadedFile::fake()->create('Tech Spec A.pdf', 180, 'application/pdf'),
                'spec_type' => 'bom',
                'label' => 'Bill of Materials',
                'remarks' => 'First technical document',
                'sort_order' => 1,
            ], ['Accept' => 'application/json']);

        $uploadA->assertCreated();
        $techAId = (int) $uploadA->json('technical_specification.id');

        $uploadB = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->post('/procurements/'.$procurement->id.'/technical-specifications', [
                'file' => UploadedFile::fake()->create('Tech Spec B.pdf', 190, 'application/pdf'),
                'spec_type' => 'drawings',
                'label' => 'Drawings',
                'remarks' => 'Second technical document',
                'sort_order' => 2,
            ], ['Accept' => 'application/json']);

        $uploadB->assertCreated();

        $this->assertDatabaseHas('technical_specifications', [
            'id' => $techAId,
            'procurement_id' => $procurement->id,
            'spec_type' => 'bom',
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($requester)
            ->getJson('/procurements/'.$procurement->id.'/technical-specifications')
            ->assertOk()
            ->assertJsonCount(2, 'technical_specifications');

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($requester)
            ->getJson('/procurements/'.$procurement->id.'/technical-specifications/'.$techAId)
            ->assertOk()
            ->assertJsonPath('technical_specification.id', $techAId);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($requester)
            ->get('/procurements/'.$procurement->id.'/technical-specifications/'.$techAId.'/download')
            ->assertOk();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->put('/procurements/'.$procurement->id.'/technical-specifications/'.$techAId, [
                'file' => UploadedFile::fake()->create('Tech Spec A Updated.pdf', 210, 'application/pdf'),
                'spec_type' => 'updated_bom',
                'label' => 'Updated BOM',
                'remarks' => 'Updated technical document',
                'sort_order' => 5,
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('technical_specification.spec_type', 'updated_bom');

        $this->assertDatabaseHas('technical_specifications', [
            'id' => $techAId,
            'spec_type' => 'updated_bom',
            'sort_order' => 5,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($budgetOfficer)
            ->deleteJson('/procurements/'.$procurement->id.'/technical-specifications/'.$techAId)
            ->assertOk();

        $this->assertDatabaseMissing('technical_specifications', [
            'id' => $techAId,
        ]);

        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $procurement->id,
            'action' => 'technical_spec_uploaded',
        ]);

        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $procurement->id,
            'action' => 'technical_spec_updated',
        ]);

        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $procurement->id,
            'action' => 'technical_spec_deleted',
        ]);
    }

    public function test_plain_user_cannot_upload_technical_specifications(): void
    {
        Storage::fake('public');

        [$procurement] = $this->createProcurementWithRequester();
        $plainUser = User::factory()->create(['access_type' => 'user']);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($plainUser)
            ->post('/procurements/'.$procurement->id.'/technical-specifications', [
                'file' => UploadedFile::fake()->create('Denied Tech Spec.pdf', 120, 'application/pdf'),
                'spec_type' => 'misc',
            ], ['Accept' => 'application/json'])
            ->assertForbidden();
    }

    private function createProcurementWithRequester(): array
    {
        $requester = User::factory()->create(['access_type' => 'user']);
        $project = Project::firstOrCreate(['name' => 'Attachment Test Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $procurement = Procurement::create([
            'procurement_no' => 'PR-2026-'.str_pad((string) random_int(1, 999999), 6, '0', STR_PAD_LEFT),
            'title' => 'Attachment Module Test Procurement',
            'procurement_mode_id' => $mode->id,
            'project_id' => $project->id,
            'status' => 'pending',
            'description' => 'Attachment module testing record',
            'requested_by' => $requester->id,
            'deleted' => false,
        ]);

        return [$procurement, $requester];
    }
}



