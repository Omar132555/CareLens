<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $guarded = [];
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function likes()
    {
        return $this->hasMany(ArticleLike::class);
    }

    public function comments()
    {
        return $this->hasMany(ArticleComment::class);
    }

    public function savedByPatient()
    {
        return $this->belongsToMany(Patient::class, 'article_saves');
    }
}
