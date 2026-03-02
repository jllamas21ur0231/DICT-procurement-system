<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ensure FK values are present before removing legacy string columns.
        $defaultProjectId = DB::table('projects')->where('name', 'Uncategorized Project')->value('id');
        if (! $defaultProjectId) {
            $defaultProjectId = DB::table('projects')->insertGetId([
                'name' => 'Uncategorized Project',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $defaultModeId = DB::table('procurement_modes')->where('name', 'Unspecified Mode')->value('id');
        if (! $defaultModeId) {
            $defaultModeId = DB::table('procurement_modes')->insertGetId([
                'code' => null,
                'name' => 'Unspecified Mode',
                'legal_basis' => 'RA 12009',
                'description' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('procurements')->whereNull('project_id')->update(['project_id' => $defaultProjectId]);
        DB::table('procurements')->whereNull('procurement_mode_id')->update(['procurement_mode_id' => $defaultModeId]);

        Schema::table('procurements', function (Blueprint $table): void {
            $table->dropColumn(['mode_of_procurement', 'project']);
        });
    }

    public function down(): void
    {
        Schema::table('procurements', function (Blueprint $table): void {
            $table->string('mode_of_procurement')->nullable()->after('title');
            $table->string('project')->nullable()->after('procurement_mode_id');
        });

        $procurements = DB::table('procurements')
            ->leftJoin('procurement_modes', 'procurements.procurement_mode_id', '=', 'procurement_modes.id')
            ->leftJoin('projects', 'procurements.project_id', '=', 'projects.id')
            ->select('procurements.id', 'procurement_modes.name as mode_name', 'projects.name as project_name')
            ->get();

        foreach ($procurements as $row) {
            DB::table('procurements')
                ->where('id', $row->id)
                ->update([
                    'mode_of_procurement' => $row->mode_name ?? 'Unspecified Mode',
                    'project' => $row->project_name ?? 'Uncategorized Project',
                ]);
        }
    }
};
