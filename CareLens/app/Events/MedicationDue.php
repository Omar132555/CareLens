<?php
// app/Events/MedicationDue.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MedicationDue implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int    $userId,
        public string $medName,
        public string $dosage,
        public int    $medId,
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel("medications.{$this->userId}");
    }

    public function broadcastAs(): string
    {
        return 'medication.due';
    }

    public function broadcastWith(): array
    {
        return [
            'medId'   => $this->medId,
            'medName' => $this->medName,
            'dosage'  => $this->dosage,
        ];
    }
}