<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleSave extends Model
{
    protected $guarded = [];
    public $timestamps = false;

    protected $table = 'article_saves';

    public function article()
    {
        return $this->belongsTo(Article::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
