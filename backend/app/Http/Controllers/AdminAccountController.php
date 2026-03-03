<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return response()->json([
                'message' => 'Only admins can access account management.',
            ], 403);
        }

        $validated = $request->validate([
            'is_active' => ['nullable', 'boolean'],
            'access_type' => ['nullable', Rule::in(['user', 'admin', 'budget_officer'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $query = User::query()->with('role')->orderByDesc('id');

        if (array_key_exists('is_active', $validated)) {
            $query->where('is_active', filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (array_key_exists('access_type', $validated)) {
            $query->where('access_type', $validated['access_type']);
        }

        return response()->json($query->paginate((int) ($validated['per_page'] ?? 20)));
    }

    public function store(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return response()->json([
                'message' => 'Only admins can create accounts.',
            ], 403);
        }

        $validated = $request->validate([
            'last_name' => ['required', 'string', 'max:255'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'access_type' => ['required', Rule::in(['user', 'admin', 'budget_officer'])],
            'is_authorized' => ['nullable', 'boolean'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
            'role' => ['nullable', 'array'],
            'role.role_type' => ['required_with:role', 'string', 'max:255'],
            'role.designation' => ['nullable', 'string', 'max:255'],
            'role.position' => ['nullable', 'string', 'max:255'],
            'role.role' => ['required_with:role', 'string', 'max:255'],
        ]);

        if (array_key_exists('role_id', $validated) && array_key_exists('role', $validated)) {
            return response()->json([
                'message' => 'Provide either role_id or role payload, not both.',
            ], 422);
        }

        $user = DB::transaction(function () use ($validated): User {
            $roleId = $validated['role_id'] ?? null;

            if (array_key_exists('role', $validated)) {
                $role = Role::create([
                    'role_type' => $validated['role']['role_type'],
                    'designation' => $validated['role']['designation'] ?? null,
                    'position' => $validated['role']['position'] ?? null,
                    'role' => $validated['role']['role'],
                ]);
                $roleId = $role->id;
            }

            return User::create([
                'last_name' => $validated['last_name'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'email' => strtolower(trim($validated['email'])),
                'username' => trim($validated['username']),
                'access_type' => $validated['access_type'],
                'role_id' => $roleId,
                'is_active' => true,
                'is_authorized' => array_key_exists('is_authorized', $validated)
                    ? filter_var($validated['is_authorized'], FILTER_VALIDATE_BOOLEAN)
                    : true,
                'active_session_id' => null,
                'active_device_fingerprint' => null,
            ]);
        });

        return response()->json([
            'message' => 'Account created successfully.',
            'user' => $user->load('role'),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return response()->json([
                'message' => 'Only admins can update accounts.',
            ], 403);
        }

        if ($this->isSuperAdmin($user)) {
            return response()->json([
                'message' => 'Admin cannot update super admin accounts.',
            ], 403);
        }

        $validated = $request->validate([
            'last_name' => ['sometimes', 'string', 'max:255'],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'access_type' => ['sometimes', Rule::in(['user', 'admin', 'budget_officer'])],
            'is_authorized' => ['sometimes', 'boolean'],
            'role_id' => ['nullable', 'integer', 'exists:roles,id'],
            'role' => ['nullable', 'array'],
            'role.role_type' => ['required_with:role', 'string', 'max:255'],
            'role.designation' => ['nullable', 'string', 'max:255'],
            'role.position' => ['nullable', 'string', 'max:255'],
            'role.role' => ['required_with:role', 'string', 'max:255'],
        ]);

        if (array_key_exists('role_id', $validated) && array_key_exists('role', $validated)) {
            return response()->json([
                'message' => 'Provide either role_id or role payload, not both.',
            ], 422);
        }

        if (
            array_key_exists('access_type', $validated)
            && strtolower(trim((string) $user->access_type)) === 'admin'
            && strtolower(trim((string) $validated['access_type'])) !== 'admin'
        ) {
            return response()->json([
                'message' => 'Admin access type cannot be downgraded by an admin.',
            ], 422);
        }

        DB::transaction(function () use ($validated, $user): void {
            $payload = [];

            foreach (['last_name', 'first_name', 'access_type'] as $field) {
                if (array_key_exists($field, $validated)) {
                    $payload[$field] = $validated[$field];
                }
            }

            if (array_key_exists('middle_name', $validated)) {
                $payload['middle_name'] = $validated['middle_name'];
            }

            if (array_key_exists('email', $validated)) {
                $payload['email'] = strtolower(trim($validated['email']));
            }

            if (array_key_exists('username', $validated)) {
                $payload['username'] = trim($validated['username']);
            }

            if (array_key_exists('is_authorized', $validated)) {
                $payload['is_authorized'] = filter_var($validated['is_authorized'], FILTER_VALIDATE_BOOLEAN);
            }

            if (array_key_exists('role_id', $validated)) {
                $payload['role_id'] = $validated['role_id'];
            }

            if (array_key_exists('role', $validated)) {
                $role = Role::create([
                    'role_type' => $validated['role']['role_type'],
                    'designation' => $validated['role']['designation'] ?? null,
                    'position' => $validated['role']['position'] ?? null,
                    'role' => $validated['role']['role'],
                ]);
                $payload['role_id'] = $role->id;
            }

            if ($payload !== []) {
                $user->update($payload);
            }
        });

        return response()->json([
            'message' => 'Account updated successfully.',
            'user' => $user->fresh()->load('role'),
        ]);
    }

    private function isAdmin(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        if (strtolower(trim((string) $user->access_type)) === 'admin') {
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

        return str_contains($haystack, 'admin');
    }

    private function isSuperAdmin(User $user): bool
    {
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
