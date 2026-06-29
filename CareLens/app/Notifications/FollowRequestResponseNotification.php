<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class FollowRequestResponseNotification extends Notification
{
    public string $doctorName;

    public int $doctorId;

    public string $action; // 'approved' or 'declined'

    public function __construct(string $doctorName, int $doctorId, string $action)
    {
        $this->doctorName = $doctorName;
        $this->doctorId = $doctorId;
        $this->action = $action;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function broadcastType(): string
    {
        return 'Illuminate\Notifications\Events\BroadcastNotificationCreated';
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'doctorId' => $this->doctorId,
            'doctorName' => $this->doctorName,
            'action' => $this->action,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'data' => [
                'doctorId' => $this->doctorId,
                'doctorName' => $this->doctorName,
                'action' => $this->action,
                'type' => 'FollowRequestResponseNotification'
            ],
        ]
        );
    }

    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
