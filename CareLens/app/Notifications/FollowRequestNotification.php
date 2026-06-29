<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class FollowRequestNotification extends Notification
{
    public string $patientName;

    public int $patientId;

    public ?string $patientPhoto;

    public function __construct(string $patientName, int $patientId, ?string $patientPhoto)
    {
        $this->patientName = $patientName;
        $this->patientId = $patientId;
        $this->patientPhoto = $patientPhoto;
    }

    /**
     * Delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Private channel the notification is broadcast on.
     * $notifiable = the Doctor user being notified.
     */

    /**
     * Data persisted to the notifications table.
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'patientId' => $this->patientId,
            'patientName' => $this->patientName,
            'patientPhoto' => $this->patientPhoto,
        ];
    }

    /**
     * Data sent over WebSocket.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        logger('toBroadcast called');
        logger(get_class($notifiable));

        return new BroadcastMessage(
            ['data' => [
                'patientId' => $this->patientId,
                'patientName' => $this->patientName,
                'patientPhoto' => $this->patientPhoto,
                'type' => 'FollowRequestNotification',

            ],
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
