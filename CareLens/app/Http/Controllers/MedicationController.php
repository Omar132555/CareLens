<?php

namespace App\Http\Controllers;

use App\Http\Requests\MedicationRequest;
use App\Http\Resources\MedicationResource;
use App\Models\Medication;
use Illuminate\Http\Request;

class MedicationController extends Controller
{
    public function index()
    {
        $medications = auth()->user()->medications;
        return MedicationResource::collection($medications);
    }

    public function store(MedicationRequest $request)
    {
        $medication = auth()->user()->medications()->create($request->validated());
        return new MedicationResource($medication);
    }

    public function show(Medication $medication)
    {
        $this->authorize('view', $medication);
        return new MedicationResource($medication);
    }

    public function update(MedicationRequest $request, Medication $medication)
    {
        $this->authorize('update', $medication);
        $medication->update($request->validated());
        return new MedicationResource($medication);
    }

    public function destroy(Medication $medication)
    {
        $this->authorize('delete', $medication);
        $medication->delete();
        return response()->json(['message' => 'Medication deleted']);
    }
}
// Modified by Mahmoud Rafat
// Created MedicationController with CRUD operations, using policy for authorization and resources for JSON responses
