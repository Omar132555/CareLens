<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $patientId = Auth::id();

        $query = Doctor::query()
            ->select('users.*')
            ->addSelect([
                'follow_state' => DB::table('follow_requests')
                    ->select('status')
                    ->whereColumn('doctor_id', 'users.id')
                    ->where('patient_id', $patientId)
                    ->limit(1),
            ])
            ->with('category');

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $doctors = $query->get();

        return response()->json($doctors);
    }

    public function store(Request $request) {}

    public function show(string $id) {}

    public function update(Request $request, string $id) {}

    public function destroy(string $id) {}

    /* ─── Category ─────────────────────────────────────────── */

    public function updateCategory(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
        ]);
        $this->authorize('updateCategory', Auth::user());
        $result = Auth::user()->update([
            'category_id' => $request->category_id,
        ]);

        return response()->json($result);
    }

    /* ─── Verification ─────────────────────────────────────── */

    /**
     * GET /api/doctor/verification/status
     */
    public function getVerificationStatus()
    {
        $user = Auth::user();

        return response()->json([
            'verification_status' => $user->verification_status,
            'verification_requested_at' => $user->verification_requested_at,
            'verification_reviewed_at' => $user->verification_reviewed_at,
            'verification_notes' => $user->verification_notes,
        ]);
    }

    /**
     * POST /api/doctor/verification/request
     */
    public function requestVerification()
    {
        $user = Auth::user();

        if ($user->verification_status === 'approved') {
            return response()->json(['message' => 'Already verified.'], 422);
        }

        if ($user->verification_status === 'pending') {
            return response()->json(['message' => 'Verification already pending.'], 422);
        }

        $user->update([
            'verification_status' => 'pending',
            'verification_requested_at' => now(),
            'verification_reviewed_at' => null,
            'verification_notes' => null,
        ]);

        // Notify admins via email
        try {
            $adminEmails = User::where('role', 'admin')->pluck('email');
            foreach ($adminEmails as $email) {
                Mail::raw(
                    "A verification request has been submitted by Dr. {$user->name} ({$user->email}).\n\nPlease log in to the CareLens Admin Dashboard to review and approve or reject this request.\n\nCareLens System",
                    function ($message) use ($email, $user) {
                        $message->to($email)
                            ->subject("CareLens — New Doctor Verification Request from Dr. {$user->name}");
                    }
                );
            }
        } catch (\Exception $e) {
            // Mail failure is non-blocking
        }

        return response()->json([
            'message' => 'Verification request submitted. Admins have been notified.',
            'verification_status' => 'pending',
        ]);
    }

    /**
     * DELETE /api/doctor/verification/cancel
     */
    public function cancelVerification()
    {
        $user = Auth::user();

        if ($user->verification_status !== 'pending') {
            return response()->json(['message' => 'No pending verification to cancel.'], 422);
        }

        $user->update([
            'verification_status' => 'none',
            'verification_requested_at' => null,
        ]);

        return response()->json(['message' => 'Verification request cancelled.']);
    }

    /**
     * GET /api/doctor/patients
     * Returns a list of patients currently associated with the doctor via doctor_patient pivot table
     */
    public function myPatients()
    {
        $doctor = \App\Models\Doctor::find(Auth::id());
        if (!$doctor) {
            return response()->json(['error' => 'Doctor not found'], 404);
        }

        $patients = $doctor->patients()->select('users.id', 'users.name', 'users.email', 'users.profile_photo')->get();

        return response()->json($patients);
    }
}

// عايز اقول لو الدكتور الحالي في الكويري معموله متابعه من المريض الحالي

// take the id param of the doctor requested from the request
// send the request to the doctor if accepted toggle the follow
