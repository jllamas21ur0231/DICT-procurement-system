<?php

namespace App\Http\Controllers;

use App\Models\Procurement;
use App\Models\TechnicalSpecificationAttachment;
use App\Models\User;
use App\Services\ProcurementRevisionLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class TechnicalSpecificationAttachmentController extends Controller
{
    public function __construct(private readonly ProcurementRevisionLogger $revisionLogger) {}

    public function upload(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canManage($request->user())) {
            return response()->json([
                'message' => 'You are not allowed to upload technical specification files.',
            ], 403);
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'spec_type' => ['required', 'string', 'max:100'],
            'label' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $uploadedFile = $validated['file'];
        $safeFileName = $this->sanitizeFileName(
            $uploadedFile->getClientOriginalName(),
            $uploadedFile->extension() ?: 'pdf',
            'technical-spec'
        );

        $technicalSpecification = DB::transaction(function () use ($request, $procurement, $uploadedFile, $safeFileName, $validated): TechnicalSpecificationAttachment {
            $storedPath = $uploadedFile->storeAs(
                'procurements/'.$procurement->id.'/technical-specifications',
                $safeFileName,
                'public'
            );

            $technicalSpecification = TechnicalSpecificationAttachment::create([
                'procurement_id' => $procurement->id,
                'uploaded_by' => $request->user()->id,
                'spec_type' => trim((string) $validated['spec_type']),
                'label' => $validated['label'] ?? null,
                'file_name' => $safeFileName,
                'file_path' => $storedPath,
                'mime_type' => $uploadedFile->getClientMimeType() ?: 'application/pdf',
                'file_size' => $uploadedFile->getSize() ?: 0,
                'remarks' => $validated['remarks'] ?? null,
                'sort_order' => $validated['sort_order'] ?? null,
                'deleted' => false,
            ]);

            $afterData = $technicalSpecification->only([
                'spec_type',
                'label',
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'sort_order',
                'uploaded_by',
            ]);

            $this->revisionLogger->log(
                $request,
                $procurement,
                'technical_spec_uploaded',
                'technical_specification',
                (int) $technicalSpecification->id,
                null,
                $afterData,
                array_keys($afterData)
            );

            return $technicalSpecification->fresh();
        });

        return response()->json([
            'message' => 'Technical specification attachment uploaded successfully.',
            'technical_specification' => $technicalSpecification,
        ], 201);
    }

    public function index(Request $request, Procurement $procurement): JsonResponse
    {
        if (! $this->canView($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to view technical specification attachments for this procurement.',
            ], 403);
        }

        $attachments = $procurement->technicalSpecificationAttachments()
            ->orderByRaw('CASE WHEN sort_order IS NULL THEN 1 ELSE 0 END')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'technical_specifications' => $attachments,
        ]);
    }

    public function show(Request $request, Procurement $procurement, TechnicalSpecificationAttachment $technicalSpecification): JsonResponse
    {
        if (! $this->canView($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to view technical specification attachments for this procurement.',
            ], 403);
        }

        if (! $this->belongsToProcurement($procurement, $technicalSpecification)) {
            return response()->json([
                'message' => 'Technical specification attachment does not belong to this procurement.',
            ], 422);
        }

        return response()->json([
            'technical_specification' => $technicalSpecification,
        ]);
    }

    public function download(Request $request, Procurement $procurement, TechnicalSpecificationAttachment $technicalSpecification): BinaryFileResponse|JsonResponse
    {
        if (! $this->canView($request->user(), $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to download technical specification attachments for this procurement.',
            ], 403);
        }

        if (! $this->belongsToProcurement($procurement, $technicalSpecification)) {
            return response()->json([
                'message' => 'Technical specification attachment does not belong to this procurement.',
            ], 422);
        }

        if (! Storage::disk('public')->exists($technicalSpecification->file_path)) {
            return response()->json([
                'message' => 'Technical specification file is missing from storage.',
            ], 404);
        }

        return response()->download(
            Storage::disk('public')->path($technicalSpecification->file_path),
            $technicalSpecification->file_name,
            ['Content-Type' => $technicalSpecification->mime_type ?: 'application/pdf']
        );
    }

    public function update(Request $request, Procurement $procurement, TechnicalSpecificationAttachment $technicalSpecification): JsonResponse
    {
        if (! $this->canManage($request->user())) {
            return response()->json([
                'message' => 'You are not allowed to update technical specification attachments.',
            ], 403);
        }

        if (! $this->belongsToProcurement($procurement, $technicalSpecification)) {
            return response()->json([
                'message' => 'Technical specification attachment does not belong to this procurement.',
            ], 422);
        }

        $validated = $request->validate([
            'file' => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
            'spec_type' => ['sometimes', 'string', 'max:100'],
            'label' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $updatedAttachment = DB::transaction(function () use ($request, $procurement, $technicalSpecification, $validated): TechnicalSpecificationAttachment {
            $beforeData = $technicalSpecification->only([
                'spec_type',
                'label',
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'sort_order',
                'uploaded_by',
            ]);

            $payload = [
                'uploaded_by' => $request->user()->id,
            ];

            if (array_key_exists('spec_type', $validated)) {
                $payload['spec_type'] = trim((string) $validated['spec_type']);
            }
            if (array_key_exists('label', $validated)) {
                $payload['label'] = $validated['label'];
            }
            if (array_key_exists('remarks', $validated)) {
                $payload['remarks'] = $validated['remarks'];
            }
            if (array_key_exists('sort_order', $validated)) {
                $payload['sort_order'] = $validated['sort_order'];
            }

            if (array_key_exists('file', $validated) && $validated['file']) {
                $uploadedFile = $validated['file'];
                $safeFileName = $this->sanitizeFileName(
                    $uploadedFile->getClientOriginalName(),
                    $uploadedFile->extension() ?: 'pdf',
                    'technical-spec'
                );

                if (Storage::disk('public')->exists($technicalSpecification->file_path)) {
                    Storage::disk('public')->delete($technicalSpecification->file_path);
                }

                $storedPath = $uploadedFile->storeAs(
                    'procurements/'.$procurement->id.'/technical-specifications',
                    $safeFileName,
                    'public'
                );

                $payload['file_name'] = $safeFileName;
                $payload['file_path'] = $storedPath;
                $payload['mime_type'] = $uploadedFile->getClientMimeType() ?: 'application/pdf';
                $payload['file_size'] = $uploadedFile->getSize() ?: 0;
            }

            $technicalSpecification->fill($payload);
            $technicalSpecification->save();

            $afterData = $technicalSpecification->only([
                'spec_type',
                'label',
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'sort_order',
                'uploaded_by',
            ]);
            [$beforeDiff, $afterDiff, $changedFields] = $this->revisionLogger->extractDiff($beforeData, $afterData);

            $this->revisionLogger->log(
                $request,
                $procurement,
                'technical_spec_updated',
                'technical_specification',
                (int) $technicalSpecification->id,
                $beforeDiff === [] ? null : $beforeDiff,
                $afterDiff === [] ? $afterData : $afterDiff,
                $changedFields === [] ? array_keys($afterData) : $changedFields
            );

            return $technicalSpecification->fresh();
        });

        return response()->json([
            'message' => 'Technical specification attachment updated successfully.',
            'technical_specification' => $updatedAttachment,
        ]);
    }

    public function destroy(Request $request, Procurement $procurement, TechnicalSpecificationAttachment $technicalSpecification): JsonResponse
    {
        if (! $this->canManage($request->user())) {
            return response()->json([
                'message' => 'You are not allowed to delete technical specification attachments.',
            ], 403);
        }

        if (! $this->belongsToProcurement($procurement, $technicalSpecification)) {
            return response()->json([
                'message' => 'Technical specification attachment does not belong to this procurement.',
            ], 422);
        }

        DB::transaction(function () use ($request, $procurement, $technicalSpecification): void {
            $before = $technicalSpecification->only([
                'spec_type',
                'label',
                'file_name',
                'file_path',
                'mime_type',
                'file_size',
                'remarks',
                'sort_order',
                'uploaded_by',
            ]);

            if (Storage::disk('public')->exists($technicalSpecification->file_path)) {
                Storage::disk('public')->delete($technicalSpecification->file_path);
            }

            $id = (int) $technicalSpecification->id;
            $technicalSpecification->delete();

            $this->revisionLogger->log(
                $request,
                $procurement,
                'technical_spec_deleted',
                'technical_specification',
                $id,
                $before,
                null,
                array_keys($before)
            );
        });

        return response()->json([
            'message' => 'Technical specification attachment deleted successfully.',
        ]);
    }

    private function belongsToProcurement(Procurement $procurement, TechnicalSpecificationAttachment $technicalSpecification): bool
    {
        return (int) $technicalSpecification->procurement_id === (int) $procurement->id
            && ! (bool) $technicalSpecification->deleted;
        return (int) $technicalSpecification->procurement_id === (int) $procurement->id;
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
