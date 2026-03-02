<?php

namespace App\Http\Controllers;

use App\Models\ProcurementMode;
use Illuminate\Http\JsonResponse;

class ProcurementModeController extends Controller
{
    public function index(): JsonResponse
    {
        $modes = ProcurementMode::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return response()->json($modes);
    }
}
