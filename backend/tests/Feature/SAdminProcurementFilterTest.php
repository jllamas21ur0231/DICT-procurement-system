<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveSAdminSession;
use App\Models\AppAttachment;
use App\Models\Procurement;
use App\Models\ProcurementMode;
use App\Models\Project;
use App\Models\TechnicalSpecificationAttachment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SAdminProcurementFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_sadmin_can_filter_procurements_with_deleted_attachments(): void
    {
        $requester = User::factory()->create(['access_type' => 'user']);
        $project = Project::firstOrCreate(
            ['name' => 'Deleted Attachments Project'],
            ['description' => 'Filter test project', 'is_active' => true]
        );
        $mode = ProcurementMode::firstOrCreate(
            ['name' => 'Shopping'],
            ['code' => 'SHOP', 'description' => 'Shopping mode', 'legal_basis' => 'RA 12009', 'is_active' => true]
        );

        $withDeletedAttachment = Procurement::create([
            'procurement_no' => 'PR-2026-880001',
            'title' => 'Has Deleted Attachments',
            'procurement_mode_id' => $mode->id,
            'project_id' => $project->id,
            'status' => 'pending',
            'description' => 'Should be returned by deleted filter',
            'requested_by' => $requester->id,
            'deleted' => false,
        ]);

        $withoutDeletedAttachment = Procurement::create([
            'procurement_no' => 'PR-2026-880002',
            'title' => 'Only Active Attachments',
            'procurement_mode_id' => $mode->id,
            'project_id' => $project->id,
            'status' => 'pending',
            'description' => 'Should not be returned by deleted filter',
            'requested_by' => $requester->id,
            'deleted' => false,
        ]);

        AppAttachment::create([
            'procurement_id' => $withDeletedAttachment->id,
            'uploaded_by' => $requester->id,
            'file_name' => 'deleted-app.pdf',
            'file_path' => 'procurements/'.$withDeletedAttachment->id.'/app/deleted-app.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 100,
            'remarks' => 'Deleted APP',
            'deleted' => true,
        ]);

        TechnicalSpecificationAttachment::create([
            'procurement_id' => $withDeletedAttachment->id,
            'uploaded_by' => $requester->id,
            'spec_type' => 'minimum',
            'label' => 'Deleted Tech Spec',
            'file_name' => 'deleted-tech-spec.pdf',
            'file_path' => 'procurements/'.$withDeletedAttachment->id.'/technical-specifications/deleted-tech-spec.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 200,
            'remarks' => 'Deleted technical specification',
            'sort_order' => 1,
            'deleted' => true,
        ]);

        AppAttachment::create([
            'procurement_id' => $withoutDeletedAttachment->id,
            'uploaded_by' => $requester->id,
            'file_name' => 'active-app.pdf',
            'file_path' => 'procurements/'.$withoutDeletedAttachment->id.'/app/active-app.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 100,
            'remarks' => 'Active APP',
            'deleted' => false,
        ]);

        $this->withoutMiddleware(EnsureActiveSAdminSession::class)
            ->getJson('/sadmin/procurements/filter?attachment_status=deleted')
            ->assertOk()
            ->assertJsonPath('filters.attachment_status', 'deleted')
            ->assertJsonPath('filters.module', 'any')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $withDeletedAttachment->id)
            ->assertJsonPath('data.0.attachments.app.deleted', true)
            ->assertJsonPath('data.0.attachments.technical_specifications.0.deleted', true);
    }
}
