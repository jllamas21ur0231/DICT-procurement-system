<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $includeDeleted = filter_var($request->query('include_deleted', false), FILTER_VALIDATE_BOOLEAN);
        $includeDeletedItems = filter_var($request->query('include_deleted_items', false), FILTER_VALIDATE_BOOLEAN);

        $query = PurchaseRequest::query()
            ->with([
                'procurement.requester',
                'items' => function ($itemQuery) use ($includeDeletedItems): void {
                    if (! $includeDeletedItems) {
                        $itemQuery->where('deleted', false);
                    }
                },
            ])
            ->latest('updated_at');

        if (! $includeDeleted) {
            $query->where('deleted', false);
        }

        return response()->json($query->paginate(15));
    }

    public function show(Request $request, PurchaseRequest $purchaseRequest): JsonResponse
    {
        if (! $this->canModify($request, $purchaseRequest)) {
            return response()->json(['message' => 'You are not allowed to view this purchase request.'], 403);
        }

        $includeDeletedItems = filter_var($request->query('include_deleted_items', false), FILTER_VALIDATE_BOOLEAN);
        $includeDeleted = filter_var($request->query('include_deleted', false), FILTER_VALIDATE_BOOLEAN);

        if ($purchaseRequest->deleted && ! $includeDeleted) {
            return response()->json(['message' => 'Purchase request not found.'], 404);
        }

        $purchaseRequest->load([
            'procurement.requester',
            'items' => function ($itemQuery) use ($includeDeletedItems): void {
                if (! $includeDeletedItems) {
                    $itemQuery->where('deleted', false);
                }
            },
        ]);

        return response()->json($purchaseRequest);
    }

    public function update(Request $request, PurchaseRequest $purchaseRequest): JsonResponse
    {
        if (! $this->canModify($request, $purchaseRequest)) {
            return response()->json(['message' => 'You are not allowed to update this purchase request.'], 403);
        }

        $validated = $request->validate([
            'office' => ['sometimes', 'string', 'max:255'],
            'date_created' => ['sometimes', 'date'],
            'responsibility_center_code' => ['sometimes', 'string', 'max:100'],
            'purpose' => ['sometimes', 'string'],
        ]);

        $purchaseRequest->fill($validated);
        $purchaseRequest->save();

        return response()->json([
            'message' => 'Purchase request updated successfully.',
            'purchase_request' => $purchaseRequest->load([
                'procurement.requester',
                'items' => fn ($itemQuery) => $itemQuery->where('deleted', false),
            ]),
        ]);
    }

    public function destroy(Request $request, PurchaseRequest $purchaseRequest): JsonResponse
    {
        if (! $this->canModify($request, $purchaseRequest)) {
            return response()->json(['message' => 'You are not allowed to delete this purchase request.'], 403);
        }

        DB::transaction(function () use ($purchaseRequest): void {
            $purchaseRequest->update(['deleted' => true]);
            $purchaseRequest->items()->update(['deleted' => true]);
        });

        return response()->json(['message' => 'Purchase request marked as deleted.']);
    }

    public function restore(Request $request, PurchaseRequest $purchaseRequest): JsonResponse
    {
        if (! $this->canModify($request, $purchaseRequest)) {
            return response()->json(['message' => 'You are not allowed to restore this purchase request.'], 403);
        }

        DB::transaction(function () use ($purchaseRequest): void {
            $purchaseRequest->update(['deleted' => false]);
            $purchaseRequest->items()->update(['deleted' => false]);
        });

        return response()->json([
            'message' => 'Purchase request restored successfully.',
            'purchase_request' => $purchaseRequest->fresh()->load([
                'procurement.requester',
                'items' => fn ($itemQuery) => $itemQuery->where('deleted', false),
            ]),
        ]);
    }

    public function storeItem(Request $request, PurchaseRequest $purchaseRequest): JsonResponse
    {
        if (! $this->canModify($request, $purchaseRequest)) {
            return response()->json(['message' => 'You are not allowed to add items to this purchase request.'], 403);
        }

        $validated = $request->validate([
            'item_no' => ['required', 'string', 'max:50'],
            'stock_no' => ['nullable', 'string', 'max:100'],
            'unit' => ['required', 'string', 'max:50'],
            'item_description' => ['required', 'string'],
            'item_inclusions' => ['nullable', 'string'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $item = $purchaseRequest->items()->create([
            ...$validated,
            'deleted' => false,
        ]);

        return response()->json([
            'message' => 'Item created successfully.',
            'item' => $item,
        ], 201);
    }

    public function updateItem(Request $request, PurchaseRequest $purchaseRequest, Item $item): JsonResponse
    {
        if (! $this->itemBelongsToPurchaseRequest($purchaseRequest, $item)) {
            return response()->json(['message' => 'Item not found for this purchase request.'], 404);
        }

        if (! $this->canModify($request, $purchaseRequest)) {
            return response()->json(['message' => 'You are not allowed to update this item.'], 403);
        }

        $validated = $request->validate([
            'item_no' => ['sometimes', 'string', 'max:50'],
            'stock_no' => ['nullable', 'string', 'max:100'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'item_description' => ['sometimes', 'string'],
            'item_inclusions' => ['nullable', 'string'],
            'quantity' => ['sometimes', 'numeric', 'min:0.01'],
            'unit_cost' => ['sometimes', 'numeric', 'min:0'],
        ]);

        $item->fill($validated);
        $item->save();

        return response()->json([
            'message' => 'Item updated successfully.',
            'item' => $item,
        ]);
    }

    public function destroyItem(Request $request, PurchaseRequest $purchaseRequest, Item $item): JsonResponse
    {
        if (! $this->itemBelongsToPurchaseRequest($purchaseRequest, $item)) {
            return response()->json(['message' => 'Item not found for this purchase request.'], 404);
        }

        if (! $this->canModify($request, $purchaseRequest)) {
            return response()->json(['message' => 'You are not allowed to delete this item.'], 403);
        }

        $item->update(['deleted' => true]);

        return response()->json(['message' => 'Item marked as deleted.']);
    }

    public function restoreItem(Request $request, PurchaseRequest $purchaseRequest, Item $item): JsonResponse
    {
        if (! $this->itemBelongsToPurchaseRequest($purchaseRequest, $item)) {
            return response()->json(['message' => 'Item not found for this purchase request.'], 404);
        }

        if (! $this->canModify($request, $purchaseRequest)) {
            return response()->json(['message' => 'You are not allowed to restore this item.'], 403);
        }

        if ($purchaseRequest->deleted) {
            return response()->json([
                'message' => 'Restore the purchase request first before restoring its items.',
            ], 422);
        }

        $item->update(['deleted' => false]);

        return response()->json([
            'message' => 'Item restored successfully.',
            'item' => $item,
        ]);
    }

    private function itemBelongsToPurchaseRequest(PurchaseRequest $purchaseRequest, Item $item): bool
    {
        return (int) $item->purchase_request_id === (int) $purchaseRequest->id;
    }

    private function canModify(Request $request, PurchaseRequest $purchaseRequest): bool
    {
        $user = $request->user();
        $procurement = $purchaseRequest->procurement;

        return $user && $procurement && (
            (int) $procurement->requested_by === (int) $user->id
            || $this->isBudgetOfficer($user)
        );
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
}
