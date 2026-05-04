<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    protected $guarded = [];

    protected $table = 'users';

    protected static function booted()
    {
        static::addGlobalScope('doctor', function($query){
            $query->where('role', 'doctor');
        });
    }

    public function articles()
    {
        return $this->hasMany(Article::class);
    }
}
