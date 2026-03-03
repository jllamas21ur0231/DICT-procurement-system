<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Notification;
use App\Models\Procurement;
use App\Models\ProcurementMode;
use App\Models\ProcurementRevision;
use App\Models\Project;
use App\Models\PurchaseRequest;
use App\Models\Role;
use App\Models\Saro;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminReadController extends Controller
{
    public function overview(Request $request): JsonResponse
    {
        if (! $this->isSuperAdmin($request->user())) {
            return response()->json([
                'message' => 'Only super admins can access system data.',
            ], 403);
        }

        return response()->json([
            'users' => [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
            ],
            'roles' => [
                'total' => Role::count(),
            ],
            'procurements' => [
                'total' => Procurement::count(),
                'active' => Procurement::where('deleted', false)->count(),
                'deleted' => Procurement::where('deleted', true)->count(),
            ],
            'purchase_requests' => [
                'total' => PurchaseRequest::count(),
                'active' => PurchaseRequest::where('deleted', false)->count(),
                'deleted' => PurchaseRequest::where('deleted', true)->count(),
            ],
            'items' => [
                'total' => Item::count(),
                'active' => Item::where('deleted', false)->count(),
                'deleted' => Item::where('deleted', true)->count(),
            ],
            'projects' => [
                'total' => Project::count(),
                'active' => Project::where('is_active', true)->count(),
                'inactive' => Project::where('is_active', false)->count(),
            ],
            'procurement_modes' => [
                'total' => ProcurementMode::count(),
                'active' => ProcurementMode::where('is_active', true)->count(),
                'inactive' => ProcurementMode::where('is_active', false)->count(),
            ],
            'saros' => [
                'total' => Saro::count(),
            ],
            'revisions' => [
                'total' => ProcurementRevision::count(),
            ],
            'notifications' => [
                'total' => Notification::count(),
                'unread' => Notification::whereNull('read_at')->count(),
            ],
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        if (! $this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Only super admins can access system data.'], 403);
        }

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
            'access_type' => ['nullable', 'string', 'max:50'],
        ]);

        $query = User::query()->with('role')->orderByDesc('id');

        if (array_key_exists('is_active', $validated)) {
            $query->where('is_active', filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN));
        }
        if (array_key_exists('access_type', $validated) && trim((string) $validated['access_type']) !== '') {
            $query->where('access_type', trim((string) $validated['access_type']));
        }

        return response()->json($query->paginate((int) ($validated['per_page'] ?? 20)));
    }

    public function procurements(Request $request): JsonResponse
    {
        if (! $this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Only super admins can access system data.'], 403);
        }

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'include_deleted' => ['nullable', 'boolean'],
        ]);

        $query = Procurement::query()
            ->with(['requester', 'projectRecord', 'procurementMode', 'purchaseRequest', 'saro'])
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        if (! filter_var($validated['include_deleted'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $query->where('deleted', false);
        }

        return response()->json($query->paginate((int) ($validated['per_page'] ?? 20)));
    }

    public function purchaseRequests(Request $request): JsonResponse
    {
        if (! $this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Only super admins can access system data.'], 403);
        }

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'include_deleted' => ['nullable', 'boolean'],
        ]);

        $query = PurchaseRequest::query()
            ->with(['procurement.requester', 'items'])
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        if (! filter_var($validated['include_deleted'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $query->where('deleted', false);
        }

        return response()->json($query->paginate((int) ($validated['per_page'] ?? 20)));
    }

    public function revisions(Request $request): JsonResponse
    {
        if (! $this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Only super admins can access system data.'], 403);
        }

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'action' => ['nullable', 'string', 'max:100'],
        ]);

        $query = ProcurementRevision::query()
            ->with(['procurement', 'actor'])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if (array_key_exists('action', $validated) && trim((string) $validated['action']) !== '') {
            $query->where('action', trim((string) $validated['action']));
        }

        return response()->json($query->paginate((int) ($validated['per_page'] ?? 20)));
    }

    public function projects(Request $request): JsonResponse
    {
        if (! $this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Only super admins can access system data.'], 403);
        }

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $query = Project::query()->orderBy('name');
        if (array_key_exists('is_active', $validated)) {
            $query->where('is_active', filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->paginate((int) ($validated['per_page'] ?? 20)));
    }

    public function procurementModes(Request $request): JsonResponse
    {
        if (! $this->isSuperAdmin($request->user())) {
            return response()->json(['message' => 'Only super admins can access system data.'], 403);
        }

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $query = ProcurementMode::query()->orderBy('name');
        if (array_key_exists('is_active', $validated)) {
            $query->where('is_active', filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->paginate((int) ($validated['per_page'] ?? 20)));
    }

    private function isSuperAdmin(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        $accessType = strtolower(trim((string) $user->access_type));
        if (in_array($accessType, ['super_admin', 'super admin', 'superadmin'], true)) {
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

        return str_contains($haystack, 'super admin');
    }
}
