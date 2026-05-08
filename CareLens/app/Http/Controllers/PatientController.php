<?php

namespace App\Http\Controllers;

use App\Models\MedicalProfile;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show( )
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,  )
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy( )
    {
        //
    }

    public function updateMedicalProfile(Request $request)
    {
        $request->validate([
            'age'=>'required',
            'gender'=>'required',
            'weight'=>'required',
            'height'=>'required',
            'chronic_diseases'=>'nullable',
            'allergies'=>'nullable',
            'current_medications'=>'nullable',
        ])
        MedicalProfile::updateOrCreate([

        ]);
        return response()->json([
            'we are in medical update'
        ]);
    }
}
