<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\Procurement;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProcurementDemoSeeder extends Seeder
{
    public function run(): void
    {
        $offices = ['Admin Office', 'Budget Office', 'Engineering Office', 'General Services', 'ICT Office'];
        $units = ['pcs', 'box', 'set'];
        $modes = ['Shopping', 'Bidding', 'Direct Contracting'];
        $projects = ['Office Upgrade', 'IT Infrastructure', 'Facilities Maintenance'];
        $statuses = ['pending', 'ongoing', 'approved'];

        $user = User::query()->where('is_active', true)->first();
        if (! $user) {
            $user = User::create([
                'first_name' => 'System',
                'last_name' => 'Seeder',
                'middle_name' => null,
                'email' => 'system.seeder@example.com',
                'username' => 'system.seeder',
                'access_type' => 'admin',
                'is_active' => true,
                'is_authorized' => true,
            ]);
        }

        $existingProcurements = Procurement::query()->count();
        $target = 20;

        foreach (Procurement::query()->doesntHave('purchaseRequest')->get() as $procurement) {
            $this->createPurchaseRequestWithItems($procurement, $offices, $units, random_int(1, 3));
        }

        for ($i = $existingProcurements + 1; $i <= $target; $i++) {
            $procurement = Procurement::create([
                'procurement_no' => 'TMP-'.Str::uuid(),
                'title' => 'Office Supply Batch #'.$i,
                'mode_of_procurement' => $modes[array_rand($modes)],
                'project' => $projects[array_rand($projects)],
                'status' => $statuses[array_rand($statuses)],
                'description' => 'Generated sample procurement record #'.$i,
                'requested_by' => $user->id,
                'deleted' => false,
            ]);

            $procurement->procurement_no = sprintf('PR-%s-%06d', now()->format('Y'), $procurement->id);
            $procurement->save();

            $this->createPurchaseRequestWithItems($procurement, $offices, $units, random_int(1, 4));
        }
    }

    private function createPurchaseRequestWithItems(Procurement $procurement, array $offices, array $units, int $itemsCount): void
    {
        $purchaseRequest = $procurement->purchaseRequest()->create([
            'purchase_request_number' => 'TMP-'.Str::uuid(),
            'office' => $offices[array_rand($offices)],
            'date_created' => now()->subDays(random_int(0, 30))->toDateString(),
            'responsibility_center_code' => 'RCC-'.str_pad((string) random_int(1, 999), 3, '0', STR_PAD_LEFT),
            'purpose' => 'Generated purchase request for '.$procurement->project,
        ]);

        $purchaseRequest->purchase_request_number = sprintf('PUR-%s-%06d', now()->format('Y'), $purchaseRequest->id);
        $purchaseRequest->save();

        for ($i = 1; $i <= $itemsCount; $i++) {
            Item::create([
                'purchase_request_id' => $purchaseRequest->id,
                'item_no' => (string) $i,
                'stock_no' => 'STK-'.str_pad((string) random_int(1000, 9999), 4, '0', STR_PAD_LEFT),
                'unit' => $units[array_rand($units)],
                'item_description' => 'Generated item '.$i.' for '.$procurement->procurement_no,
                'item_inclusions' => 'Standard package',
                'quantity' => random_int(1, 50),
                'unit_cost' => random_int(500, 50000),
            ]);
        }
    }
}
