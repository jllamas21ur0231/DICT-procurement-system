<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Procurement;
use App\Models\Saro;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationWorkflowService
{
    public function procurementSubmitted(Procurement $procurement, User $actor): void
    {
        $recipients = $this->budgetOfficersOrAdmins($actor);
        if ($recipients->isEmpty()) {
            return;
        }

        $senderName = trim($actor->first_name.' '.$actor->last_name);
        $now = now();

        $records = $recipients->map(function (User $recipient) use ($procurement, $senderName, $now): array {
            return [
                'user_id' => $recipient->id,
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

        foreach ($recipients as $recipient) {
            $this->sendEmail(
                $recipient,
                'New Procurement Submitted',
                sprintf(
                    'A new procurement (%s) was submitted and is ready for review.',
                    $procurement->procurement_no
                )
            );
        }
    }

    public function procurementStatusChanged(Procurement $procurement, string $oldStatus): void
    {
        $requester = $procurement->requester;
        if (! $requester || ! $this->canReceive($requester)) {
            return;
        }

        $newStatus = $procurement->status;
        $normalizedStatus = strtolower(trim($newStatus));

        $type = match ($normalizedStatus) {
            'approved' => 'procurement_approved',
            'rejected' => 'procurement_rejected',
            'accepted' => 'procurement_accepted',
            'ongoing' => 'procurement_ongoing',
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

        $this->sendEmail(
            $requester,
            'Procurement Status Updated',
            sprintf(
                'Your procurement %s changed status from %s to %s.',
                $procurement->procurement_no,
                $oldStatus,
                $newStatus
            )
        );
    }

    public function procurementRevisedByOther(
        Procurement $procurement,
        User $actor,
        string $scope,
        array $changedFields = []
    ): void {
        $requester = $procurement->requester;
        if (! $requester || ! $this->canReceive($requester) || (int) $requester->id === (int) $actor->id) {
            return;
        }

        $senderName = trim($actor->first_name.' '.$actor->last_name);

        Notification::create([
            'user_id' => $requester->id,
            'type' => 'procurement_revised_by_other_user',
            'title' => 'Procurement Revised',
            'message' => sprintf(
                '%s revised your procurement %s.',
                $senderName !== '' ? $senderName : 'Another user',
                $procurement->procurement_no
            ),
            'data' => [
                'procurement_id' => $procurement->id,
                'procurement_no' => $procurement->procurement_no,
                'scope' => $scope,
                'changed_fields' => $changedFields,
                'actor_user_id' => $actor->id,
            ],
        ]);

        $this->sendEmail(
            $requester,
            'Procurement Revised',
            sprintf(
                '%s revised your procurement %s.',
                $senderName !== '' ? $senderName : 'Another user',
                $procurement->procurement_no
            )
        );
    }

    public function saroNotifyRequester(Procurement $procurement, User $actor, string $event, ?Saro $saro): void
    {
        $requester = $procurement->requester;
        if (! $requester || ! $this->canReceive($requester) || (int) $requester->id === (int) $actor->id) {
            return;
        }

        $title = match ($event) {
            'saro_uploaded' => 'SARO Uploaded',
            'saro_replaced' => 'SARO Updated',
            'saro_deleted' => 'SARO Removed',
            default => 'SARO Updated',
        };

        $message = match ($event) {
            'saro_uploaded' => sprintf('A SARO file was uploaded for procurement %s.', $procurement->procurement_no),
            'saro_replaced' => sprintf('The SARO file was replaced for procurement %s.', $procurement->procurement_no),
            'saro_deleted' => sprintf('The SARO file was deleted for procurement %s.', $procurement->procurement_no),
            default => sprintf('SARO was updated for procurement %s.', $procurement->procurement_no),
        };

        Notification::create([
            'user_id' => $requester->id,
            'type' => $event,
            'title' => $title,
            'message' => $message,
            'data' => [
                'procurement_id' => $procurement->id,
                'procurement_no' => $procurement->procurement_no,
                'saro_id' => $saro?->id,
                'actor_user_id' => $actor->id,
            ],
        ]);

        $this->sendEmail($requester, $title, $message);
    }

    public function saroNotifyBudgetAdmins(Procurement $procurement, User $actor, string $event, ?Saro $saro): void
    {
        $recipients = User::query()
            ->where('id', '!=', $actor->id)
            ->where('is_active', true)
            ->where('is_authorized', true)
            ->where(function ($query): void {
                $query->whereIn('access_type', ['admin', 'budget_officer', 'budget officer', 'budget'])
                    ->orWhereHas('role', function ($roleQuery): void {
                        $roleQuery->whereRaw('LOWER(role_type) LIKE ?', ['%admin%'])
                            ->orWhereRaw('LOWER(role) LIKE ?', ['%admin%'])
                            ->orWhereRaw('LOWER(role_type) LIKE ?', ['%budget%'])
                            ->orWhereRaw('LOWER(role) LIKE ?', ['%budget%']);
                    });
            })
            ->get();

        if ($recipients->isEmpty()) {
            return;
        }

        $title = match ($event) {
            'saro_replaced' => 'SARO Replaced',
            'saro_deleted' => 'SARO Deleted',
            default => 'SARO Updated',
        };
        $message = match ($event) {
            'saro_replaced' => sprintf('SARO was replaced for procurement %s.', $procurement->procurement_no),
            'saro_deleted' => sprintf('SARO was deleted for procurement %s.', $procurement->procurement_no),
            default => sprintf('SARO was updated for procurement %s.', $procurement->procurement_no),
        };

        $now = now();
        $records = $recipients->map(function (User $recipient) use ($event, $title, $message, $procurement, $saro, $actor, $now): array {
            return [
                'user_id' => $recipient->id,
                'type' => $event,
                'title' => $title,
                'message' => $message,
                'data' => json_encode([
                    'procurement_id' => $procurement->id,
                    'procurement_no' => $procurement->procurement_no,
                    'saro_id' => $saro?->id,
                    'actor_user_id' => $actor->id,
                ], JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        })->all();

        Notification::insert($records);

        foreach ($recipients as $recipient) {
            $this->sendEmail($recipient, $title, $message);
        }
    }

    private function budgetOfficersOrAdmins(User $actor)
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

        if ($officers->isNotEmpty()) {
            return $officers;
        }

        return User::query()
            ->where('id', '!=', $actor->id)
            ->where('is_active', true)
            ->where('is_authorized', true)
            ->where('access_type', 'admin')
            ->get();
    }

    private function canReceive(User $user): bool
    {
        return (bool) ($user->is_active && $user->is_authorized && trim((string) $user->email) !== '');
    }

    private function sendEmail(User $recipient, string $subject, string $body): void
    {
        if (! $this->canReceive($recipient)) {
            return;
        }

        Mail::raw($body, function ($message) use ($recipient, $subject): void {
            $message->to($recipient->email)->subject($subject);
        });
    }
}
