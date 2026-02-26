<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\Procurement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProcurementSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_filters_procurements_with_keywords(): void
    {
        $user = User::factory()->create();

        Procurement::create([
            'procurement_no' => 'PR-2026-000001',
            'title' => 'Office Chairs Purchase',
            'mode_of_procurement' => 'Shopping',
            'project' => 'Office Upgrade',
            'status' => 'pending',
            'description' => 'Ergonomic chairs for admin office',
            'requested_by' => $user->id,
            'deleted' => false,
        ]);

        Procurement::create([
            'procurement_no' => 'PR-2026-000002',
            'title' => 'Network Switches',
            'mode_of_procurement' => 'Bidding',
            'project' => 'IT Infra',
            'status' => 'approved',
            'description' => 'Core network replacement',
            'requested_by' => $user->id,
            'deleted' => false,
        ]);

        $response = $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->getJson('/procurements/search?q=chaiir');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.procurement_no', 'PR-2026-000001');
    }

    public function test_it_supports_exact_search_for_procurement_number_and_id(): void
    {
        $user = User::factory()->create();

        $target = Procurement::create([
            'procurement_no' => 'PR-2026-009999',
            'title' => 'Generator Repair',
            'mode_of_procurement' => 'Shopping',
            'project' => 'Facility Maintenance',
            'status' => 'ongoing',
            'description' => 'Diesel generator repair works',
            'requested_by' => $user->id,
            'deleted' => false,
        ]);

        Procurement::create([
            'procurement_no' => 'PR-2026-001111',
            'title' => 'Laptop Procurement',
            'mode_of_procurement' => 'Bidding',
            'project' => 'ICT',
            'status' => 'pending',
            'description' => 'Laptops for new staff',
            'requested_by' => $user->id,
            'deleted' => false,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->getJson('/procurements/search?q=PR-2026-009999&exact=true')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $target->id);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($user)
            ->getJson('/procurements/search?q='.$target->id.'&exact=true')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.procurement_no', 'PR-2026-009999');
    }
}
