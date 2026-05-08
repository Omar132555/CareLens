<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'medication_name' => $this->medication_name,
            'dosage' => $this->dosage,
            'schedule_time' => $this->schedule_time,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
// Modified by Mahmoud Rafat
// Created MedicationResource to format medication data for JSON API responses
