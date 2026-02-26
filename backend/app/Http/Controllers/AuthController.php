<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'middle_name' => $user->middle_name,
            'email' => $user->email,
            'position' => $user->role?->position,
        ]);
    }

    public function requestOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = strtolower(trim($validated['email']));

        if (! $this->isAllowedEmailDomain($email)) {
            return response()->json([
                'message' => 'Email domain not allowed.',
            ], 422);
        }

        $user = User::where('email', $email)
            ->where('is_active', true)
            ->where('is_authorized', true)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Account is not authorized.'], 403);
        }

        // Invalidate previous active OTPs so user can always request a fresh one.
        DB::table('login_otps')
            ->where('email', $email)
            ->whereNull('consumed_at')
            ->update([
                'consumed_at' => now(),
                'updated_at' => now(),
            ]);

        $otp = random_int(100000, 999999);

        DB::table('login_otps')->insert([
            'email' => $email,
            'otp_hash' => Hash::make((string) $otp),
            'expires_at' => now()->addMinutes(5),
            'attempts' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Mail::raw("Your OTP is: {$otp}", function ($message) use ($email): void {
            $message->to($email)->subject('Your Login OTP');
        });

        return response()->json([
            'message' => 'OTP sent successfully.',
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string'],
        ]);

        $email = strtolower(trim($validated['email']));
        $otpInput = trim($validated['otp']);

        $user = User::where('email', $email)
            ->where('is_active', true)
            ->where('is_authorized', true)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Account is not authorized.'], 403);
        }

        $otpRecord = DB::table('login_otps')
            ->where('email', $email)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otpRecord) {
            return response()->json([
                'message' => 'OTP invalid or expired.',
            ], 422);
        }

        // Increment attempts only on wrong OTP.
        if (! Hash::check($otpInput, $otpRecord->otp_hash)) {
            DB::table('login_otps')
                ->where('id', $otpRecord->id)
                ->increment('attempts');

            return response()->json([
                'message' => 'Invalid OTP.',
            ], 422);
        }

        DB::table('login_otps')
            ->where('id', $otpRecord->id)
            ->update([
                'consumed_at' => now(),
                'updated_at' => now(),
            ]);

        Auth::login($user);
        $request->session()->regenerate();

        $currentSessionId = $request->session()->getId();
        $deviceId = $request->cookie('device_id') ?: (string) Str::uuid();

        if ($user->active_session_id && $user->active_session_id !== $currentSessionId) {
            DB::table(config('session.table', 'sessions'))
                ->where('id', $user->active_session_id)
                ->delete();
        }

        $user->forceFill([
            'active_session_id' => $currentSessionId,
            'active_device_fingerprint' => hash('sha256', $deviceId.'|'.$request->userAgent()),
        ])->save();

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
        ])->cookie('device_id', $deviceId, 60 * 24 * 365 * 5);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        return $this->requestOtp($request);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $user->forceFill([
                'active_session_id' => null,
                'active_device_fingerprint' => null,
            ])->save();
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    private function isAllowedEmailDomain(string $email): bool
    {
        $domains = array_values(array_filter(array_map(
            static fn (string $domain): string => strtolower(trim($domain)),
            explode(',', (string) env('ALLOWED_EMAIL_DOMAINS', 'gov.ph'))
        )));

        if ($domains === []) {
            return false;
        }

        $domain = strtolower(Str::afterLast($email, '@'));

        return in_array($domain, $domains, true);
    }
}
