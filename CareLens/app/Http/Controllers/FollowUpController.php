<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Notifications\FollowRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class FollowUpController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function toggleRequest(Request $request)
    {
        $doctor = Doctor::find($request->doctor_id);
        // if($doctor)
        // {
        //     Auth::user()->doctorFollowRequest()->toggle($doctor->id);
        //     $doctor->notify(new FollowRequest())
        // }
        $result = Auth::user()->doctorFollowRequest()->toggle($doctor->id);
        $cacheKey = 'follow'.md5($request->doctor_id);
        $follow_button_clicked = Cache::get($cacheKey, false);

        if (! $follow_button_clicked) {

            if ($result['attached'][0] == $doctor->id) {
                Cache::put($cacheKey, true, 60 * 2);

                return response()->json([
                    'status' => 'sent',
                ]);
            } else {
                Cache::put($cacheKey, true, 60 * 2);

                return response()->json([
                    'status' => 'denied',
                ]);
            }
        } else {
            return response()->json([
                'status' => 'please wait two minutes before trying again',
            ]);
        }
        // find the doctor with id
        // toggle the request
        // notify the doctor
        // cache
        // save the patient sender id
    }

    /**
     * Store a newly created resource in storage.
     */
    public function approveRequest(Request $request)
    {
        // retrieve the request id with the related patient id
        // toggle follow between doctor patient
        // notify the patient with the approve
    }

    /**
     * Display the specified resource.
     */
    public function cancelRequest(Request $request)
    {
        $doctor = Doctor::find($request->doctor_id);
        if ($doctor) {
            Auth::user()->doctorFollowRequest()->toggle($doctor->id);
        }
        // remove the request from database
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
