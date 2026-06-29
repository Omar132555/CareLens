<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MedicationReminderNotification extends Notification
{
    use Queueable;

    public $medicationName;
    public $dose;
    public $time;

    public function __construct($medicationName, $dose, $time)
    {
        $this->medicationName = $medicationName;
        $this->dose = $dose;
        $this->time = $time;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDataBase(object $notifiable): array
    {
        return [
            'type' => 'medication_reminder',
            'medName' => $this->medicationName,
            'dosage' => $this->dose,
            'time' => $this->time,
            'message' => "Time to take {$this->medicationName}",
        ];
    }
}