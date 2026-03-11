<?php

namespace App\Http\Controllers;

use App\Services\OtpSenderService;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Handles the regular user authentication/session lifecycle.
 *
 * This controller is responsible for:
 * - exposing the authenticated user's session/profile payload
 * - updating the currently logged-in user's own profile details
 * - driving OTP request/verification for login
 * - enforcing the single active device/session policy
 * - clearing session/device state on logout
 */
class AuthController extends Controller
{
    /**
     * Inject the shared OTP sender so both auth flows use one mail path.
     */
    public function __construct(
        private readonly OtpSenderService $otpSender,
    ) {}

    /**
     * Return the currently authenticated user model as-is.
     *
     * This is primarily useful for lightweight session checks on the frontend.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * Return a frontend-friendly profile payload for the logged-in user.
     *
     * The response intentionally includes derived data such as the public
     * profile picture URL and the related role position for display purposes.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return response()->json([
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'middle_name' => $user->middle_name,
            'email' => $user->email,
            'username' => $user->username,
            'profile_picture' => $user->profile_picture,
            'profile_picture_url' => $user->profile_picture
                ? Storage::disk('public')->url($user->profile_picture)
                : null,
            'position' => $user->role?->position,
        ]);
    }

    /**
     * Update the authenticated user's own editable profile fields.
     *
     * This is the frontend's single self-service endpoint for updating:
     * - first name
     * - last name
     * - middle name
     * - username
     * - profile picture
     *
     * The endpoint supports either uploading a replacement profile picture or
     * removing the current one via the `remove_profile_picture` flag.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'profile_picture' => ['sometimes', 'file', 'image', 'max:5120'],
            'remove_profile_picture' => ['sometimes', 'boolean'],
        ]);

        $payload = [];

        // Trim text fields before persisting so profile data stays normalized.
        foreach (['first_name', 'last_name'] as $field) {
            if (array_key_exists($field, $validated)) {
                $payload[$field] = trim((string) $validated[$field]);
            }
        }

        if (array_key_exists('middle_name', $validated)) {
            $payload['middle_name'] = $validated['middle_name'] !== null
                ? trim((string) $validated['middle_name'])
                : null;
        }

        if (array_key_exists('username', $validated)) {
            $payload['username'] = trim((string) $validated['username']);
        }

        // Removal is handled before upload so the frontend can explicitly clear
        // the image without sending a replacement file.
        if (filter_var($validated['remove_profile_picture'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            $payload['profile_picture'] = null;
        }

        if (array_key_exists('profile_picture', $validated)) {
            if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            $payload['profile_picture'] = $validated['profile_picture']->store('profile-pictures/'.$user->id, 'public');
        }

        // Persist only when at least one field actually changed in the payload.
        if ($payload !== []) {
            $user->forceFill($payload)->save();
        }

        $user->refresh()->load('role');

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'middle_name' => $user->middle_name,
                'email' => $user->email,
                'username' => $user->username,
                'profile_picture' => $user->profile_picture,
                'profile_picture_url' => $user->profile_picture
                    ? Storage::disk('public')->url($user->profile_picture)
                    : null,
                'position' => $user->role?->position,
            ],
        ]);
    }

    /**
     * Generate and send a fresh OTP for a regular user account.
     *
     * The request only succeeds when:
     * - the email belongs to an allowed domain
     * - the user exists
     * - the user is active
     * - the user is authorized
     *
     * Any previous unconsumed OTPs are invalidated before a new one is stored.
     */
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

        $expiresInMinutes = 5;

        // Persist only the hashed OTP so the raw code is never stored in the DB.
        DB::table('login_otps')->insert([
            'email'      => $email,
            'otp_hash'   => Hash::make((string) $otp),
            'expires_at' => now()->addMinutes($expiresInMinutes),
            'attempts'   => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->otpSender->send(
            email: $email,
            name: trim($user->first_name.' '.$user->last_name),
            otp: (string) $otp,
            expiresInMinutes: $expiresInMinutes,
        );

        return response()->json([
            'message' => 'OTP sent successfully.',
        ]);
    }

    /**
     * Verify a submitted OTP and establish the authenticated session.
     *
     * On success this method:
     * - consumes the OTP
     * - refuses login if the user is already active on another device
     * - logs the user in
     * - regenerates the session ID
     * - stores the active session/device fingerprint on the user record
     * - returns a long-lived `device_id` cookie for future validation
     */
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

        // Mark the OTP as consumed before login continues so it cannot be reused.
        DB::table('login_otps')
            ->where('id', $otpRecord->id)
            ->update([
                'consumed_at' => now(),
                'updated_at' => now(),
            ]);

        // ── Single-session enforcement ─────────────────────────────────────────
        // If the user is already logged in on another device, refuse this login.
        if ($user->active_session_id) {
            return response()->json([
                'message' => 'You are already logged in on another device. Please log out there first.',
            ], 409);
        }

        Auth::login($user);
        $request->session()->regenerate();

        // The device fingerprint combines the stable device cookie and current
        // user agent so later requests can be tied back to this login session.
        $currentSessionId = $request->session()->getId();
        $deviceId = $request->cookie('device_id') ?: (string) Str::uuid();

        $user->forceFill([
            'active_session_id'         => $currentSessionId,
            'active_device_fingerprint' => hash('sha256', $deviceId.'|'.$request->userAgent()),
        ])->save();

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $user,
        ])->cookie('device_id', $deviceId, 60 * 24 * 365 * 5);

    }

    /**
     * Request a new OTP by reusing the standard request flow.
     */
    public function resendOtp(Request $request): JsonResponse
    {
        return $this->requestOtp($request);
    }

    /**
     * End the authenticated user's session and clear device/session tracking.
     *
     * This method clears the single-session fields on the user record before
     * invalidating the Laravel session itself.
     */
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

    /**
     * Check whether the submitted email belongs to an allowed login domain.
     *
     * Allowed domains are driven by the `ALLOWED_EMAIL_DOMAINS` environment
     * variable so deployments can control who is permitted to request OTPs.
     */
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
