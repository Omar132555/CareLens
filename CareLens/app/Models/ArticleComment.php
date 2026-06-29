<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleComment extends Model
{
    protected $guarded = [];
    public $timestamps = false;

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

        public function user()
    {
        return $this->belongsTo(User::class);
    }
}
