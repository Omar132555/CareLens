<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleComment extends Model
{
    protected $guarded = [];
    public function article()
    {
        return $this->belongsTo(Article::class);
    }
}
