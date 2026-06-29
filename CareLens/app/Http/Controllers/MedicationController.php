<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MedicationController extends Controller
{
    /**
     * GET /api/medications
     * List all medications for the authenticated user.
     */
    public function index()
    {
        $medications = DB::table('medications')
            ->where('user_id', Auth::id())
            ->orderBy('schedule_time')
            ->get();

        return response()->json($medications);
    }

    /**
     * POST /api/medications
     * Add a new medication reminder.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:120',
            'dosage'        => 'required|string|max:80',
            'schedule_time' => 'required|date_format:H:i',
        ]);

        $id = DB::table('medications')->insertGetId([
            'user_id'       => Auth::id(),
            'medication_name' => $validated['name'],
            'dosage'        => $validated['dosage'],
            'schedule_time' => $validated['schedule_time'],
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        $medication = DB::table('medications')->where('id', $id)->first();

        return response()->json($medication, 201);
    }

    /**
     * PUT /api/medications/{id}
     * Update an existing medication reminder.
     */
    public function update(Request $request, $id)
    {
        $medication = DB::table('medications')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (! $medication) {
            return response()->json(['error' => 'Not found or unauthorised'], 404);
        }

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:120',
            'dosage'        => 'sometimes|required|string|max:80',
            'schedule_time' => 'sometimes|required|date_format:H:i',
        ]);

        $updateData = ['updated_at' => now()];
        if (isset($validated['name']))          $updateData['medication_name'] = $validated['name'];
        if (isset($validated['dosage']))        $updateData['dosage']        = $validated['dosage'];
        if (isset($validated['schedule_time'])) $updateData['schedule_time'] = $validated['schedule_time'];

        DB::table('medications')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->update($updateData);

        $updated = DB::table('medications')->where('id', $id)->first();

        return response()->json($updated);
    }

    /**
     * DELETE /api/medications/{id}
     * Delete a medication reminder.
     */
    public function destroy($id)
    {
        $deleted = DB::table('medications')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->delete();

        if (! $deleted) {
            return response()->json(['error' => 'Not found or unauthorised'], 404);
        }

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * GET /api/dashboard/overview
     * Returns a summary for the patient dashboard.
     */
    public function dashboardOverview()
    {
        $userId = Auth::id();

        $medicationsToday = DB::table('medications')
            ->where('user_id', $userId)
            ->orderBy('schedule_time')
            ->get()
            ->map(function ($m) {
                return [
                    'id'            => $m->id,
                    'name'          => $m->medication_name,
                    'dosage'        => $m->dosage,
                    'time'          => $m->schedule_time,
                    'schedule_time' => $m->schedule_time,
                    'status'        => 'Active',
                ];
            });

        $recentSymptomLog = DB::table('symptom_logs')
            ->where('user_id', $userId)
            ->orderByDesc('logged_at')
            ->first();

        return response()->json([
            'medicationsToday' => $medicationsToday,
            'recentSymptomLog' => $recentSymptomLog,
            'lastChat'         => null,
        ]);
    }
}
