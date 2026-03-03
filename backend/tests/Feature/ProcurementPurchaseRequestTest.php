<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\ProcurementMode;
use App\Models\Project;
use App\Models\Saro;
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
    }
}
