<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;
    /**
     * Create a new policy instance.
     */
    public function updateCategory(User $authUser, User $user)
    {
        return $authUser->role === 'doctor' && $authUser->id === $user->id;
    }
}
