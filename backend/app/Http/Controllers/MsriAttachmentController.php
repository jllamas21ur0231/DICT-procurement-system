<?php

namespace App\Http\Controllers;

use App\Models\MsriAttachment;
use App\Models\Procurement;
use App\Models\User;
use App\Services\ProcurementRevisionLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MsriAttachmentController extends Controller
{
    public function __construct(private readonly ProcurementRevisionLogger $revisionLogger) {}

    public function upload(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canManage($request->user())) {
            return response()->json([
                'message' => 'You are not allowed to upload MSRI files.',
            ], 403);
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $uploadedFile = $validated['file'];
        $safeFileName = $this->sanitizeFileName($uploadedFile->getClientOriginalName(), $uploadedFile->extension() ?: 'pdf', 'msri');

        $result = DB::transaction(function () use ($request, $procurement, $uploadedFile, $safeFileName, $validated): array {
            $existing = $procurement->msriAttachment;
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
                'procurements/'.$procurement->id.'/msri',
                $safeFileName,
                'public'
            );

            $msriAttachment = MsriAttachment::updateOrCreate(
                ['procurement_id' => $procurement->id],
                [
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $safeFileName,
                    'file_path' => $storedPath,
                    'mime_type' => $uploadedFile->getClientMimeType() ?: 'application/pdf',
                    'file_size' => $uploadedFile->getSize() ?: 0,
                    'remarks' => $validated['remarks'] ?? null,
                    'deleted' => false,
                ]
            );

            $action = $beforeData ? 'msri_replaced' : 'msri_uploaded';
            $afterData = $msriAttachment->only([
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
                'msri',
                (int) $msriAttachment->id,
                $beforeDiff === [] ? null : $beforeDiff,
                $afterDiff,
                $changedFields === [] ? array_keys($afterData) : $changedFields
            );

            return [
                'msri' => $msriAttachment->fresh(),
                'created' => $beforeData === null,
            ];
        });

        return response()->json([
            'message' => $result['created'] ? 'MSRI uploaded successfully.' : 'MSRI replaced successfully.',
            'msri' => $result['msri'],
        ], $result['created'] ? 201 : 200);
    }

    public function show(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canView($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to view MSRI for this procurement.',
            ], 403);
        }

        $msriAttachment = $procurement->msriAttachment;
        if (! $msriAttachment) {
            return response()->json([
                'message' => 'MSRI not found for this procurement.',
            ], 404);
        }

        return response()->json([
            'msri' => $msriAttachment,
        ]);
    }

    public function download(Request $request, Procurement $procurement): BinaryFileResponse|JsonResponse
    {
        if (! $this->canView($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to download MSRI for this procurement.',
            ], 403);
        }

        $msriAttachment = $procurement->msriAttachment;
        if (! $msriAttachment) {
            return response()->json([
                'message' => 'MSRI not found for this procurement.',
            ], 404);
        }

        if (! Storage::disk('public')->exists($msriAttachment->file_path)) {
            return response()->json([
                'message' => 'MSRI file is missing from storage.',
            ], 404);
        }

        return response()->download(
            Storage::disk('public')->path($msriAttachment->file_path),
            $msriAttachment->file_name,
            ['Content-Type' => $msriAttachment->mime_type ?: 'application/pdf']
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
                'message' => 'You are not allowed to delete MSRI files.',
            ], 403);
        }

        $msriAttachment = $procurement->msriAttachment;
        if (! $msriAttachment) {
            return response()->json([
                'message' => 'MSRI not found for this procurement.',
            ], 404);
        }

        DB::transaction(function () use ($request, $procurement, $msriAttachment): void {
            $before = $msriAttachment->only([
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'uploaded_by',
            ]);

            if (Storage::disk('public')->exists($msriAttachment->file_path)) {
                Storage::disk('public')->delete($msriAttachment->file_path);
            }

            $msriId = (int) $msriAttachment->id;
            $msriAttachment->delete();

            $this->revisionLogger->log(
                $request,
                $procurement,
                'msri_deleted',
                'msri',
                $msriId,
                $before,
                null,
                array_keys($before)
            );
        });

        return response()->json([
            'message' => 'MSRI deleted successfully.',
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
