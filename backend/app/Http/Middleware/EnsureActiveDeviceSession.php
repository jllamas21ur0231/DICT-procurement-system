<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveDeviceSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $currentSessionId = $request->session()->getId();
        $deviceId = (string) $request->cookie('device_id', '');
        $currentFingerprint = hash('sha256', $deviceId.'|'.((string) $request->userAgent()));

        $isValidSession = $user->active_session_id
            && hash_equals($user->active_session_id, $currentSessionId)
            && $user->active_device_fingerprint
            && hash_equals($user->active_device_fingerprint, $currentFingerprint);

        if ($isValidSession) {
            return $next($request);
        }

        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return new JsonResponse([
            'message' => 'Session invalid on this device. Please login again.',
        ], 401);
    }
}
