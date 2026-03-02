<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('procurements', function (Blueprint $table): void {
            $table->index('status', 'procurements_status_idx');
            $table->index('deleted', 'procurements_deleted_idx');
            $table->index('created_at', 'procurements_created_at_idx');
            $table->index('requested_by', 'procurements_requested_by_idx');
            $table->index(['deleted', 'updated_at', 'id'], 'procurements_deleted_updated_id_idx');
        });
    }

    public function down(): void
    {
        Schema::table('procurements', function (Blueprint $table): void {
            $table->dropIndex('procurements_status_idx');
            $table->dropIndex('procurements_deleted_idx');
            $table->dropIndex('procurements_created_at_idx');
            $table->dropIndex('procurements_requested_by_idx');
            $table->dropIndex('procurements_deleted_updated_id_idx');
        });
    }
};
