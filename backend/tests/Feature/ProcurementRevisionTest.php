<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\ProcurementMode;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProcurementRevisionTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_records_and_returns_revisions_for_procurement_changes(): void
    {
        $user = User::factory()->create();
        $project = Project::firstOrCreate(['name' => 'Revision Project'], ['is_active' => true]);
        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);

        $createResponse = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->postJson('/procurements', [
                'title' => 'Initial Procurement',
                'procurement_mode_id' => $mode->id,
                'project_id' => $project->id,
                'purchase_request' => [
                    'office' => 'Admin Office',
                    'date_created' => now()->toDateString(),
                    'responsibility_center_code' => 'RCC-100',
                    'purpose' => 'Initial purpose',
                    'items' => [
                        [
                            'item_no' => '1',
                            'stock_no' => 'STK-100',
                            'unit' => 'pcs',
                            'item_description' => 'Initial item',
                            'quantity' => 2,
                            'unit_cost' => 1000,
                        ],
                    ],
                ],
            ])
            ->assertCreated();

        $procurementId = (int) $createResponse->json('procurement.id');
        $purchaseRequestId = (int) $createResponse->json('procurement.purchase_request.id');
        $itemId = (int) $createResponse->json('procurement.purchase_request.items.0.id');

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->putJson('/procurements/'.$procurementId, [
                'title' => 'Updated Procurement Title',
            ])
            ->assertOk();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->putJson('/purchase-requests/'.$purchaseRequestId, [
                'purpose' => 'Updated purpose',
            ])
            ->assertOk();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->putJson('/purchase-requests/'.$purchaseRequestId.'/items/'.$itemId, [
                'unit_cost' => 1500,
            ])
            ->assertOk();

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->getJson('/procurements/'.$procurementId.'/revisions')
            ->assertOk()
            ->assertJsonFragment(['action' => 'procurement_created'])
            ->assertJsonFragment(['action' => 'procurement_updated'])
            ->assertJsonFragment(['action' => 'purchase_request_updated'])
            ->assertJsonFragment(['action' => 'item_updated']);

        $this->assertDatabaseHas('procurement_revisions', [
            'procurement_id' => $procurementId,
            'action' => 'procurement_created',
            'entity_type' => 'procurement',
            'entity_id' => $procurementId,
        ]);
    }
}
