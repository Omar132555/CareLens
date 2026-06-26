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
        return $this->belongsToMany(
            User::class,
            'doctor_patient',
            'patient_id',
            'doctor_id'
        );
    }

    public function savedArticles()
    {
        return $this->belongsToMany(Article::class, 'article_saves');
    }

    public function medicalProfile()
    {
        return $this->hasOne(MedicalProfile::class, 'user_id');
    }

    public function treatmentPlans()
    {
        return $this->hasMany(TreatmentPlan::class, 'patient_id');
    }

    public function dailyLogs()
    {
        return $this->hasMany(PatientDailyLog::class, 'patient_id');
    }

}
