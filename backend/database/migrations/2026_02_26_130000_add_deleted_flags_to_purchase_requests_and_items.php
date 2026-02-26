<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table): void {
            $table->boolean('deleted')->default(false)->after('purpose');
        });

        Schema::table('items', function (Blueprint $table): void {
            $table->boolean('deleted')->default(false)->after('unit_cost');
        });
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table): void {
            $table->dropColumn('deleted');
        });

        Schema::table('purchase_requests', function (Blueprint $table): void {
            $table->dropColumn('deleted');
        });
    }
};
