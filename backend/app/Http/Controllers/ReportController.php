<?php

namespace App\Http\Controllers;

use App\Models\Procurement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($this->isBudgetOfficer($user)) {
            return response()->json([
                'scope' => 'budget_officer',
                'overview' => $this->budgetOfficerOverview(),
            ]);
        }

        return response()->json([
            'scope' => 'requester',
            'overview' => $this->requesterOverview($user),
        ]);
    }

    private function requesterOverview(User $user): array
    {
        $base = Procurement::query()
            ->where('deleted', false)
            ->where('requested_by', $user->id);

        return [
            'total' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', 'pending')->count(),
            'accepted' => (clone $base)->where('status', 'accepted')->count(),
            'rejected' => (clone $base)->where('status', 'rejected')->count(),
        ];
    }

    private function budgetOfficerOverview(): array
    {
        $base = Procurement::query()->where('deleted', false);

        return [
            'ongoing' => (clone $base)->count(),
            'pending' => (clone $base)->where('status', 'pending')->count(),
            'accepted' => (clone $base)->where('status', 'accepted')->count(),
            'rejected' => (clone $base)->where('status', 'rejected')->count(),
        ];
    }

    private function isBudgetOfficer(User $user): bool
    {
        $accessType = strtolower(trim((string) $user->access_type));
        if (in_array($accessType, ['budget_officer', 'budget officer', 'budget'], true)) {
            return true;
        }

        $role = $user->role;
        if (! $role) {
            return false;
        }

        $haystack = strtolower(trim(implode(' ', [
            (string) $role->role_type,
            (string) $role->position,
            (string) $role->designation,
            (string) $role->role,
        ])));

        return str_contains($haystack, 'budget officer');
    }
}
