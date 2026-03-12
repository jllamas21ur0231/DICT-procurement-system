<?php

namespace App\Http\Controllers;

use App\Models\AppAttachment;
use App\Models\Notification;
use App\Models\Procurement;
use App\Models\ProcurementPdf;
use App\Models\PpmpAttachment;
use App\Models\MsriAttachment;
use App\Models\PurchaseRequest;
use App\Models\SrfiAttachment;
use App\Models\Saro;
use App\Models\TechnicalSpecificationAttachment;
use App\Models\User;
use App\Services\NotificationWorkflowService;
use App\Services\ProcurementRevisionLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * Handles the main procurement workspace for authenticated users.
 *
 * This controller is one of the heaviest application entry points because it
 * coordinates:
 * - procurement CRUD operations
 * - attachment-aware business rules
 * - purchase request coupling
 * - revision logging
 * - notification side effects
 * - search/filter/index endpoints used by the frontend tables
 *
 * The controller intentionally keeps read/query helpers and permission logic
 * near the bottom so the primary request handlers stay near the top.
 */
class ProcurementController extends Controller
{
    /**
     * Statuses currently accepted by validation and workflow logic.
     */
    public const ALLOWED_STATUSES = ['pending', 'approved', 'rejected'];
  
    /**
     * Inject supporting services for audit logging and notifications.
     */
    public function __construct(
        private readonly ProcurementRevisionLogger $revisionLogger,
        private readonly NotificationWorkflowService $notificationWorkflow
    ) {
    }

    /**
     * Search procurements with support for keyword, exact-match, cursor, and
     * short-lived caching to keep repeated table queries responsive.
     *
     * This endpoint is designed for the frontend's global procurement search,
     * so it accepts both standard pagination and cursor-based async loading.
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'cursor' => ['nullable', 'string'],
            'async' => ['nullable', 'boolean'],
        ]);

        $queryText = trim($validated['q']);
        $exact = filter_var($request->query('exact', false), FILTER_VALIDATE_BOOLEAN);
        $includeDeleted = filter_var($request->query('include_deleted', false), FILTER_VALIDATE_BOOLEAN);
        $perPage = (int) ($validated['per_page'] ?? 15);
        $cursor = $validated['cursor'] ?? null;
        $async = filter_var($validated['async'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = Procurement::query()
            ->with($this->procurementRelations())
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        if (!$includeDeleted) {
            $query->where('deleted', false);
        }

        if ($exact) {
            $query->where(function ($innerQuery) use ($queryText): void {
                $innerQuery->where('procurement_no', $queryText)
                    ->orWhere('title', $queryText)
                    ->orWhereHas('procurementMode', fn($modeQuery) => $modeQuery->where('name', $queryText))
                    ->orWhereHas('projectRecord', fn($projectQuery) => $projectQuery->where('name', $queryText))
                    ->orWhereHas('requester', fn($requesterQuery) => $this->applyRequesterExactSearch($requesterQuery, $queryText));
            });

            return response()->json($this->buildPaginatedResponse($query, $perPage, $cursor, $async));
        }

        $terms = preg_split('/\s+/', $queryText, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $query->where(function ($groupQuery) use ($terms, $queryText): void {
            if ($terms === []) {
                return;
            }

            foreach ($terms as $term) {
                $groupQuery->where(function ($termQuery) use ($term): void {
                    $variants = array_values(array_unique([
                        $term,
                        $this->normalizeSearchToken($term),
                    ]));

                    $termQuery->where(function ($variantQuery) use ($variants): void {
                        foreach ($variants as $index => $variant) {
                            $method = $index === 0 ? 'where' : 'orWhere';
                            $variantQuery->{$method}(function ($fieldQuery) use ($variant): void {
                                $fieldQuery->where('procurement_no', 'like', "%{$variant}%")
                                    ->orWhere('title', 'like', "%{$variant}%")
                                    ->orWhereHas('procurementMode', fn($modeQuery) => $modeQuery->where('name', 'like', "%{$variant}%"))
                                    ->orWhereHas('projectRecord', fn($projectQuery) => $projectQuery->where('name', 'like', "%{$variant}%"))
                                    ->orWhereHas('requester', fn($requesterQuery) => $this->applyRequesterLikeSearch($requesterQuery, $variant));
                            });
                        }
                    });
                });
            }

            $groupQuery->orWhere('procurement_no', $queryText);
        });

        $cacheKey = sprintf(
            'procurements:search:%s:%d:%s:%s:%s:%s',
            (string) ($request->user()?->id ?? 'guest'),
            $perPage,
            $queryText,
            $exact ? '1' : '0',
            md5(json_encode(['include_deleted' => $includeDeleted, 'async' => $async], JSON_THROW_ON_ERROR)),
            (string) ($cursor ?? 'page1')
        );

        $result = Cache::remember($cacheKey, now()->addSeconds(10), function () use ($query, $perPage, $cursor, $async) {
            return $this->buildPaginatedResponse($query, $perPage, $cursor, $async);
        });

        return response()->json($result);
    }

    /**
     * Filter procurements using structured query parameters.
     *
     * This endpoint is separate from free-text search so the frontend can
     * build deterministic filter UIs around status, requester, project,
     * procurement mode, and date ranges.
     */
    public function filter(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', Rule::in(self::ALLOWED_STATUSES)],
            'requested_by' => ['nullable', 'string', 'max:255'],
            'project' => ['nullable', 'string', 'max:255'],
            'procurement_mode' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'cursor' => ['nullable', 'string'],
            'async' => ['nullable', 'boolean'],
        ]);

        $includeDeleted = filter_var($request->query('include_deleted', false), FILTER_VALIDATE_BOOLEAN);
        $perPage = (int) ($validated['per_page'] ?? 15);
        $cursor = $validated['cursor'] ?? null;
        $async = filter_var($validated['async'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = Procurement::query()
            ->with($this->procurementRelations())
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        if (!$includeDeleted) {
            $query->where('deleted', false);
        }

        $this->applyAdvancedNameFilters($query, $validated);

        return response()->json($this->buildPaginatedResponse($query, $perPage, $cursor, $async));
    }

    /**
     * Return the procurement listing for authenticated users.
     *
     * This is the broad listing endpoint and can optionally include soft-
     * deleted records when the query parameter requests them.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'cursor' => ['nullable', 'string'],
            'async' => ['nullable', 'boolean'],
        ]);

        $includeDeleted = filter_var($request->query('include_deleted', false), FILTER_VALIDATE_BOOLEAN);
        $perPage = (int) ($validated['per_page'] ?? 15);
        $cursor = $validated['cursor'] ?? null;
        $async = filter_var($validated['async'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = Procurement::query()
            ->with($this->procurementRelations())
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        if (!$includeDeleted) {
            $query->where('deleted', false);
        }

        return response()->json($this->buildPaginatedResponse($query, $perPage, $cursor, $async));
    }

    /**
     * Return only the procurements requested by the currently logged-in user.
     *
     * The response format mirrors the general index endpoint so the frontend
     * can switch between "all" and "mine" views with minimal extra logic.
     */
    public function mine(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'cursor' => ['nullable', 'string'],
            'async' => ['nullable', 'boolean'],
        ]);

        $includeDeleted = filter_var($request->query('include_deleted', false), FILTER_VALIDATE_BOOLEAN);
        $perPage = (int) ($validated['per_page'] ?? 15);
        $cursor = $validated['cursor'] ?? null;
        $async = filter_var($validated['async'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $query = Procurement::query()
            ->with($this->procurementRelations())
            ->where('requested_by', $request->user()->id)
            ->orderByDesc('updated_at')
            ->orderByDesc('id');

        if (!$includeDeleted) {
            $query->where('deleted', false);
        }

        return response()->json($this->buildPaginatedResponse($query, $perPage, $cursor, $async));
    }

    /**
     * Return a single procurement with all standard relations eagerly loaded.
     */
    public function show(Procurement $procurement): JsonResponse
    {
        return response()->json($procurement->load($this->procurementRelations()));
    }

    /**
     * Return paginated revision history for a procurement when the current
     * user is allowed to inspect that record's audit trail.
     */
    public function revisions(Request $request, Procurement $procurement): JsonResponse
    {
        if (!$this->canViewRestrictedData($request, $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to view revisions for this procurement.',
            ], 403);
        }

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) ($validated['per_page'] ?? 20);

        $revisions = $procurement->revisions()
            ->with('actor')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json($revisions);
    }

    /**
     * Create a procurement together with its coupled purchase request and
     * optional attachment-module seed records in one transaction.
     *
     * This endpoint also logs the creation revision and triggers the
     * submission notification workflow once the record is successfully saved.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'procurement_mode_id' => ['required', 'integer', 'exists:procurement_modes,id'],
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'status' => ['nullable', Rule::in(self::ALLOWED_STATUSES)],
            'description' => ['nullable', 'string'],
            'purchase_request' => ['required', 'array'],
            'purchase_request.office' => ['required', 'string', 'max:255'],
            'purchase_request.date_created' => ['required', 'date'],
            'purchase_request.responsibility_center_code' => ['required', 'string', 'max:100'],
            'purchase_request.purpose' => ['required', 'string'],
            'purchase_request.items' => ['nullable', 'array'],
            'purchase_request.items.*.item_no' => ['required_with:purchase_request.items', 'string', 'max:50'],
            'purchase_request.items.*.stock_no' => ['nullable', 'string', 'max:100'],
            'purchase_request.items.*.unit' => ['required_with:purchase_request.items', 'string', 'max:50'],
            'purchase_request.items.*.item_description' => ['required_with:purchase_request.items', 'string'],
            'purchase_request.items.*.item_inclusions' => ['nullable', 'string'],
            'purchase_request.items.*.quantity' => ['required_with:purchase_request.items', 'numeric', 'min:0.01'],
            'purchase_request.items.*.unit_cost' => ['required_with:purchase_request.items', 'numeric', 'min:0'],
            'app' => ['nullable', 'array'],
            'app.file_name' => ['required_with:app', 'string', 'max:255'],
            'app.file_path' => ['required_with:app', 'string', 'max:1000'],
            'app.mime_type' => ['required_with:app', 'string', 'max:150'],
            'app.file_size' => ['required_with:app', 'integer', 'min:1'],
            'app.remarks' => ['nullable', 'string', 'max:2000'],
            'ppmp' => ['nullable', 'array'],
            'ppmp.file_name' => ['required_with:ppmp', 'string', 'max:255'],
            'ppmp.file_path' => ['required_with:ppmp', 'string', 'max:1000'],
            'ppmp.mime_type' => ['required_with:ppmp', 'string', 'max:150'],
            'ppmp.file_size' => ['required_with:ppmp', 'integer', 'min:1'],
            'ppmp.remarks' => ['nullable', 'string', 'max:2000'],
            'msri' => ['nullable', 'array'],
            'msri.file_name' => ['required_with:msri', 'string', 'max:255'],
            'msri.file_path' => ['required_with:msri', 'string', 'max:1000'],
            'msri.mime_type' => ['required_with:msri', 'string', 'max:150'],
            'msri.file_size' => ['required_with:msri', 'integer', 'min:1'],
            'msri.remarks' => ['nullable', 'string', 'max:2000'],
            'srfi' => ['nullable', 'array'],
            'srfi.file_name' => ['required_with:srfi', 'string', 'max:255'],
            'srfi.file_path' => ['required_with:srfi', 'string', 'max:1000'],
            'srfi.mime_type' => ['required_with:srfi', 'string', 'max:150'],
            'srfi.file_size' => ['required_with:srfi', 'integer', 'min:1'],
            'srfi.remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        $procurement = DB::transaction(function () use ($request, $validated): Procurement {
            $procurement = Procurement::create([
                'procurement_no' => 'TMP-' . Str::uuid(),
                'title' => $validated['title'],
                'procurement_mode_id' => $validated['procurement_mode_id'],
                'project_id' => $validated['project_id'],
                'status' => $validated['status'] ?? 'pending',
                'description' => $validated['description'] ?? null,
                'requested_by' => $request->user()->id,
                'deleted' => false,
            ]);

            $procurement->procurement_no = $this->buildProcurementNo($procurement);
            $procurement->save();

            if (isset($validated['app'])) {
                AppAttachment::create([
                    'procurement_id' => $procurement->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $validated['app']['file_name'],
                    'file_path' => $validated['app']['file_path'],
                    'mime_type' => $validated['app']['mime_type'],
                    'file_size' => $validated['app']['file_size'],
                    'remarks' => $validated['app']['remarks'] ?? null,
                    'deleted' => false,
                ]);
            }

            if (isset($validated['ppmp'])) {
                PpmpAttachment::create([
                    'procurement_id' => $procurement->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $validated['ppmp']['file_name'],
                    'file_path' => $validated['ppmp']['file_path'],
                    'mime_type' => $validated['ppmp']['mime_type'],
                    'file_size' => $validated['ppmp']['file_size'],
                    'remarks' => $validated['ppmp']['remarks'] ?? null,
                    'deleted' => false,
                ]);
            }
            if (isset($validated['msri'])) {
                MsriAttachment::create([
                    'procurement_id' => $procurement->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $validated['msri']['file_name'],
                    'file_path' => $validated['msri']['file_path'],
                    'mime_type' => $validated['msri']['mime_type'],
                    'file_size' => $validated['msri']['file_size'],
                    'remarks' => $validated['msri']['remarks'] ?? null,
                    'deleted' => false,
                ]);
            }

            if (isset($validated['srfi'])) {
                SrfiAttachment::create([
                    'procurement_id' => $procurement->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $validated['srfi']['file_name'],
                    'file_path' => $validated['srfi']['file_path'],
                    'mime_type' => $validated['srfi']['mime_type'],
                    'file_size' => $validated['srfi']['file_size'],
                    'remarks' => $validated['srfi']['remarks'] ?? null,
                    'deleted' => false,
                ]);
            }
            $purchaseRequest = $procurement->purchaseRequest()->create([
                'purchase_request_number' => 'TMP-' . Str::uuid(),
                'office' => $validated['purchase_request']['office'],
                'date_created' => $validated['purchase_request']['date_created'],
                'responsibility_center_code' => $validated['purchase_request']['responsibility_center_code'],
                'purpose' => $validated['purchase_request']['purpose'],
                'deleted' => false,
            ]);

            $purchaseRequest->purchase_request_number = $this->buildPurchaseRequestNo($purchaseRequest);
            $purchaseRequest->save();

            foreach ($validated['purchase_request']['items'] ?? [] as $item) {
                $purchaseRequest->items()->create([
                    'item_no' => $item['item_no'],
                    'stock_no' => $item['stock_no'] ?? null,
                    'unit' => $item['unit'],
                    'item_description' => $item['item_description'],
                    'item_inclusions' => $item['item_inclusions'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'deleted' => false,
                ]);
            }

            $this->revisionLogger->log(
                $request,
                $procurement,
                'procurement_created',
                'procurement',
                (int) $procurement->id,
                null,
                [
                    'procurement_no' => $procurement->procurement_no,
                    'title' => $procurement->title,
                    'procurement_mode_id' => $procurement->procurement_mode_id,
                    'project_id' => $procurement->project_id,
                    'status' => $procurement->status,
                    'requested_by' => $procurement->requested_by,
                ],
                ['procurement_no', 'title', 'procurement_mode_id', 'project_id', 'status', 'requested_by']
            );

            $this->notificationWorkflow->procurementSubmitted($procurement, $request->user());

            return $procurement;
        });

        return response()->json([
            'message' => 'Procurement created successfully.',
            'procurement' => $procurement->load($this->procurementRelations()),
        ], 201);
    }

    /**
     * Update procurement data and record meaningful workflow side effects.
     *
     * This is one of the most important write endpoints in the controller:
     * it enforces status restrictions, writes revisions, and notifies other
     * parties when the change should have downstream visibility.
     */
    public function update(Request $request, Procurement $procurement): JsonResponse
    {
        if (!$this->canModify($request, $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to update this procurement.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'procurement_mode_id' => ['sometimes', 'integer', 'exists:procurement_modes,id'],
            'project_id' => ['sometimes', 'integer', 'exists:projects,id'],
            'status' => ['sometimes', Rule::in(self::ALLOWED_STATUSES)],
            'description' => ['nullable', 'string'],
            'pdfs' => ['sometimes', 'array'],
            'pdfs.*.file_name' => ['required_with:pdfs', 'string', 'max:255'],
            'pdfs.*.file_path' => ['required_with:pdfs', 'string', 'max:1000'],
            'pdfs.*.checklist' => ['required_with:pdfs', 'array'],
        ]);

        $user = $request->user();
        $isBudgetOfficer = $this->isBudgetOfficer($user);

        if (array_key_exists('status', $validated) && !$isBudgetOfficer) {
            return response()->json([
                'message' => 'Only Budget Officers can update procurement status.',
            ], 403);
        }

        DB::transaction(function () use ($request, $procurement, $validated): void {
            $originalStatus = $procurement->status;
            $before = $procurement->only([
                'title',
                'procurement_mode_id',
                'project_id',
                'status',
                'description',
                'deleted',
            ]);
            $payload = array_filter([
                'title' => $validated['title'] ?? null,
                'status' => $validated['status'] ?? null,
            ], static fn($value): bool => $value !== null);

            if (array_key_exists('procurement_mode_id', $validated)) {
                $payload['procurement_mode_id'] = $validated['procurement_mode_id'];
            }

            if (array_key_exists('project_id', $validated)) {
                $payload['project_id'] = $validated['project_id'];
            }

            if (array_key_exists('description', $validated)) {
                $payload['description'] = $validated['description'];
            }

            $procurement->fill($payload);

            if (array_key_exists('description', $validated) && $validated['description'] === null) {
                $procurement->description = null;
            }

            $procurement->save();

            $after = $procurement->only([
                'title',
                'procurement_mode_id',
                'project_id',
                'status',
                'description',
                'deleted',
            ]);
            [$beforeDiff, $afterDiff, $changedFields] = $this->revisionLogger->extractDiff($before, $after);

            if ($changedFields !== []) {
                $this->revisionLogger->log(
                    $request,
                    $procurement,
                    'procurement_updated',
                    'procurement',
                    (int) $procurement->id,
                    $beforeDiff,
                    $afterDiff,
                    $changedFields
                );

                $this->notificationWorkflow->procurementRevisedByOther(
                    $procurement,
                    $request->user(),
                    'procurement',
                    $changedFields
                );
            }

            if (array_key_exists('pdfs', $validated)) {
                $procurement->pdfs()->delete();

                foreach ($validated['pdfs'] as $pdf) {
                    $procurement->pdfs()->create([
                        'file_name' => $pdf['file_name'],
                        'file_path' => $pdf['file_path'],
                        'checklist' => $pdf['checklist'],
                    ]);
                }
            }

            if (array_key_exists('status', $validated) && !$this->sameStatus($originalStatus, $procurement->status)) {
                $this->notificationWorkflow->procurementStatusChanged($procurement, $originalStatus);
                $this->notifyRequesterOnStatusChange($procurement, $originalStatus);
            }

            // Notify the procurement owner when someone else edits their procurement.
            if ($changedFields !== [] && $request->user()->id !== (int) $procurement->requested_by) {
                $this->notifyOwnerOnEdit($procurement, $request->user(), $changedFields);
            }
        });

        return response()->json([
            'message' => 'Procurement updated successfully.',
            'procurement' => $procurement->fresh()->load($this->procurementRelations()),
        ]);
    }

    public function uploadAttachment(Request $request, Procurement $procurement): JsonResponse
    {
        if (!$this->canModify($request, $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to upload attachments for this procurement.',
            ], 403);
        }

        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'checklist' => ['required'],
            'file_name' => ['nullable', 'string', 'max:255'],
        ]);

        $checklist = $validated['checklist'];

        if (is_string($checklist)) {
            $decoded = json_decode($checklist, true);
            if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
                return response()->json([
                    'message' => 'Checklist must be a valid JSON object or array.',
                ], 422);
            }
            $checklist = $decoded;
        }

        if (!is_array($checklist)) {
            return response()->json([
                'message' => 'Checklist must be an array or object payload.',
            ], 422);
        }

        $uploadedFile = $validated['file'];
        $storedPath = $uploadedFile->store('procurements/' . $procurement->id, 'public');

        $attachment = $procurement->pdfs()->create([
            'file_name' => $validated['file_name'] ?? $uploadedFile->getClientOriginalName(),
            'file_path' => $storedPath,
            'checklist' => $checklist,
        ]);

        return response()->json([
            'message' => 'Attachment uploaded successfully.',
            'attachment' => $attachment,
        ], 201);
    }

    public function showAttachment(Request $request, Procurement $procurement, ProcurementPdf $attachment): JsonResponse
    {
        if (!$this->canViewRestrictedData($request, $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to view this attachment.',
            ], 403);
        }

        if (!$this->attachmentBelongsToProcurement($procurement, $attachment)) {
            return response()->json([
                'message' => 'Attachment not found for this procurement.',
            ], 404);
        }

        return response()->json($attachment);
    }

    public function downloadAttachment(Request $request, Procurement $procurement, ProcurementPdf $attachment): BinaryFileResponse|JsonResponse
    {
        if (!$this->canViewRestrictedData($request, $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to download this attachment.',
            ], 403);
        }

        if (!$this->attachmentBelongsToProcurement($procurement, $attachment)) {
            return response()->json([
                'message' => 'Attachment not found for this procurement.',
            ], 404);
        }

        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return response()->json([
                'message' => 'Attachment file is missing from storage.',
            ], 404);
        }

        return response()->download(
            Storage::disk('public')->path($attachment->file_path),
            $attachment->file_name,
            ['Content-Type' => 'application/pdf']
        );
    }

    public function destroy(Request $request, Procurement $procurement): JsonResponse
    {
        if (!$this->canModify($request, $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to delete this procurement.',
            ], 403);
        }

        DB::transaction(function () use ($request, $procurement): void {
            $before = ['deleted' => $procurement->deleted];
            $procurement->update(['deleted' => true]);

            $purchaseRequest = $procurement->purchaseRequest;
            if ($purchaseRequest) {
                $purchaseRequest->update(['deleted' => true]);
                $purchaseRequest->items()->update(['deleted' => true]);
            }

            AppAttachment::where('procurement_id', $procurement->id)->update(['deleted' => true]);
            PpmpAttachment::where('procurement_id', $procurement->id)->update(['deleted' => true]);
            MsriAttachment::where('procurement_id', $procurement->id)->update(['deleted' => true]);
            SrfiAttachment::where('procurement_id', $procurement->id)->update(['deleted' => true]);
            Saro::where('procurement_id', $procurement->id)->update(['deleted' => true]);
            TechnicalSpecificationAttachment::where('procurement_id', $procurement->id)->update(['deleted' => true]);

            $this->revisionLogger->log(
                $request,
                $procurement,
                'procurement_deleted',
                'procurement',
                (int) $procurement->id,
                $before,
                ['deleted' => true],
                ['deleted']
            );
        });

        return response()->json([
            'message' => 'Procurement marked as deleted.',
        ]);
    }

    public function restore(Request $request, Procurement $procurement): JsonResponse
    {
        if (!$this->canModify($request, $procurement)) {
            return response()->json([
                'message' => 'You are not allowed to restore this procurement.',
            ], 403);
        }

        DB::transaction(function () use ($request, $procurement): void {
            $before = ['deleted' => $procurement->deleted];
            $procurement->update(['deleted' => false]);

            $purchaseRequest = $procurement->purchaseRequest;
            if ($purchaseRequest) {
                $purchaseRequest->update(['deleted' => false]);
                $purchaseRequest->items()->update(['deleted' => false]);
            }

            AppAttachment::where('procurement_id', $procurement->id)->update(['deleted' => false]);
            PpmpAttachment::where('procurement_id', $procurement->id)->update(['deleted' => false]);
            MsriAttachment::where('procurement_id', $procurement->id)->update(['deleted' => false]);
            SrfiAttachment::where('procurement_id', $procurement->id)->update(['deleted' => false]);
            Saro::where('procurement_id', $procurement->id)->update(['deleted' => false]);
            TechnicalSpecificationAttachment::where('procurement_id', $procurement->id)->update(['deleted' => false]);

            $this->revisionLogger->log(
                $request,
                $procurement,
                'procurement_restored',
                'procurement',
                (int) $procurement->id,
                $before,
                ['deleted' => false],
                ['deleted']
            );
        });

        return response()->json([
            'message' => 'Procurement restored successfully.',
            'procurement' => $procurement->fresh()->load($this->procurementRelations()),
        ]);
    }

    public function duplicate(Request $request, Procurement $procurement): JsonResponse
    {
        $procurement->load([
            'pdfs',
            'appAttachment',
            'ppmpAttachment',
            'msriAttachment',
            'srfiAttachment',
            'technicalSpecificationAttachments',
            'purchaseRequest.items',
            'saro',
        ]);

        $duplicated = DB::transaction(function () use ($request, $procurement): Procurement {
            $clone = Procurement::create([
                'procurement_no' => 'TMP-' . Str::uuid(),
                'title' => $procurement->title,
                'procurement_mode_id' => $procurement->procurement_mode_id,
                'project_id' => $procurement->project_id,
                'status' => 'pending',
                'description' => $procurement->description,
                'requested_by' => $request->user()->id,
                'deleted' => false,
            ]);

            $clone->procurement_no = $this->buildProcurementNo($clone);
            $clone->save();

            foreach ($procurement->pdfs as $pdf) {
                $clone->pdfs()->create([
                    'file_name' => $pdf->file_name,
                    'file_path' => $this->duplicateStoredFilePath($pdf->file_path, $clone->id),
                    'checklist' => $pdf->checklist,
                ]);
            }

            $sourcePurchaseRequest = $procurement->purchaseRequest;
            if ($sourcePurchaseRequest) {
                $purchaseRequest = $clone->purchaseRequest()->create([
                    'purchase_request_number' => 'TMP-' . Str::uuid(),
                    'office' => $sourcePurchaseRequest->office,
                    'date_created' => $sourcePurchaseRequest->date_created,
                    'responsibility_center_code' => $sourcePurchaseRequest->responsibility_center_code,
                    'purpose' => $sourcePurchaseRequest->purpose,
                    'deleted' => false,
                ]);

                $purchaseRequest->purchase_request_number = $this->buildPurchaseRequestNo($purchaseRequest);
                $purchaseRequest->save();

                foreach ($sourcePurchaseRequest->items as $item) {
                    $purchaseRequest->items()->create([
                        'item_no' => $item->item_no,
                        'stock_no' => $item->stock_no,
                        'unit' => $item->unit,
                        'item_description' => $item->item_description,
                        'item_inclusions' => $item->item_inclusions,
                        'quantity' => $item->quantity,
                        'unit_cost' => $item->unit_cost,
                        'deleted' => false,
                    ]);
                }
            }

            if ($procurement->appAttachment) {
                $sourceApp = $procurement->appAttachment;
                AppAttachment::create([
                    'procurement_id' => $clone->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $sourceApp->file_name,
                    'file_path' => $this->duplicateStoredFilePath($sourceApp->file_path, $clone->id, 'app'),
                    'mime_type' => $sourceApp->mime_type,
                    'file_size' => $sourceApp->file_size,
                    'remarks' => $sourceApp->remarks,
                    'deleted' => false,
                ]);
            }

            if ($procurement->ppmpAttachment) {
                $sourcePpmp = $procurement->ppmpAttachment;
                PpmpAttachment::create([
                    'procurement_id' => $clone->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $sourcePpmp->file_name,
                    'file_path' => $this->duplicateStoredFilePath($sourcePpmp->file_path, $clone->id, 'ppmp'),
                    'mime_type' => $sourcePpmp->mime_type,
                    'file_size' => $sourcePpmp->file_size,
                    'remarks' => $sourcePpmp->remarks,
                    'deleted' => false,
                ]);
            }

            if ($procurement->msriAttachment) {
                $sourceMsri = $procurement->msriAttachment;
                MsriAttachment::create([
                    'procurement_id' => $clone->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $sourceMsri->file_name,
                    'file_path' => $this->duplicateStoredFilePath($sourceMsri->file_path, $clone->id, 'msri'),
                    'mime_type' => $sourceMsri->mime_type,
                    'file_size' => $sourceMsri->file_size,
                    'remarks' => $sourceMsri->remarks,
                    'deleted' => false,
                ]);
            }

            if ($procurement->srfiAttachment) {
                $sourceSrfi = $procurement->srfiAttachment;
                SrfiAttachment::create([
                    'procurement_id' => $clone->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $sourceSrfi->file_name,
                    'file_path' => $this->duplicateStoredFilePath($sourceSrfi->file_path, $clone->id, 'srfi'),
                    'mime_type' => $sourceSrfi->mime_type,
                    'file_size' => $sourceSrfi->file_size,
                    'remarks' => $sourceSrfi->remarks,
                    'deleted' => false,
                ]);
            }
            if ($procurement->saro) {
                $sourceSaro = $procurement->saro;
                Saro::create([
                    'procurement_id' => $clone->id,
                    'uploaded_by' => $request->user()->id,
                    'file_name' => $sourceSaro->file_name,
                    'file_path' => $this->duplicateStoredFilePath($sourceSaro->file_path, $clone->id, 'saro'),
                    'mime_type' => $sourceSaro->mime_type,
                    'file_size' => $sourceSaro->file_size,
                    'remarks' => $sourceSaro->remarks,
                    'deleted' => false,
                ]);
            }

            foreach ($procurement->technicalSpecificationAttachments as $sourceTechnicalSpecification) {
                TechnicalSpecificationAttachment::create([
                    'procurement_id' => $clone->id,
                    'uploaded_by' => $request->user()->id,
                    'spec_type' => $sourceTechnicalSpecification->spec_type,
                    'label' => $sourceTechnicalSpecification->label,
                    'file_name' => $sourceTechnicalSpecification->file_name,
                    'file_path' => $this->duplicateStoredFilePath($sourceTechnicalSpecification->file_path, $clone->id, 'technical-specifications'),
                    'mime_type' => $sourceTechnicalSpecification->mime_type,
                    'file_size' => $sourceTechnicalSpecification->file_size,
                    'remarks' => $sourceTechnicalSpecification->remarks,
                    'sort_order' => $sourceTechnicalSpecification->sort_order,
                    'deleted' => false,
                ]);
            }

            $this->revisionLogger->log(
                $request,
                $clone,
                'procurement_duplicated',
                'procurement',
                (int) $clone->id,
                [
                    'source_procurement_id' => (int) $procurement->id,
                    'source_procurement_no' => $procurement->procurement_no,
                ],
                [
                    'procurement_id' => (int) $clone->id,
                    'procurement_no' => $clone->procurement_no,
                ],
                ['source_procurement_id', 'source_procurement_no', 'procurement_id', 'procurement_no']
            );

            return $clone->fresh()->load($this->procurementRelations());
        });

        return response()->json([
            'message' => 'Procurement duplicated successfully.',
            'procurement' => $duplicated,
        ], 201);
    }

    private function buildProcurementNo(Procurement $procurement): string
    {
        $year = $procurement->created_at?->format('Y') ?? now()->format('Y');

        return sprintf('PR-%s-%06d', $year, $procurement->id);
    }

    private function buildPurchaseRequestNo(PurchaseRequest $purchaseRequest): string
    {
        $year = $purchaseRequest->created_at?->format('Y') ?? now()->format('Y');

        return sprintf('PUR-%s-%06d', $year, $purchaseRequest->id);
    }

    private function canModify(Request $request, Procurement $procurement): bool
    {
        $user = $request->user();

        return (bool) $user;
        // All authenticated users can edit any procurement (title, mode, project, description, pdfs).
        // Status changes are separately restricted to budget officers only inside update().
        return $request->user() !== null;
    }

    private function canViewRestrictedData(Request $request, Procurement $procurement): bool
    {
        $user = $request->user();

        return $user && (
            $procurement->requested_by === $user->id
            || $this->isBudgetOfficer($user)
            || $this->isSuperAdmin($user)
        );
    }

    private function attachmentBelongsToProcurement(Procurement $procurement, ProcurementPdf $attachment): bool
    {
        return (int) $attachment->procurement_id === (int) $procurement->id;
    }

    private function duplicateStoredFilePath(string $sourcePath, int $targetProcurementId, ?string $subFolder = null): string
    {
        if ($sourcePath === '' || !Storage::disk('public')->exists($sourcePath)) {
            return $sourcePath;
        }

        $extension = pathinfo($sourcePath, PATHINFO_EXTENSION);
        $targetDir = 'procurements/' . $targetProcurementId . ($subFolder ? '/' . $subFolder : '');
        $targetFileName = Str::uuid() . ($extension ? '.' . $extension : '');
        $targetPath = $targetDir . '/' . $targetFileName;

        Storage::disk('public')->copy($sourcePath, $targetPath);

        return $targetPath;
    }

    private function notifyBudgetOfficersOnSubmission(Procurement $procurement, User $actor): void
    {
        $officers = User::query()
            ->where('id', '!=', $actor->id)
            ->where('is_active', true)
            ->where('is_authorized', true)
            ->where(function ($query): void {
                $query->whereIn('access_type', ['budget_officer', 'budget officer', 'budget'])
                    ->orWhereHas('role', function ($roleQuery): void {
                        $roleQuery->whereRaw('LOWER(role_type) IN (?, ?, ?)', ['budget_officer', 'budget officer', 'budget'])
                            ->orWhereRaw('LOWER(position) LIKE ?', ['%budget%officer%'])
                            ->orWhereRaw('LOWER(designation) LIKE ?', ['%budget%officer%'])
                            ->orWhereRaw('LOWER(role) LIKE ?', ['%budget%officer%']);
                    });
            })
            ->get();

        if ($officers->isEmpty()) {
            $officers = User::query()
                ->where('id', '!=', $actor->id)
                ->where('is_active', true)
                ->where('is_authorized', true)
                ->where('access_type', 'admin')
                ->get();
        }

        if ($officers->isEmpty()) {
            return;
        }

        $now = now();
        $senderName = trim($actor->first_name . ' ' . $actor->last_name);

        $records = $officers->map(function (User $officer) use ($procurement, $now, $senderName): array {
            return [
                'user_id' => $officer->id,
                'type' => 'procurement_submitted',
                'title' => 'New Procurement Submitted',
                'message' => sprintf(
                    '%s submitted procurement %s for review.',
                    $senderName !== '' ? $senderName : 'A user',
                    $procurement->procurement_no
                ),
                'data' => json_encode([
                    'procurement_id' => $procurement->id,
                    'procurement_no' => $procurement->procurement_no,
                    'status' => $procurement->status,
                    'requested_by' => $procurement->requested_by,
                ], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        })->all();

        Notification::insert($records);
    }

    private function notifyRequesterOnStatusChange(Procurement $procurement, string $oldStatus): void
    {
        $requester = $procurement->requester;

        if (!$requester || !$requester->is_active || !$requester->is_authorized) {
            return;
        }

        $newStatus = $procurement->status;
        $normalizedStatus = strtolower(trim($newStatus));

        $type = match ($normalizedStatus) {
            'approved' => 'procurement_approved',
            'rejected' => 'procurement_rejected',
            default => 'procurement_status_updated',
        };

        Notification::create([
            'user_id' => $requester->id,
            'type' => $type,
            'title' => 'Procurement Status Updated',
            'message' => sprintf(
                'Your procurement %s changed from %s to %s.',
                $procurement->procurement_no,
                $oldStatus,
                $newStatus
            ),
            'data' => [
                'procurement_id' => $procurement->id,
                'procurement_no' => $procurement->procurement_no,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ],
        ]);
    }

    private function sameStatus(string $a, string $b): bool
    {
        return strtolower(trim($a)) === strtolower(trim($b));
    }

    private function normalizeSearchToken(string $value): string
    {
        return preg_replace('/(.)\1+/u', '$1', strtolower(trim($value))) ?? strtolower(trim($value));
    }

    private function buildPaginatedResponse($query, int $perPage, ?string $cursor, bool $async)
    {
        if ($async || $cursor !== null) {
            return $query->cursorPaginate($perPage, ['*'], 'cursor', $cursor);
        }

        return $query->paginate($perPage);
    }

    private function applyAdvancedNameFilters($query, array $validated): void
    {
        if (array_key_exists('status', $validated) && $validated['status'] !== null && trim($validated['status']) !== '') {
            $query->where('status', trim((string) $validated['status']));
        }

        if (array_key_exists('requested_by', $validated) && $validated['requested_by'] !== null && trim($validated['requested_by']) !== '') {
            $nameQuery = trim((string) $validated['requested_by']);
            $tokens = preg_split('/\s+/', $nameQuery, -1, PREG_SPLIT_NO_EMPTY) ?: [];

            $query->whereHas('requester', function ($requesterQuery) use ($tokens, $nameQuery): void {
                if ($tokens === []) {
                    $this->applyRequesterLikeSearch($requesterQuery, $nameQuery);

                    return;
                }

                foreach ($tokens as $token) {
                    $requesterQuery->where(function ($nameFieldQuery) use ($token): void {
                        $nameFieldQuery->where('first_name', 'like', "%{$token}%")
                            ->orWhere('middle_name', 'like', "%{$token}%")
                            ->orWhere('last_name', 'like', "%{$token}%");
                    });
                }
            });
        }

        if (array_key_exists('project', $validated) && $validated['project'] !== null && trim($validated['project']) !== '') {
            $projectName = trim((string) $validated['project']);
            $query->whereHas('projectRecord', fn($projectQuery) => $projectQuery->where('name', 'like', "%{$projectName}%"));
        }

        if (array_key_exists('procurement_mode', $validated) && $validated['procurement_mode'] !== null && trim($validated['procurement_mode']) !== '') {
            $modeName = trim((string) $validated['procurement_mode']);
            $query->whereHas('procurementMode', fn($modeQuery) => $modeQuery->where('name', 'like', "%{$modeName}%"));
        }

        if (array_key_exists('date_from', $validated) && $validated['date_from'] !== null) {
            $query->whereDate('created_at', '>=', $validated['date_from']);
        }

        if (array_key_exists('date_to', $validated) && $validated['date_to'] !== null) {
            $query->whereDate('created_at', '<=', $validated['date_to']);
        }
    }

    private function applyRequesterLikeSearch($requesterQuery, string $value): void
    {
        $requesterQuery->where('first_name', 'like', "%{$value}%")
            ->orWhere('middle_name', 'like', "%{$value}%")
            ->orWhere('last_name', 'like', "%{$value}%");
    }

    private function applyRequesterExactSearch($requesterQuery, string $value): void
    {
        $tokens = preg_split('/\s+/', trim($value), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $requesterQuery->where('first_name', $value)
            ->orWhere('middle_name', $value)
            ->orWhere('last_name', $value);

        if (count($tokens) > 1) {
            $requesterQuery->orWhere(function ($tokenQuery) use ($tokens): void {
                foreach ($tokens as $token) {
                    $tokenQuery->where(function ($nameFieldQuery) use ($token): void {
                        $nameFieldQuery->where('first_name', 'like', "%{$token}%")
                            ->orWhere('middle_name', 'like', "%{$token}%")
                            ->orWhere('last_name', 'like', "%{$token}%");
                    });
                }
            });
        }
    }

    private function procurementRelations(): array
    {
        return [
            'requester',
            'projectRecord',
            'procurementMode',
            'pdfs',
            'appAttachment',
            'ppmpAttachment',
            'msriAttachment',
            'srfiAttachment',
            'technicalSpecificationAttachments',
            'saro',
            // Eager-load the single most recent revision with its actor
            // so the frontend can show "Edited by: <name>" without a second request.
            'lastRevision.actor',
            'purchaseRequest' => function ($purchaseRequestQuery): void {
                $purchaseRequestQuery->where('deleted', false)
                    ->with([
                        'items' => fn($itemQuery) => $itemQuery->where('deleted', false),
                    ]);
            },
        ];
    }

    private function isBudgetOfficer(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        $accessType = strtolower(trim((string) $user->access_type));
        if (in_array($accessType, ['budget_officer', 'budget officer', 'budget'], true)) {
            return true;
        }

        $role = $user->role;
        if (!$role) {
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

    private function isSuperAdmin(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        $accessType = strtolower(trim((string) $user->access_type));
        if (in_array($accessType, ['super_admin', 'super admin', 'superadmin'], true)) {
            return true;
        }

        $role = $user->role;
        if (!$role) {
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
    private function notifyOwnerOnEdit(Procurement $procurement, User $actor, array $changedFields): void
    {
        $requester = $procurement->requester;

        if (!$requester || !$requester->is_active || !$requester->is_authorized) {
            return;
        }

        $actorName = trim($actor->first_name . ' ' . $actor->last_name);
        $actorName = $actorName !== '' ? $actorName : 'A user';

        Notification::create([
            'user_id' => $requester->id,
            'type' => 'procurement_revised_by_other_user',
            'title' => 'Procurement Revised',
            'message' => sprintf(
                '%s revised your procurement %s.',
                $actorName,
                $procurement->procurement_no
            ),
            'data' => [
                'procurement_id' => $procurement->id,
                'procurement_no' => $procurement->procurement_no,
                'actor_user_id' => $actor->id,
                'changed_fields' => $changedFields,
                'scope' => 'procurement',
            ],
        ]);
    }

}









