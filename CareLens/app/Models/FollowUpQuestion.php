<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FollowUpQuestion extends Model
{
    protected $guarded = [];

    protected $table = 'follow_up_questions';

    public function plan()
    {
        return $this->belongsTo(TreatmentPlan::class, 'plan_id');
    }
}
