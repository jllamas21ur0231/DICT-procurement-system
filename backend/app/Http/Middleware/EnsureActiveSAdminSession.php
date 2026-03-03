<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ensures the current request is from the sAdmin's authorised device/session.
 * Must be applied AFTER the sAdmin session data is stored in the PHP session
 * (i.e. after a successful verifySAdminOtp call).
 */
class EnsureActiveSAdminSession
{
    public function handle(Request $request, Closure $next): Response
    {
        $sadminId = $request->session()->get('sadmin_id');

        if (! $sadminId) {
            return new JsonResponse(['message' => 'Unauthorized. Please sign in as admin.'], 401);
        }

        $sadmin = \Illuminate\Support\Facades\DB::table('sadmin')
            ->where('id', $sadminId)
            ->where('is_active', true)
            ->where('is_authorized', true)
            ->first();

        if (! $sadmin) {
            // Account was disabled after login — clear the session
            $request->session()->forget(['sadmin_id', 'sadmin_email']);
            return new JsonResponse(['message' => 'Admin account is no longer active.'], 403);
        }

        // Validate that the session stored for this sadmin row matches the current session
        $currentSessionId = $request->session()->getId();

        if (! $sadmin->active_session_id || ! hash_equals($sadmin->active_session_id, $currentSessionId)) {
            $request->session()->forget(['sadmin_id', 'sadmin_email']);
            return new JsonResponse([
                'message' => 'Session invalid. You may have signed in on another device.',
            ], 401);
        }

        return $next($request);
    }
}
