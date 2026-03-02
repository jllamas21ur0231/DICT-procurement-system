<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('procurements', function (Blueprint $table): void {
            $table->foreignId('project_id')->nullable()->after('project')->constrained('projects')->nullOnDelete();
            $table->foreignId('procurement_mode_id')->nullable()->after('mode_of_procurement')->constrained('procurement_modes')->nullOnDelete();
            $table->index(['project_id', 'procurement_mode_id']);
        });

        $now = now();

        $projectNames = DB::table('procurements')
            ->whereNotNull('project')
            ->where('project', '!=', '')
            ->distinct()
            ->pluck('project');

        foreach ($projectNames as $projectName) {
            DB::table('projects')->updateOrInsert(
                ['name' => $projectName],
                ['updated_at' => $now, 'created_at' => $now, 'is_active' => true]
            );
        }

        $modeNames = DB::table('procurements')
            ->whereNotNull('mode_of_procurement')
            ->where('mode_of_procurement', '!=', '')
            ->distinct()
            ->pluck('mode_of_procurement');

        foreach ($modeNames as $modeName) {
            DB::table('procurement_modes')->updateOrInsert(
                ['name' => $modeName],
                [
                    'legal_basis' => 'RA 12009',
                    'updated_at' => $now,
                    'created_at' => $now,
                    'is_active' => true,
                ]
            );
        }

        $projectIdByName = DB::table('projects')
            ->pluck('id', 'name');

        foreach ($projectIdByName as $name => $projectId) {
            DB::table('procurements')
                ->where('project', $name)
                ->whereNull('project_id')
                ->update(['project_id' => $projectId]);
        }

        $modeIdByName = DB::table('procurement_modes')
            ->pluck('id', 'name');

        foreach ($modeIdByName as $name => $modeId) {
            DB::table('procurements')
                ->where('mode_of_procurement', $name)
                ->whereNull('procurement_mode_id')
                ->update(['procurement_mode_id' => $modeId]);
        }
    }

    public function down(): void
    {
        Schema::table('procurements', function (Blueprint $table): void {
            $table->dropIndex(['project_id', 'procurement_mode_id']);
            $table->dropConstrainedForeignId('project_id');
            $table->dropConstrainedForeignId('procurement_mode_id');
        });
    }
};
