<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $guarded = [];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'verification_requested_at' => 'datetime',
            'verification_reviewed_at' => 'datetime',
        ];
    }

    /* ─── Role helpers ─────────────────────────────── */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isDoctor(): bool
    {
        return $this->role === 'doctor';
    }

    public function isPatient(): bool
    {
        return $this->role === 'patient';
    }

    /* ─── Verification helpers ─────────────────────── */
    public function isVerified(): bool
    {
        return $this->verification_status === 'approved';
    }

    public function hasPendingVerification(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function doctorFollowRequest()
    {
        return $this->belongsToMany(
            User::class,
            'follow_requests',
            'patient_id',
            'doctor_id'
        );
    }
}
