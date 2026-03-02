<?php

namespace App\Services;

use App\Models\Procurement;
use App\Models\ProcurementRevision;
use Illuminate\Http\Request;

class ProcurementRevisionLogger
{
    public function log(
        Request $request,
        Procurement $procurement,
        string $action,
        string $entityType,
        int $entityId,
        ?array $beforeData = null,
        ?array $afterData = null,
        ?array $changedFields = null,
        ?string $reason = null
    ): ProcurementRevision {
        return ProcurementRevision::create([
            'procurement_id' => $procurement->id,
            'actor_user_id' => $request->user()?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'before_data' => $beforeData,
            'after_data' => $afterData,
            'changed_fields' => $changedFields,
            'reason' => $reason,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }

    public function extractDiff(array $before, array $after): array
    {
        $beforeDiff = [];
        $afterDiff = [];
        $changedFields = [];

        foreach ($after as $field => $newValue) {
            $oldValue = $before[$field] ?? null;
            if ($oldValue !== $newValue) {
                $beforeDiff[$field] = $oldValue;
                $afterDiff[$field] = $newValue;
                $changedFields[] = $field;
            }
        }

        return [$beforeDiff, $afterDiff, $changedFields];
    }
}
