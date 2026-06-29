<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Notifications\FollowRequestNotification;
use App\Notifications\FollowRequestResponseNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class FollowUpController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function toggleRequest(Request $request)
    {
        $doctor = Doctor::find($request->doctor_id);
        $doctor_userModel = User::find($doctor->id);
        if (! $doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        $user = Auth::user();

        $existing = DB::table('follow_requests')
            ->where('doctor_id', $doctor->id)
            ->where('patient_id', $user->id)
            ->first();
        // CASE 1: request exists → cancel or unfollow
        if ($existing) {

            DB::table('follow_requests')
                ->where('doctor_id', $doctor->id)
                ->where('patient_id', $user->id)
                ->delete();

            // also detach from pivot in case it was accepted
            $doctor->patients()->detach($user->id);

            // delete notification
            $doctor_userModel->notifications()
                ->where('type', FollowRequestNotification::class)
                ->where('data->patientId', $user->id)
                ->delete();

            return response()->json([
                'status' => $existing->status === 'approved' ? 'removed' : 'cancelled',
            ]);
        }

        // CASE 2: no request → create it
        DB::table('follow_requests')->insert([
            'doctor_id' => $doctor->id,
            'patient_id' => $user->id,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        logger(get_class($doctor_userModel));
        $doctor_userModel->notify(new FollowRequestNotification(
            $user->name,
            $user->id,
            $user->profile_photo
        ));

        return response()->json([
            'status' => 'sent',
        ]);
        // find the doctor with id
        // toggle the request
        // notify the doctor
        // cache
        // save the patient sender id
    }

    /**
     * Store a newly created resource in storage.
     */
    public function approveRequest(Request $request)    // doctor use
    {
        $doctor = Doctor::find(Auth::id());
        if (! $doctor) {
            return response()->json(['Not Found'], 404);
        }
        $followRequest = DB::table('follow_requests')->where('patient_id', '=', $request->patientId)->where('doctor_id', '=', $doctor->id)->first();

        if ($followRequest && $followRequest->status == 'pending') {

            $doctor->patients()->syncWithoutDetaching($request->patientId);
            DB::table('follow_requests')
                ->where('doctor_id', $doctor->id)
                ->where('patient_id', $request->patientId)
                ->update([
                    'status' => 'approved',
                ]);

            // Delete the pending notification for the doctor
            $doctor->notifications()
                ->where('type', FollowRequestNotification::class)
                ->where('data->patientId', $request->patientId)
                ->delete();

            // Notify the patient
            $patient = User::find($request->patientId);
            if ($patient) {
                $patient->notify(new FollowRequestResponseNotification($doctor->name, $doctor->id, 'approved'));
            }

            return response()->json([
                'status' => 'approved',
            ]);
        } else {
            return response()->json([
                'status' => 'invalid request',
            ], 400);
        }
    }

    /**
     * Display the specified resource.
     */
    public function removeFollow(Request $request)
    {
        $user = Auth::user();

        if ($user->role === 'doctor') {
            $doctorId = $user->id;
            $patientId = $request->patientId;
            $isDeny = true; // Doctor is removing/denying
        } else {
            $patientId = $user->id;
            $doctorId = $request->doctor_id;
            $isDeny = false; // Patient is removing/canceling
        }

        if (!$doctorId || !$patientId) {
            return response()->json(['error' => 'Invalid parameters'], 400);
        }

        // Check if there was a pending request before deleting
        $wasPending = DB::table('follow_requests')
            ->where('doctor_id', $doctorId)
            ->where('patient_id', $patientId)
            ->where('status', 'pending')
            ->exists();

        // Delete the follow request
        DB::table('follow_requests')
            ->where('doctor_id', $doctorId)
            ->where('patient_id', $patientId)
            ->delete();

        // Detach from pivot table
        $doctor = Doctor::find($doctorId);
        if ($doctor) {
            $doctor->patients()->detach($patientId);
            
            // Delete the pending notification for the doctor
            $doctor->notifications()
                ->where('type', FollowRequestNotification::class)
                ->where('data->patientId', $patientId)
                ->delete();

            // Notify patient if the doctor explicitly denied a pending request
            if ($isDeny && $wasPending) {
                $patient = User::find($patientId);
                if ($patient) {
                    $patient->notify(new FollowRequestResponseNotification($doctor->name, $doctor->id, 'declined'));
                }
            }
        }

        return response()->json([
            'status' => 'removed',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    // one for sending the request
    // one for approve the request
}
