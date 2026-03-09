<?php

namespace App\Http\Controllers;

use App\Models\Procurement;
use App\Models\ProcurementMode;
use App\Models\ProcurementPdf;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SAdminController extends Controller
{
    /**
     * Return the currently authenticated sAdmin (used for session check).
     */
    public function me(Request $request): JsonResponse
    {
        $sadminId = $request->session()->get('sadmin_id');
        $sadmin   = DB::table('sadmin')->where('id', $sadminId)->first();

        return response()->json([
            'id'         => $sadmin->id,
            'first_name' => $sadmin->first_name,
            'last_name'  => $sadmin->last_name,
            'email'      => $sadmin->email,
            'username'   => $sadmin->username,
        ]);
    }

    // ── OTP Authentication ────────────────────────────────────────────────────

    /**
     * Request an OTP for a sadmin email.
     */
    public function requestSAdminOtp(Request $request): JsonResponse
    {

        $validated = $request->validate(['email' => ['required', 'email']]);
        $email = strtolower(trim($validated['email']));

        $sadmin = DB::table('sadmin')
            ->where('email', $email)
            ->where('is_active', true)
            ->where('is_authorized', true)
            ->first();

        if (! $sadmin) {
            return response()->json(['message' => 'Account not found or not authorized.'], 403);
        }

        // Invalidate all previous unconsumed OTPs for this email
        DB::table('login_otps')
            ->where('email', $email)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now(), 'updated_at' => now()]);

        $otp = random_int(100000, 999999);

        DB::table('login_otps')->insert([
            'email'      => $email,
            'otp_hash'   => Hash::make((string) $otp),
            'expires_at' => now()->addMinutes(5),
            'attempts'   => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Mail::raw("Your Admin OTP is: {$otp}", function ($message) use ($email): void {
            $message->to($email)->subject('Admin Login OTP');
        });

        return response()->json(['message' => 'OTP sent successfully.']);
    }

    /**
     * Verify the OTP for a sadmin email.
     */
    public function verifySAdminOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'otp'   => ['required', 'string'],
        ]);

        $email    = strtolower(trim($validated['email']));
        $otpInput = trim($validated['otp']);

        $sadmin = DB::table('sadmin')
            ->where('email', $email)
            ->where('is_active', true)
            ->where('is_authorized', true)
            ->first();

        if (! $sadmin) {
            return response()->json(['message' => 'Account not found or not authorized.'], 403);
        }

        $otpRecord = DB::table('login_otps')
            ->where('email', $email)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (! $otpRecord) {
            return response()->json(['message' => 'OTP invalid or expired.'], 422);
        }

        if (! Hash::check($otpInput, $otpRecord->otp_hash)) {
            DB::table('login_otps')->where('id', $otpRecord->id)->increment('attempts');
            return response()->json(['message' => 'Invalid OTP.'], 422);
        }

        // Mark OTP consumed
        DB::table('login_otps')->where('id', $otpRecord->id)->update([
            'consumed_at' => now(),
            'updated_at'  => now(),
        ]);

        // ── Single-session enforcement ─────────────────────────────────────────
        if ($sadmin->active_session_id) {
            return response()->json([
                'message' => 'You are already logged in on another device. Please log out there first.',
            ], 409);
        }

        // Regenerate session so we get a fresh ID
        $request->session()->regenerate();
        $currentSessionId = $request->session()->getId();

        // Persist session ID to the sadmin row (used by EnsureActiveSAdminSession middleware)
        DB::table('sadmin')->where('id', $sadmin->id)->update([
            'active_session_id' => $currentSessionId,
            'updated_at'        => now(),
        ]);

        // Store sadmin identity in session
        $request->session()->put('sadmin_id',    $sadmin->id);
        $request->session()->put('sadmin_email', $sadmin->email);

        return response()->json([
            'message' => 'Login successful.',
            'sadmin'  => [
                'id'         => $sadmin->id,
                'first_name' => $sadmin->first_name,
                'last_name'  => $sadmin->last_name,
                'email'      => $sadmin->email,
                'username'   => $sadmin->username,
            ],
        ]);
    }


    /**
     * Resend the OTP (re-use requestSAdminOtp).
     */
    public function resendSAdminOtp(Request $request): JsonResponse
    {
        return $this->requestSAdminOtp($request);
    }

    /**
     * Logout the sAdmin — clears the active session from the sadmin row.
     */
    public function logoutSAdmin(Request $request): JsonResponse
    {
        $sadminId = $request->session()->get('sadmin_id');

        if ($sadminId) {
            DB::table('sadmin')->where('id', $sadminId)->update([
                'active_session_id' => null,
                'updated_at'        => now(),
            ]);
        }

        $request->session()->forget(['sadmin_id', 'sadmin_email']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }


    // ── Data endpoints ────────────────────────────────────────────────────────


    public function users(): JsonResponse
    {
        $users = User::select([
            'id',
            'first_name',
            'last_name',
            'middle_name',
            'email',
            'username',
            'access_type',
            'is_active',
            'is_authorized',
            'created_at',
            'updated_at',
        ])
        ->orderBy('id')
        ->get();

        return response()->json($users);
    }

    /**
     * Return all purchase requests — no user-scope filtering (sAdmin view).
     */
    public function purchaseRequests(): JsonResponse
    {
        $prs = \App\Models\PurchaseRequest::query()
            ->where('deleted', false)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get([
                'id',
                'purchase_request_number',
                'office',
                'responsibility_center_code',
                'purpose',
                'date_created',
                'created_at',
                'updated_at',
            ]);

        return response()->json($prs);
    }


    /**
     * Delete (deactivate) a user by ID.
     */
    public function deleteUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->forceFill(['is_active' => false])->save();

        return response()->json(['message' => 'User deactivated successfully.']);
    }

    /**
     * Return all procurements with mode and project names — no user-scope filtering.
     */
    public function procurements(Request $request): JsonResponse
    {
        $procurements = Procurement::with([
                'procurementMode:id,name,code',
                'projectRecord:id,name',
                'requester:id,first_name,last_name,email',
            ])
            ->where('deleted', false)
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get()
            ->map(function (Procurement $p) {
                return [
                    'id'                   => $p->id,
                    'procurement_no'       => $p->procurement_no,
                    'title'                => $p->title,
                    'status'               => $p->status,
                    'description'          => $p->description,
                    'mode_of_procurement'  => $p->procurementMode?->name,
                    'project'              => $p->projectRecord?->name,
                    'requested_by_name'    => trim(($p->requester?->first_name ?? '') . ' ' . ($p->requester?->last_name ?? '')),
                    'created_at'           => $p->created_at,
                    'updated_at'           => $p->updated_at,
                ];
            });

        return response()->json($procurements);
    }

    /**
     * Create a new procurement from the sAdmin add-form.
     * sAdmin has no regular user session, so `requested_by` is left null.
     */
    public function storeProcurement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'               => ['required', 'string', 'max:255'],
            'procurement_mode_id' => ['required', 'integer', 'exists:procurement_modes,id'],
            'project_id'          => ['required', 'integer', 'exists:projects,id'],
            'description'         => ['nullable', 'string'],
        ]);

        $procurement = DB::transaction(function () use ($validated): Procurement {
            $proc = Procurement::create([
                'procurement_no'      => 'TMP-'.Str::uuid(),
                'title'               => $validated['title'],
                'procurement_mode_id' => $validated['procurement_mode_id'],
                'project_id'          => $validated['project_id'],
                'status'              => 'pending',
                'description'         => $validated['description'] ?? null,
                'requested_by'        => null,
                'deleted'             => false,
            ]);

            $proc->procurement_no = sprintf('PR-%s-%06d', now()->format('Y'), $proc->id);
            $proc->save();

            // Create a minimal placeholder purchase request so relations work.
            $pr = $proc->purchaseRequest()->create([
                'purchase_request_number'   => 'TMP-'.Str::uuid(),
                'office'                    => 'DICT Regional Office I',
                'date_created'              => now()->toDateString(),
                'responsibility_center_code'=> 'N/A',
                'purpose'                   => $validated['title'],
                'deleted'                   => false,
            ]);
            $pr->purchase_request_number = sprintf('PUR-%s-%06d', now()->format('Y'), $pr->id);
            $pr->save();

            return $proc;
        });

        return response()->json([
            'message'     => 'Procurement created successfully.',
            'procurement' => $procurement->fresh()->load(['procurementMode', 'projectRecord', 'pdfs', 'purchaseRequest']),
        ], 201);
    }

    /**
     * Upload a file attachment for a procurement (sAdmin version).
     */
    public function uploadProcurementAttachment(Request $request, Procurement $procurement): JsonResponse
    {
        $validated = $request->validate([
            'file'      => ['required', 'file', 'mimes:pdf,doc,docx,xls,xlsx', 'max:20480'],
            'checklist' => ['required'],
            'file_name' => ['nullable', 'string', 'max:255'],
        ]);

        $checklist = $validated['checklist'];
        if (is_string($checklist)) {
            $checklist = json_decode($checklist, true) ?? ['type' => 'other'];
        }

        $uploadedFile = $validated['file'];
        $storedPath   = $uploadedFile->store('procurements/'.$procurement->id, 'public');

        $attachment = $procurement->pdfs()->create([
            'file_name' => $validated['file_name'] ?? $uploadedFile->getClientOriginalName(),
            'file_path' => $storedPath,
            'checklist' => $checklist,
        ]);

        return response()->json([
            'message'    => 'Attachment uploaded successfully.',
            'attachment' => $attachment,
        ], 201);
    }

    /**
     * Create a new project (shared with end users).
     */
    public function storeProject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $project = Project::create([
            'name'        => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active'   => true,
        ]);

        return response()->json($project, 201);
    }

    /**
     * Create a new procurement mode (shared with end users).
     */
    public function storeProcurementMode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'code'        => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $mode = ProcurementMode::create([
            'name'        => $validated['name'],
            'code'        => $validated['code'] ?? null,
            'description' => $validated['description'] ?? null,
            'legal_basis' => 'RA 12009',
            'is_active'   => true,
        ]);

        return response()->json($mode, 201);
    }
}

