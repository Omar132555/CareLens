<?php

namespace App\Models;

class Patient extends User
{
    protected $guarded = [];

    protected $table = 'users';

    protected static function booted()
    {
        static::addGlobalScope('patient', function ($query) {
            $query->where('role', 'patient');
        });
    }

    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }

    public function savedArticles()
    {
        return $this->belongsToMany(Article::class, 'articles_saves');
    }

    public function medicalProfile()
    {
        return $this->hasOne(MedicalProfile::class, 'user_id');
    }
}
