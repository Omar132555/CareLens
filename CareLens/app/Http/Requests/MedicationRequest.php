<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MedicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'medication_name' => 'required|string|max:255',
            'dosage' => 'required|string|max:255',
            'schedule_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ];
    }
}
// Modified by Mahmoud Rafat
// Created MedicationRequest with validation rules for medication fields
