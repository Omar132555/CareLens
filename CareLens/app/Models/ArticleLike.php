<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleLike extends Model
{
    protected $guarded = [];
    public function article()
    {
        return $this->belongsTo(Article::class);
    }
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
