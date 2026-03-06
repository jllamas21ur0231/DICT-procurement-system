<?php

namespace App\Http\Controllers;

use App\Models\ProcurementMode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProcurementModeController extends Controller
{
    public function index(): JsonResponse
    {
        $modes = ProcurementMode::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return response()->json($modes);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request->user())) {
            return response()->json([
                'message' => 'Only admins can create procurement modes.',
            ], 403);
        }

        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:50', 'unique:procurement_modes,code'],
            'name' => ['required', 'string', 'max:255', 'unique:procurement_modes,name'],
            'legal_basis' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $mode = ProcurementMode::create([
            'code' => array_key_exists('code', $validated) && $validated['code'] !== null && trim($validated['code']) !== ''
                ? strtoupper(trim($validated['code']))
                : null,
            'name' => trim($validated['name']),
            'legal_basis' => $validated['legal_basis'] ?? 'RA 12009',
            'description' => $validated['description'] ?? null,
            'is_active' => array_key_exists('is_active', $validated)
                ? filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN)
                : true,
        ]);

        return response()->json([
            'message' => 'Procurement mode created successfully.',
            'procurement_mode' => $mode,
        ], 201);
    }

    private function isAdmin(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        if (strtolower(trim((string) $user->access_type)) === 'admin') {
            return true;
        }

        $role = $user->role;
        if (!$role) {
            return false;
        }

        $haystack = strtolower(trim(implode(' ', [
            (string) $role->role_type,
            (string) $role->position,
            (string) $role->designation,
            (string) $role->role,
        ])));

        return str_contains($haystack, 'admin');
    }
}
