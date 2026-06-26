<?php

namespace App\Policies;

use App\Models\MedicalProfile;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MedicalProfilePolicy
{
    use HandlesAuthorization;

    public function view(User $user, MedicalProfile $medicalProfile): bool
    {
        return $medicalProfile->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->role === 'patient';
    }

    public function update(User $user, MedicalProfile $medicalProfile): bool
    {
        return $medicalProfile->user_id === $user->id;
    }
}
