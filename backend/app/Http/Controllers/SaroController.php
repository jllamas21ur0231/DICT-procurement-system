<?php

namespace App\Http\Controllers;

use App\Models\Procurement;
use App\Models\Saro;
use App\Models\User;
use App\Services\NotificationWorkflowService;
use App\Services\ProcurementRevisionLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SaroController extends Controller
{
    public function __construct(
        private readonly ProcurementRevisionLogger $revisionLogger,
        private readonly NotificationWorkflowService $notificationWorkflow
    ) {}

    public function upload(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canManageSaro($request->user())) {
            return response()->json([
                'message' => 'You are not allowed to upload SARO files.',
            ], 403);
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $uploadedFile = $validated['file'];
        $safeFileName = $this->sanitizeFileName($uploadedFile->getClientOriginalName(), $uploadedFile->extension() ?: 'pdf');

        $result = DB::transaction(function () use ($request, $procurement, $uploadedFile, $safeFileName, $validated): array {
            $existing = $procurement->saro;
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
                'procurements/'.$procurement->id.'/saro',
                $safeFileName,
                'public'
            );

            $saro = Saro::updateOrCreate(
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

            $action = $beforeData ? 'saro_replaced' : 'saro_uploaded';
            $afterData = $saro->only([
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'uploaded_by',
            ]);
            [$beforeDiff, $afterDiff, $changedFields] = $this->revisionLogger->extractDiff(
                $beforeData ?? [],
                $afterData
            );

            $this->revisionLogger->log(
                $request,
                $procurement,
                $action,
                'saro',
                (int) $saro->id,
                $beforeDiff === [] ? null : $beforeDiff,
                $afterDiff,
                $changedFields === [] ? array_keys($afterData) : $changedFields
            );

            $this->notificationWorkflow->saroNotifyRequester($procurement, $request->user(), $action, $saro);
            if ($action === 'saro_replaced') {
                $this->notificationWorkflow->saroNotifyBudgetAdmins($procurement, $request->user(), $action, $saro);
            }

            return [
                'saro' => $saro->fresh(),
                'created' => $beforeData === null,
            ];
        });

        return response()->json([
            'message' => $result['created'] ? 'SARO uploaded successfully.' : 'SARO replaced successfully.',
            'saro' => $result['saro'],
        ], $result['created'] ? 201 : 200);
    }

    public function show(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canViewSaro($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to view SARO for this procurement.',
            ], 403);
        }

        $saro = $procurement->saro;
        if (! $saro) {
            return response()->json([
                'message' => 'SARO not found for this procurement.',
            ], 404);
        }

        return response()->json([
            'saro' => $saro,
        ]);
    }

    public function download(Request $request, Procurement $procurement): BinaryFileResponse|JsonResponse
    {
        if (! $this->canViewSaro($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to download SARO for this procurement.',
            ], 403);
        }

        $saro = $procurement->saro;
        if (! $saro) {
            return response()->json([
                'message' => 'SARO not found for this procurement.',
            ], 404);
        }

        if (! Storage::disk('public')->exists($saro->file_path)) {
            return response()->json([
                'message' => 'SARO file is missing from storage.',
            ], 404);
        }

        return response()->download(
            Storage::disk('public')->path($saro->file_path),
            $saro->file_name,
            ['Content-Type' => $saro->mime_type ?: 'application/pdf']
        );
    }

    public function replace(Request $request, Procurement $procurement): JsonResponse
    {
        return $this->upload($request, $procurement);
    }

    public function destroy(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canManageSaro($request->user())) {
            return response()->json([
                'message' => 'You are not allowed to delete SARO files.',
            ], 403);
        }

        $saro = $procurement->saro;
        if (! $saro) {
            return response()->json([
                'message' => 'SARO not found for this procurement.',
            ], 404);
        }

        DB::transaction(function () use ($request, $procurement, $saro): void {
            $before = $saro->only([
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'uploaded_by',
            ]);

            if (Storage::disk('public')->exists($saro->file_path)) {
                Storage::disk('public')->delete($saro->file_path);
            }

            $saroId = (int) $saro->id;
            $saro->delete();

            $this->revisionLogger->log(
                $request,
                $procurement,
                'saro_deleted',
                'saro',
                $saroId,
                $before,
                null,
                array_keys($before)
            );

            $this->notificationWorkflow->saroNotifyRequester($procurement, $request->user(), 'saro_deleted', null);
            $this->notificationWorkflow->saroNotifyBudgetAdmins($procurement, $request->user(), 'saro_deleted', null);
        });

        return response()->json([
            'message' => 'SARO deleted successfully.',
        ]);
    }

    private function sanitizeFileName(string $originalName, string $fallbackExtension): string
    {
        $base = pathinfo($originalName, PATHINFO_FILENAME);
        $safeBase = (string) Str::of($base)
            ->ascii()
            ->replaceMatches('/[^A-Za-z0-9\-_]+/', '_')
            ->trim('_')
            ->limit(120, '');

        if ($safeBase === '') {
            $safeBase = 'saro';
        }

        return strtolower($safeBase).'-'.time().'.'.strtolower(trim($fallbackExtension, '.'));
    }

    private function canViewSaro(?User $user, Procurement $procurement): bool
    {
        if (! $user) {
            return false;
        }

        return (int) $procurement->requested_by === (int) $user->id
            || $this->canManageSaro($user)
            || $this->isSuperAdmin($user);
    }

    private function canManageSaro(?User $user): bool
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
