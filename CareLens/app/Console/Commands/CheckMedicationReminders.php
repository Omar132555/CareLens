<?php
// app/Console/Commands/CheckMedicationReminders.php

namespace App\Console\Commands;

use App\Events\MedicationDue;
use App\Models\User;
use App\Notifications\MedicationReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckMedicationReminders extends Command
{
    protected $signature   = 'medications:check';
    protected $description = 'Check medications due at the current minute and broadcast reminders';

    public function handle(): void
    {
        $now = now()->format('H:i');

        $medications = DB::table('medications')
            ->where('schedule_time', $now)
            ->get();
        if ($medications->isEmpty()) {
            $this->info("No medications due at {$now}");
            return;
        }

        foreach ($medications as $med) {
            broadcast(new MedicationDue(
                userId:  $med->user_id,
                medName: $med->medication_name,
                dosage:  $med->dosage,
                medId:   $med->id,
            ));
            $user = User::find($med->user_id);
            $user->notify(new MedicationReminderNotification($med->medication_name, $med->dosage, $med->schedule_time));
            $this->info("Reminder sent → user {$med->user_id} | {$med->medication_name}");
        }
    }
}