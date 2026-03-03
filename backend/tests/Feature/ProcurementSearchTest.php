<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureActiveDeviceSession;
use App\Models\Procurement;
use App\Models\ProcurementMode;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProcurementSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_only_authenticated_users_procurements_via_mine_endpoint(): void
    {
        $owner = User::factory()->create([
            'first_name' => 'Owner',
            'last_name' => 'User',
        ]);
        $other = User::factory()->create([
            'first_name' => 'Other',
            'last_name' => 'User',
        ]);

        $mode = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);
        $project = Project::firstOrCreate(['name' => 'Mine Endpoint Project'], ['is_active' => true]);

        Procurement::create([
            'procurement_no' => 'PR-2026-910001',
            'title' => 'Owner Procurement',
            'procurement_mode_id' => $mode->id,
            'project_id' => $project->id,
            'status' => 'pending',
            'description' => 'Owned by current user',
            'requested_by' => $owner->id,
            'deleted' => false,
        ]);

        Procurement::create([
            'procurement_no' => 'PR-2026-910002',
            'title' => 'Other User Procurement',
            'procurement_mode_id' => $mode->id,
            'project_id' => $project->id,
            'status' => 'pending',
            'description' => 'Owned by another user',
            'requested_by' => $other->id,
            'deleted' => false,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($owner)
            ->getJson('/procurements/mine')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.procurement_no', 'PR-2026-910001');
    }

    public function test_it_filters_procurements_with_keywords(): void
    {
        $user = User::factory()->create();
        $shopping = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);
        $bidding = ProcurementMode::firstOrCreate(['name' => 'Bidding'], ['legal_basis' => 'RA 12009', 'is_active' => true]);
        $officeUpgrade = Project::firstOrCreate(['name' => 'Office Upgrade'], ['is_active' => true]);
        $itInfra = Project::firstOrCreate(['name' => 'IT Infra'], ['is_active' => true]);

        Procurement::create([
            'procurement_no' => 'PR-2026-000001',
            'title' => 'Office Chairs Purchase',
            'procurement_mode_id' => $shopping->id,
            'project_id' => $officeUpgrade->id,
            'status' => 'pending',
            'description' => 'Ergonomic chairs for admin office',
            'requested_by' => $user->id,
            'deleted' => false,
        ]);

        Procurement::create([
            'procurement_no' => 'PR-2026-000002',
            'title' => 'Network Switches',
            'procurement_mode_id' => $bidding->id,
            'project_id' => $itInfra->id,
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

    public function test_it_supports_exact_search_for_procurement_number_and_requester_name(): void
    {
        $user = User::factory()->create([
            'first_name' => 'Juan',
            'middle_name' => 'Santos',
            'last_name' => 'Dela Cruz',
        ]);
        $shopping = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);
        $bidding = ProcurementMode::firstOrCreate(['name' => 'Bidding'], ['legal_basis' => 'RA 12009', 'is_active' => true]);
        $facility = Project::firstOrCreate(['name' => 'Facility Maintenance'], ['is_active' => true]);
        $ict = Project::firstOrCreate(['name' => 'ICT'], ['is_active' => true]);

        $target = Procurement::create([
            'procurement_no' => 'PR-2026-009999',
            'title' => 'Generator Repair',
            'procurement_mode_id' => $shopping->id,
            'project_id' => $facility->id,
            'status' => 'ongoing',
            'description' => 'Diesel generator repair works',
            'requested_by' => $user->id,
            'deleted' => false,
        ]);

        Procurement::create([
            'procurement_no' => 'PR-2026-001111',
            'title' => 'Laptop Procurement',
            'procurement_mode_id' => $bidding->id,
            'project_id' => $ict->id,
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
            ->getJson('/procurements/search?q=Juan Dela&exact=true')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_it_applies_advanced_filters_by_names_and_date_range_via_filter_endpoint(): void
    {
        $requesterA = User::factory()->create([
            'first_name' => 'Alice',
            'last_name' => 'Requester',
        ]);
        $requesterB = User::factory()->create([
            'first_name' => 'Bob',
            'last_name' => 'Requester',
        ]);

        $shopping = ProcurementMode::firstOrCreate(['name' => 'Shopping'], ['legal_basis' => 'RA 12009', 'is_active' => true]);
        $bidding = ProcurementMode::firstOrCreate(['name' => 'Bidding'], ['legal_basis' => 'RA 12009', 'is_active' => true]);
        $projectA = Project::firstOrCreate(['name' => 'Project A'], ['is_active' => true]);
        $projectB = Project::firstOrCreate(['name' => 'Project B'], ['is_active' => true]);
        $today = now()->toDateString();

        $matched = Procurement::create([
            'procurement_no' => 'PR-2026-100001',
            'title' => 'Matched Procurement',
            'procurement_mode_id' => $shopping->id,
            'project_id' => $projectA->id,
            'status' => 'pending',
            'description' => 'Should match filters',
            'requested_by' => $requesterA->id,
            'deleted' => false,
        ]);

        Procurement::create([
            'procurement_no' => 'PR-2026-100002',
            'title' => 'Different Status',
            'procurement_mode_id' => $shopping->id,
            'project_id' => $projectA->id,
            'status' => 'approved',
            'description' => 'Should not match filters',
            'requested_by' => $requesterA->id,
            'deleted' => false,
        ]);

        Procurement::create([
            'procurement_no' => 'PR-2026-100003',
            'title' => 'Different Requester',
            'procurement_mode_id' => $bidding->id,
            'project_id' => $projectB->id,
            'status' => 'pending',
            'description' => 'Should not match filters',
            'requested_by' => $requesterB->id,
            'deleted' => false,
        ]);

        $this->withoutMiddleware(EnsureActiveDeviceSession::class)
            ->actingAs($requesterA)
            ->getJson('/procurements/filter?status=pending&requested_by=Alice+Requester&project=Project+A&procurement_mode=Shopping&date_from='.$today.'&date_to='.$today)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matched->id);
    }
}
