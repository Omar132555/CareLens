<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TreatmentPlan extends Model
{
    protected $guarded = [];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function medications()
    {
        return $this->hasMany(PlanMedication::class, 'plan_id');
    }

    public function followUpQuestions()
    {
        return $this->hasMany(FollowUpQuestion::class, 'plan_id');
    }

    public function dailyLogs()
    {
        return $this->hasMany(PatientDailyLog::class, 'plan_id');
    }

    public function adherencePercentage(): float
    {
        $total = $this->dailyLogs()->count();
        if ($total === 0) return 0;
        $taken = $this->dailyLogs()->where('took_medication', true)->count();
        return round(($taken / $total) * 100, 1);
    }
}
