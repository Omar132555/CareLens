<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanMedication extends Model
{
    protected $guarded = [];

    protected $table = 'plan_medications';

    public function plan()
    {
        return $this->belongsTo(TreatmentPlan::class, 'plan_id');
    }
}
