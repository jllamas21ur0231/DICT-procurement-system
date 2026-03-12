<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\AppAttachment;
use App\Models\MsriAttachment;
use App\Models\PpmpAttachment;
use App\Models\ProcurementMode;
use App\Models\Project;
use App\Models\Saro;
use App\Models\SrfiAttachment;
use App\Models\TechnicalSpecificationAttachment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProcurementPurchaseRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_procurement_also_creates_purchase_request_and_items(): void
    {
        $user = User::factory()->create();
        $project = Project::firstOrCreate(['name' => 'Office Upgrade'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $payload = [
            'title' => 'Office Chairs Purchase',
            'procurement_mode_id' => $mode->id,
            'project_id' => $project->id,
            'description' => 'Procurement for ergonomic chairs',
            'purchase_request' => [
                'office' => 'Admin Office',
                'date_created' => '2026-02-26',
                'responsibility_center_code' => 'RCC-001',
                'purpose' => 'Office seating replacement',
                'items' => [
                    [
                        'item_no' => '1',
                        'stock_no' => 'STK-1001',
                        'unit' => 'pcs',
                        'item_description' => 'Ergonomic office chair',
                        'item_inclusions' => 'Lumbar support, wheels',
                        'quantity' => 10,
                        'unit_cost' => 5500.75,
                    ],
                ],
            ],
        ];

        $response = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->postJson('/procurements', $payload);

        $response->assertCreated()
            ->assertJsonPath('procurement.purchase_request.office', 'Admin Office')
            ->assertJsonPath('procurement.purchase_request.responsibility_center_code', 'RCC-001')
            ->assertJsonCount(1, 'procurement.purchase_request.items');

        $this->assertDatabaseHas('purchase_requests', [
            'procurement_id' => $response->json('procurement.id'),
            'office' => 'Admin Office',
            'responsibility_center_code' => 'RCC-001',
        ]);

        $this->assertDatabaseHas('items', [
            'item_no' => '1',
            'stock_no' => 'STK-1001',
            'unit' => 'pcs',
        ]);
    }

    public function test_updating_purchase_request_and_items_uses_purchase_request_endpoints(): void
    {
        $user = User::factory()->create();
        $project = Project::firstOrCreate(['name' => 'Initial Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $createResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->postJson('/procurements', [
                'title' => 'Initial Procurement',
                'procurement_mode_id' => $mode->id,
                'project_id' => $project->id,
                'purchase_request' => [
                    'office' => 'Admin Office',
                    'date_created' => '2026-02-26',
                    'responsibility_center_code' => 'RCC-001',
                    'purpose' => 'Initial purpose',
                    'items' => [
                        [
                            'item_no' => '1',
                            'stock_no' => 'STK-OLD',
                            'unit' => 'pcs',
                            'item_description' => 'Old Item',
                            'item_inclusions' => null,
                            'quantity' => 2,
                            'unit_cost' => 100,
                        ],
                    ],
                ],
            ])
            ->assertCreated();

        $procurementId = (int) $createResponse->json('procurement.id');
        $purchaseRequestId = (int) $createResponse->json('procurement.purchase_request.id');
        $itemId = (int) $createResponse->json('procurement.purchase_request.items.0.id');

        $purchaseRequestUpdateResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->putJson('/purchase-requests/'.$purchaseRequestId, [
                'office' => 'Engineering Office',
                'responsibility_center_code' => 'RCC-009',
                'purpose' => 'Updated purpose',
            ]);

        $purchaseRequestUpdateResponse->assertOk()
            ->assertJsonPath('purchase_request.office', 'Engineering Office')
            ->assertJsonPath('purchase_request.responsibility_center_code', 'RCC-009');

        $itemUpdateResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->putJson('/purchase-requests/'.$purchaseRequestId.'/items/'.$itemId, [
                'stock_no' => 'STK-NEW',
                'unit' => 'box',
                'item_description' => 'New Item',
                'item_inclusions' => 'With accessories',
                'quantity' => 5,
                'unit_cost' => 2500.50,
            ]);

        $itemUpdateResponse->assertOk()
            ->assertJsonPath('item.stock_no', 'STK-NEW')
            ->assertJsonPath('item.unit', 'box');

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->putJson('/procurements/'.$procurementId, [
                'title' => 'Updated Procurement',
            ])->assertOk()
            ->assertJsonPath('procurement.title', 'Updated Procurement');

        $this->assertDatabaseHas('purchase_requests', [
            'procurement_id' => $procurementId,
            'office' => 'Engineering Office',
            'responsibility_center_code' => 'RCC-009',
            'purpose' => 'Updated purpose',
        ]);

        $this->assertDatabaseHas('items', [
            'purchase_request_id' => $purchaseRequestId,
            'item_no' => '1',
            'stock_no' => 'STK-NEW',
            'unit' => 'box',
        ]);
    }

    public function test_purchase_request_and_item_support_boolean_delete_and_restore(): void
    {
        $user = User::factory()->create();
        $project = Project::firstOrCreate(['name' => 'Deletion Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $createResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->postJson('/procurements', [
                'title' => 'Deletion Test Procurement',
                'procurement_mode_id' => $mode->id,
                'project_id' => $project->id,
                'purchase_request' => [
                    'office' => 'Admin Office',
                    'date_created' => '2026-02-26',
                    'responsibility_center_code' => 'RCC-010',
                    'purpose' => 'Deletion test purpose',
                    'items' => [
                        [
                            'item_no' => '1',
                            'stock_no' => 'STK-DEL',
                            'unit' => 'pcs',
                            'item_description' => 'Delete me',
                            'item_inclusions' => null,
                            'quantity' => 1,
                            'unit_cost' => 100,
                        ],
                    ],
                ],
            ])
            ->assertCreated();

        $purchaseRequestId = (int) $createResponse->json('procurement.purchase_request.id');
        $itemId = (int) $createResponse->json('procurement.purchase_request.items.0.id');

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->deleteJson('/purchase-requests/'.$purchaseRequestId)
            ->assertOk();

        $this->assertDatabaseHas('purchase_requests', [
            'id' => $purchaseRequestId,
            'deleted' => true,
        ]);

        $this->assertDatabaseHas('items', [
            'id' => $itemId,
            'deleted' => true,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->patchJson('/purchase-requests/'.$purchaseRequestId.'/restore')
            ->assertOk();

        $this->assertDatabaseHas('purchase_requests', [
            'id' => $purchaseRequestId,
            'deleted' => false,
        ]);

        $this->assertDatabaseHas('items', [
            'id' => $itemId,
            'deleted' => false,
        ]);
    }

    public function test_procurement_destroy_and_restore_cascade_to_purchase_request_and_items(): void
    {
        $user = User::factory()->create();
        $project = Project::firstOrCreate(['name' => 'Procurement Cascade Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Public Bidding'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $createResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->postJson('/procurements', [
                'title' => 'Cascade Delete Procurement',
                'procurement_mode_id' => $mode->id,
                'project_id' => $project->id,
                'purchase_request' => [
                    'office' => 'BAC Office',
                    'date_created' => '2026-03-06',
                    'responsibility_center_code' => 'RCC-CASCADE',
                    'purpose' => 'Cascade soft delete validation',
                    'items' => [
                        [
                            'item_no' => '1',
                            'stock_no' => 'STK-CAS-1',
                            'unit' => 'pcs',
                            'item_description' => 'Cascade Item One',
                            'item_inclusions' => null,
                            'quantity' => 2,
                            'unit_cost' => 1500.00,
                        ],
                        [
                            'item_no' => '2',
                            'stock_no' => 'STK-CAS-2',
                            'unit' => 'set',
                            'item_description' => 'Cascade Item Two',
                            'item_inclusions' => 'Complete set',
                            'quantity' => 1,
                            'unit_cost' => 9999.99,
                        ],
                    ],
                ],
            ])
            ->assertCreated();

        $procurementId = (int) $createResponse->json('procurement.id');
        $purchaseRequestId = (int) $createResponse->json('procurement.purchase_request.id');
        $itemOneId = (int) $createResponse->json('procurement.purchase_request.items.0.id');
        $itemTwoId = (int) $createResponse->json('procurement.purchase_request.items.1.id');

        AppAttachment::create([
            'procurement_id' => $procurementId,
            'uploaded_by' => $user->id,
            'file_name' => 'app.pdf',
            'file_path' => 'procurements/'.$procurementId.'/app/app.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 123,
            'remarks' => 'APP',
            'deleted' => false,
        ]);
        PpmpAttachment::create([
            'procurement_id' => $procurementId,
            'uploaded_by' => $user->id,
            'file_name' => 'ppmp.pdf',
            'file_path' => 'procurements/'.$procurementId.'/ppmp/ppmp.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 124,
            'remarks' => 'PPMP',
            'deleted' => false,
        ]);
        MsriAttachment::create([
            'procurement_id' => $procurementId,
            'uploaded_by' => $user->id,
            'file_name' => 'msri.pdf',
            'file_path' => 'procurements/'.$procurementId.'/msri/msri.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 125,
            'remarks' => 'MSRI',
            'deleted' => false,
        ]);
        SrfiAttachment::create([
            'procurement_id' => $procurementId,
            'uploaded_by' => $user->id,
            'file_name' => 'srfi.pdf',
            'file_path' => 'procurements/'.$procurementId.'/srfi/srfi.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 126,
            'remarks' => 'SRFI',
            'deleted' => false,
        ]);
        Saro::create([
            'procurement_id' => $procurementId,
            'uploaded_by' => $user->id,
            'file_name' => 'saro.pdf',
            'file_path' => 'procurements/'.$procurementId.'/saro/saro.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 127,
            'remarks' => 'SARO',
            'deleted' => false,
        ]);
        $technicalSpecification = TechnicalSpecificationAttachment::create([
            'procurement_id' => $procurementId,
            'uploaded_by' => $user->id,
            'spec_type' => 'minimum',
            'label' => 'TS-1',
            'file_name' => 'ts.pdf',
            'file_path' => 'procurements/'.$procurementId.'/technical-specifications/ts.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 128,
            'remarks' => 'Technical Specification',
            'sort_order' => 1,
            'deleted' => false,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->deleteJson('/procurements/'.$procurementId)
            ->assertOk()
            ->assertJsonPath('message', 'Procurement marked as deleted.');

        $this->assertDatabaseHas('procurements', [
            'id' => $procurementId,
            'deleted' => true,
        ]);
        $this->assertDatabaseHas('purchase_requests', [
            'id' => $purchaseRequestId,
            'deleted' => true,
        ]);
        $this->assertDatabaseHas('items', [
            'id' => $itemOneId,
            'deleted' => true,
        ]);
        $this->assertDatabaseHas('items', [
            'id' => $itemTwoId,
            'deleted' => true,
        ]);
        $this->assertDatabaseHas('apps', ['procurement_id' => $procurementId, 'deleted' => true]);
        $this->assertDatabaseHas('ppmps', ['procurement_id' => $procurementId, 'deleted' => true]);
        $this->assertDatabaseHas('msris', ['procurement_id' => $procurementId, 'deleted' => true]);
        $this->assertDatabaseHas('srfis', ['procurement_id' => $procurementId, 'deleted' => true]);
        $this->assertDatabaseHas('saros', ['procurement_id' => $procurementId, 'deleted' => true]);
        $this->assertDatabaseHas('technical_specifications', ['id' => $technicalSpecification->id, 'deleted' => true]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->patchJson('/procurements/'.$procurementId.'/restore')
            ->assertOk()
            ->assertJsonPath('message', 'Procurement restored successfully.')
            ->assertJsonPath('procurement.purchase_request.id', $purchaseRequestId)
            ->assertJsonCount(2, 'procurement.purchase_request.items');

        $this->assertDatabaseHas('procurements', [
            'id' => $procurementId,
            'deleted' => false,
        ]);
        $this->assertDatabaseHas('purchase_requests', [
            'id' => $purchaseRequestId,
            'deleted' => false,
        ]);
        $this->assertDatabaseHas('items', [
            'id' => $itemOneId,
            'deleted' => false,
        ]);
        $this->assertDatabaseHas('items', [
            'id' => $itemTwoId,
            'deleted' => false,
        ]);
        $this->assertDatabaseHas('apps', ['procurement_id' => $procurementId, 'deleted' => false]);
        $this->assertDatabaseHas('ppmps', ['procurement_id' => $procurementId, 'deleted' => false]);
        $this->assertDatabaseHas('msris', ['procurement_id' => $procurementId, 'deleted' => false]);
        $this->assertDatabaseHas('srfis', ['procurement_id' => $procurementId, 'deleted' => false]);
        $this->assertDatabaseHas('saros', ['procurement_id' => $procurementId, 'deleted' => false]);
        $this->assertDatabaseHas('technical_specifications', ['id' => $technicalSpecification->id, 'deleted' => false]);
    }

    public function test_it_duplicates_procurement_and_related_records_with_new_procurement_number(): void
    {
        Storage::fake('public');

        $requester = User::factory()->create(['access_type' => 'user']);
        $project = Project::firstOrCreate(['name' => 'Duplication Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $createResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($requester)
            ->postJson('/procurements', [
                'title' => 'Original Procurement',
                'procurement_mode_id' => $mode->id,
                'project_id' => $project->id,
                'description' => 'Original description',
                'purchase_request' => [
                    'office' => 'Admin Office',
                    'date_created' => '2026-03-03',
                    'responsibility_center_code' => 'RCC-111',
                    'purpose' => 'Original purpose',
                    'items' => [
                        [
                            'item_no' => '1',
                            'stock_no' => 'STK-DUP-1',
                            'unit' => 'pcs',
                            'item_description' => 'Duplicated item',
                            'item_inclusions' => 'With accessories',
                            'quantity' => 3,
                            'unit_cost' => 1200.50,
                        ],
                    ],
                ],
            ])->assertCreated();

        $originalId = (int) $createResponse->json('procurement.id');
        $originalNo = (string) $createResponse->json('procurement.procurement_no');

        Storage::disk('public')->put('procurements/'.$originalId.'/original-attachment.pdf', 'pdf-content');
        Storage::disk('public')->put('procurements/'.$originalId.'/saro/original-saro.pdf', 'saro-content');
        Storage::disk('public')->put('procurements/'.$originalId.'/technical-specifications/original-spec.pdf', 'spec-content');

        $this->assertDatabaseHas('procurements', ['id' => $originalId, 'procurement_no' => $originalNo]);

        \App\Models\ProcurementPdf::create([
            'procurement_id' => $originalId,
            'file_name' => 'Original Attachment.pdf',
            'file_path' => 'procurements/'.$originalId.'/original-attachment.pdf',
            'checklist' => ['annual_procurement_plan' => true],
        ]);

        Saro::create([
            'procurement_id' => $originalId,
            'uploaded_by' => $requester->id,
            'file_name' => 'Original SARO.pdf',
            'file_path' => 'procurements/'.$originalId.'/saro/original-saro.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 12,
            'remarks' => 'Original SARO',
        ]);

        TechnicalSpecificationAttachment::create([
            'procurement_id' => $originalId,
            'uploaded_by' => $requester->id,
            'spec_type' => 'technical_specification',
            'label' => 'Original Technical Specification',
            'file_name' => 'Original Technical Specification.pdf',
            'file_path' => 'procurements/'.$originalId.'/technical-specifications/original-spec.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 12,
            'remarks' => 'Original spec',
            'sort_order' => 1,
            'deleted' => false,
        ]);

        $duplicateResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($requester)
            ->postJson('/procurements/'.$originalId.'/duplicate')
            ->assertCreated()
            ->assertJsonPath('message', 'Procurement duplicated successfully.');

        $duplicateId = (int) $duplicateResponse->json('procurement.id');
        $duplicateNo = (string) $duplicateResponse->json('procurement.procurement_no');

        $this->assertNotSame($originalId, $duplicateId);
        $this->assertNotSame($originalNo, $duplicateNo);

        $this->assertDatabaseHas('purchase_requests', [
            'procurement_id' => $duplicateId,
            'office' => 'Admin Office',
            'responsibility_center_code' => 'RCC-111',
            'purpose' => 'Original purpose',
            'deleted' => false,
        ]);

        $this->assertDatabaseCount('items', 2);
        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $duplicateId,
            'action' => 'procurement_duplicated',
            'entity_type' => 'procurement',
            'entity_id' => $duplicateId,
        ]);

        $clonedPdf = \App\Models\ProcurementPdf::where('procurement_id', $duplicateId)->first();
        $this->assertNotNull($clonedPdf);
        $this->assertNotSame('procurements/'.$originalId.'/original-attachment.pdf', $clonedPdf->file_path);
        Storage::disk('public')->assertExists($clonedPdf->file_path);

        $clonedSaro = Saro::where('procurement_id', $duplicateId)->first();
        $this->assertNotNull($clonedSaro);
        $this->assertNotSame('procurements/'.$originalId.'/saro/original-saro.pdf', $clonedSaro->file_path);
        Storage::disk('public')->assertExists($clonedSaro->file_path);

        $clonedTechnicalSpecifications = TechnicalSpecificationAttachment::where('procurement_id', $duplicateId)->get();
        $this->assertCount(1, $clonedTechnicalSpecifications);
        $this->assertNotSame(
            'procurements/'.$originalId.'/technical-specifications/original-spec.pdf',
            $clonedTechnicalSpecifications->first()->file_path
        );
        Storage::disk('public')->assertExists($clonedTechnicalSpecifications->first()->file_path);
    }

    public function test_super_admin_can_view_purchase_request_of_other_user(): void
    {
        $requester = User::factory()->create(['access_type' => 'user']);
        $superAdmin = User::factory()->create(['access_type' => 'super_admin']);
        $project = Project::firstOrCreate(['name' => 'Super Admin PR Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $createResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($requester)
            ->postJson('/procurements', [
                'title' => 'Super Admin PR Visibility',
                'procurement_mode_id' => $mode->id,
                'project_id' => $project->id,
                'purchase_request' => [
                    'office' => 'Admin Office',
                    'date_created' => '2026-03-03',
                    'responsibility_center_code' => 'RCC-SA-PR',
                    'purpose' => 'Visibility check',
                    'items' => [],
                ],
            ])->assertCreated();

        $purchaseRequestId = (int) $createResponse->json('procurement.purchase_request.id');

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($superAdmin)
            ->getJson('/purchase-requests/'.$purchaseRequestId)
            ->assertOk()
            ->assertJsonPath('id', $purchaseRequestId);
    }
}
