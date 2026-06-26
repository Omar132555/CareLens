<?php

namespace App\Http\Controllers;

use App\Models\MedicalProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patients = User::where('role','=','patient')->get();
        
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

    public function getMedicalProfile()
    {
        $medicalProfile = MedicalProfile::where('user_id', Auth::id())->first();

        if (! $medicalProfile) {
            return response()->json([false]);
        }

        $this->authorize('view', $medicalProfile);

        return response()->json($medicalProfile);
    }

    public function updateMedicalProfile(Request $request)
    {
        $request->validate([
            'age' => 'required|integer',
            'gender' => 'required|in:male,female',
            'weight' => 'required|numeric',
            'height' => 'required|numeric',
            'chronic_diseases' => 'nullable',
            'allergies' => 'nullable',
            'current_medications' => 'nullable',
        ]);

        $medicalProfile = MedicalProfile::where('user_id', Auth::id())->first();

        if ($medicalProfile) {
            $this->authorize('update', $medicalProfile);
        } else {
            $this->authorize('create', MedicalProfile::class);
            $medicalProfile = new MedicalProfile(['user_id' => Auth::id()]);
        }

        $medicalProfile->fill($request->only([
            'age',
            'gender',
            'weight',
            'height',
            'chronic_diseases',
            'allergies',
            'current_medications',
        ]));
        $medicalProfile->save();

        return response()->json([
            'status' => true,
            'medical_profile' => $medicalProfile,
        ]);
    }
}
