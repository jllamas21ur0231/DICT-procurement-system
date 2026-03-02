<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procurement_modes', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 50)->nullable()->unique();
            $table->string('name')->unique();
            $table->string('legal_basis', 100)->default('RA 12009');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();
        $defaults = [
            ['code' => 'PB', 'name' => 'Public Bidding'],
            ['code' => 'LSB', 'name' => 'Limited Source Bidding'],
            ['code' => 'DC', 'name' => 'Direct Contracting'],
            ['code' => 'RO', 'name' => 'Repeat Order'],
            ['code' => 'SHP', 'name' => 'Shopping'],
            ['code' => 'NP', 'name' => 'Negotiated Procurement'],
        ];

        DB::table('procurement_modes')->insert(array_map(
            static fn (array $row): array => [
                ...$row,
                'legal_basis' => 'RA 12009',
                'description' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            $defaults
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_modes');
    }
};
