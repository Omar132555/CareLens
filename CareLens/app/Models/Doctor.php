<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Doctor extends Model
{
    use Notifiable;
    protected $guarded = [];

    protected $table = 'users';

    protected static function booted()
    {
        static::addGlobalScope('doctor', function ($query) {
            $query->where('role', 'doctor');
        });
    }

    public function articles()
    {
        return $this->hasMany(Article::class, 'doctor_id');
    }

    public function treatmentPlans()
    {
        return $this->hasMany(TreatmentPlan::class, 'doctor_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function patients()
    {
        return $this->belongsToMany(
            User::class,
            'doctor_patient',
            'doctor_id',
            'patient_id'
        );
    }
}
