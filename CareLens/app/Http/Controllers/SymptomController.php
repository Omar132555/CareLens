<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SymptomController extends Controller
{
    /**
     * GET /api/symptoms/logs
     * Returns all symptom logs for the authenticated patient.
     */
    public function index()
    {
        $logs = DB::table('symptom_logs')
            ->where('user_id', Auth::id())
            ->orderByDesc('logged_at')
            ->get();

        return response()->json($logs);
    }

    /**
     * POST /api/symptoms/log
     * Log a new symptom entry with a severity score (1–10).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'symptom_name' => 'required|string|max:120',
            'severity'     => 'required|integer|min:1|max:10',
            'logged_at'    => 'nullable|date',
        ]);

        $id = DB::table('symptom_logs')->insertGetId([
            'user_id'      => Auth::id(),
            'symptom_name' => $validated['symptom_name'],
            'severity'     => $validated['severity'],
            'logged_at'    => $validated['logged_at'] ?? now(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        $log = DB::table('symptom_logs')->where('id', $id)->first();

        return response()->json($log, 201);
    }

    /**
     * DELETE /api/symptoms/logs/{id}
     * Delete a specific symptom log belonging to the authenticated user.
     */
    public function destroy($id)
    {
        $deleted = DB::table('symptom_logs')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->delete();

        if (! $deleted) {
            return response()->json(['error' => 'Not found or unauthorised'], 404);
        }

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * GET /api/symptoms/logs/chart
     * Returns data grouped by date for charting.
     */
    public function chart()
    {
        $logs = DB::table('symptom_logs')
            ->where('user_id', Auth::id())
            ->orderBy('logged_at')
            ->get(['symptom_name', 'severity', 'logged_at']);

        return response()->json($logs);
    }
}
