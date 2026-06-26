<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $guarded = [];

    protected $appends = ['is_liked', 'is_saved'];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function likes()
    {
        return $this->hasMany(ArticleLike::class);
    }

    public function comments()
    {
        return $this->hasMany(ArticleComment::class);
    }

    public function saves()
    {
        return $this->hasMany(ArticleSave::class);
    }

    public function savedByPatient()
    {
        return $this->belongsToMany(User::class, 'article_saves', 'article_id', 'user_id');
    }

    /* ─── Computed attributes (require auth user in scope) ─── */
    public function getIsLikedAttribute(): bool
    {
        $userId = auth()->id();
        if (!$userId) return false;
        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function getIsSavedAttribute(): bool
    {
        $userId = auth()->id();
        if (!$userId) return false;
        return $this->saves()->where('user_id', $userId)->exists();
    }
}
