<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientDailyLog extends Model
{
    protected $guarded = [];

    protected $table = 'patient_daily_logs';

    protected $casts = [
        'took_medication' => 'boolean',
        'logged_at'       => 'datetime',
    ];

    public function plan()
    {
        return $this->belongsTo(TreatmentPlan::class, 'plan_id');
    }

    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
