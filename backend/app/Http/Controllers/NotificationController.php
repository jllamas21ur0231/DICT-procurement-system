<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unread_only' => ['nullable', 'boolean'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $user = $request->user();
        $perPage = $validated['per_page'] ?? 15;
        $unreadOnly = filter_var($validated['unread_only'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = $user->notifications()->latest('created_at');

        if ($unreadOnly) {
            $query->whereNull('read_at');
        }

        return response()->json($query->paginate($perPage));
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->notifications()->whereNull('read_at')->count();

        return response()->json([
            'unread_count' => $count,
        ]);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        if ((int) $notification->user_id !== (int) $request->user()->id) {
            return response()->json([
                'message' => 'Notification not found.',
            ], 404);
        }

        if ($notification->read_at === null) {
            $notification->update([
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Notification marked as read.',
            'notification' => $notification->fresh(),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $updated = $request->user()
            ->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All unread notifications marked as read.',
            'updated' => $updated,
        ]);
    }
}
