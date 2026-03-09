<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Make procurements.requested_by nullable so sAdmin-created
 * procurements (which don't belong to a regular user) are allowed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('procurements', function (Blueprint $table): void {
            // Drop the old NOT NULL foreign key constraint first, then re-add it as nullable.
            $table->dropForeign(['requested_by']);
            $table->unsignedBigInteger('requested_by')->nullable()->change();
            $table->foreign('requested_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('procurements', function (Blueprint $table): void {
            $table->dropForeign(['requested_by']);
            $table->unsignedBigInteger('requested_by')->nullable(false)->change();
            $table->foreign('requested_by')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
