<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ArticlePolicy
{
    use HandlesAuthorization;

    /** Anyone authenticated can view articles */
    public function view(User $user, Article $article): bool
    {
        return true;
    }

    /** Only doctors can create articles */
    public function create(User $user): bool
    {
        return $user->role === 'doctor';
    }

    /** Only the doctor who wrote the article can update it */
    public function update(User $user, Article $article): bool
    {
        return $user->role === 'doctor' && $article->doctor_id === $user->id;
    }

    /** Only the doctor who wrote the article can delete it */
    public function delete(User $user, Article $article): bool
    {
        return $user->role === 'doctor' && $article->doctor_id === $user->id;
    }
}
