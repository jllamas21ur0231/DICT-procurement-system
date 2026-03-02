<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($projects);
    }
}
