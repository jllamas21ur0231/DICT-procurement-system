<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($projects);
    }

    public function store(Request $request): JsonResponse
    {
        if (! $this->isAdmin($request->user())) {
            return response()->json([
                'message' => 'Only admins can create projects.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:projects,name'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $project = Project::create([
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => array_key_exists('is_active', $validated)
                ? filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN)
                : true,
        ]);

        return response()->json([
            'message' => 'Project created successfully.',
            'project' => $project,
        ], 201);
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
}
