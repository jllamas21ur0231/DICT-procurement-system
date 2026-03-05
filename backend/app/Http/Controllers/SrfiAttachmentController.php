<?php

namespace App\Http\Controllers;

use App\Models\Procurement;
use App\Models\SrfiAttachment;
use App\Models\User;
use App\Services\ProcurementRevisionLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SrfiAttachmentController extends Controller
{
    public function __construct(private readonly ProcurementRevisionLogger $revisionLogger) {}

    public function upload(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canManage($request->user())) {
            return response()->json([
                'message' => 'You are not allowed to upload SRFI files.',
            ], 403);
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $uploadedFile = $validated['file'];
        $safeFileName = $this->sanitizeFileName($uploadedFile->getClientOriginalName(), $uploadedFile->extension() ?: 'pdf', 'srfi');

        $result = DB::transaction(function () use ($request, $procurement, $uploadedFile, $safeFileName, $validated): array {
            $existing = $procurement->srfiAttachment;
            $beforeData = $existing?->only([
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'uploaded_by',
            ]);

            if ($existing && Storage::disk('public')->exists($existing->file_path)) {
                Storage::disk('public')->delete($existing->file_path);
            }

            $storedPath = $uploadedFile->storeAs(
                'procurements/'.$procurement->id.'/srfi',
                $safeFileName,
                'public'
            );

            $srfiAttachment = SrfiAttachment::updateOrCreate(
                ['procurement_id' => $procurement->id],
                [
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $safeFileName,
                    'file_path' => $storedPath,
                    'mime_type' => $uploadedFile->getClientMimeType() ?: 'application/pdf',
                    'file_size' => $uploadedFile->getSize() ?: 0,
                    'remarks' => $validated['remarks'] ?? null,
                ]
            );

            $action = $beforeData ? 'srfi_replaced' : 'srfi_uploaded';
            $afterData = $srfiAttachment->only([
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'uploaded_by',
            ]);
            [$beforeDiff, $afterDiff, $changedFields] = $this->revisionLogger->extractDiff($beforeData ?? [], $afterData);

            $this->revisionLogger->log(
                $request,
                $procurement,
                $action,
                'srfi',
                (int) $srfiAttachment->id,
                $beforeDiff === [] ? null : $beforeDiff,
                $afterDiff,
                $changedFields === [] ? array_keys($afterData) : $changedFields
            );

            return [
                'srfi' => $srfiAttachment->fresh(),
                'created' => $beforeData === null,
            ];
        });

        return response()->json([
            'message' => $result['created'] ? 'SRFI uploaded successfully.' : 'SRFI replaced successfully.',
            'srfi' => $result['srfi'],
        ], $result['created'] ? 201 : 200);
    }

    public function show(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canView($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to view SRFI for this procurement.',
            ], 403);
        }

        $srfiAttachment = $procurement->srfiAttachment;
        if (! $srfiAttachment) {
            return response()->json([
                'message' => 'SRFI not found for this procurement.',
            ], 404);
        }

        return response()->json([
            'srfi' => $srfiAttachment,
        ]);
    }

    public function download(Request $request, Procurement $procurement): BinaryFileResponse|JsonResponse
    {
        if (! $this->canView($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to download SRFI for this procurement.',
            ], 403);
        }

        $srfiAttachment = $procurement->srfiAttachment;
        if (! $srfiAttachment) {
            return response()->json([
                'message' => 'SRFI not found for this procurement.',
            ], 404);
        }

        if (! Storage::disk('public')->exists($srfiAttachment->file_path)) {
            return response()->json([
                'message' => 'SRFI file is missing from storage.',
            ], 404);
        }

        return response()->download(
            Storage::disk('public')->path($srfiAttachment->file_path),
            $srfiAttachment->file_name,
            ['Content-Type' => $srfiAttachment->mime_type ?: 'application/pdf']
        );
    }

    public function replace(Request $request, Procurement $procurement): JsonResponse
    {
        return $this->upload($request, $procurement);
    }

    public function destroy(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canManage($request->user())) {
            return response()->json([
                'message' => 'You are not allowed to delete SRFI files.',
            ], 403);
        }

        $srfiAttachment = $procurement->srfiAttachment;
        if (! $srfiAttachment) {
            return response()->json([
                'message' => 'SRFI not found for this procurement.',
            ], 404);
        }

        DB::transaction(function () use ($request, $procurement, $srfiAttachment): void {
            $before = $srfiAttachment->only([
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'uploaded_by',
            ]);

            if (Storage::disk('public')->exists($srfiAttachment->file_path)) {
                Storage::disk('public')->delete($srfiAttachment->file_path);
            }

            $srfiId = (int) $srfiAttachment->id;
            $srfiAttachment->delete();

            $this->revisionLogger->log(
                $request,
                $procurement,
                'srfi_deleted',
                'srfi',
                $srfiId,
                $before,
                null,
                array_keys($before)
            );
        });

        return response()->json([
            'message' => 'SRFI deleted successfully.',
        ]);
    }

    private function sanitizeFileName(string $originalName, string $fallbackExtension, string $prefix): string
    {
        $base = pathinfo($originalName, PATHINFO_FILENAME);
        $safeBase = (string) Str::of($base)
            ->ascii()
            ->replaceMatches('/[^A-Za-z0-9\-_]+/', '_')
            ->trim('_')
            ->limit(120, '');

        if ($safeBase === '') {
            $safeBase = $prefix;
        }

        return strtolower($safeBase).'-'.time().'.'.strtolower(trim($fallbackExtension, '.'));
    }

    private function canView(?User $user, Procurement $procurement): bool
    {
        if (! $user) {
            return false;
        }

        return (int) $procurement->requested_by === (int) $user->id
            || $this->canManage($user)
            || $this->isSuperAdmin($user);
    }

    private function canManage(?User $user): bool
    {
        return $this->isBudgetOfficer($user) || $this->isAdmin($user);
    }

    private function isBudgetOfficer(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        $accessType = strtolower(trim((string) $user->access_type));
        if (in_array($accessType, ['budget_officer', 'budget officer', 'budget'], true)) {
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

        return str_contains($haystack, 'budget officer');
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

    private function isSuperAdmin(?User $user): bool
    {
        if (! $user) {
            return false;
        }

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
