<?php

namespace App\Policies;

use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TreatmentPlanPolicy
{
    use HandlesAuthorization;

    /** Any logged-in user can view a plan (controller refines) */
    public function view(User $user, TreatmentPlan $plan): bool
    {
        // Doctor sees own plans; patient sees plans assigned to them
        if ($user->role === 'doctor') {
            return $plan->doctor_id === $user->id;
        }
        if ($user->role === 'patient') {
            return $plan->patient_id === $user->id;
        }
        return false;
    }

    /** Only the doctor who created the plan can update it */
    public function update(User $user, TreatmentPlan $plan): bool
    {
        return $user->role === 'doctor' && $plan->doctor_id === $user->id;
    }

    /** Only the doctor who created the plan can delete it */
    public function delete(User $user, TreatmentPlan $plan): bool
    {
        return $user->role === 'doctor' && $plan->doctor_id === $user->id;
    }

    /** Only the assigned patient can submit a daily log */
    public function log(User $user, TreatmentPlan $plan): bool
    {
        return $user->role === 'patient' && $plan->patient_id === $user->id;
    }
}
