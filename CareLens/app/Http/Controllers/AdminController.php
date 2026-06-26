<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    /* ─────────────────────────────────────────────────────────
     |  DASHBOARD STATS
     ──────────────────────────────────────────────────────── */

    public function dashboardStats()
    {
        return response()->json([
            'total_users'               => User::count(),
            'total_doctors'             => User::where('role', 'doctor')->count(),
            'total_patients'            => User::where('role', 'patient')->count(),
            'total_articles'            => Article::count(),
            'total_treatment_plans'     => TreatmentPlan::count(),
            'pending_verifications'     => User::where('role', 'doctor')
                                              ->where('verification_status', 'pending')
                                              ->count(),
            'approved_verifications'    => User::where('role', 'doctor')
                                              ->where('verification_status', 'approved')
                                              ->count(),
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     |  USER MANAGEMENT
     ──────────────────────────────────────────────────────── */

    public function users(Request $request)
    {
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($users);
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate(['role' => 'required|in:patient,doctor,admin']);

        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Cannot change your own role.'], 403);
        }

        $user->update(['role' => $request->role]);

        return response()->json(['message' => 'Role updated.', 'user' => $user]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Cannot delete yourself.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }

    /* ─────────────────────────────────────────────────────────
     |  VERIFICATION MANAGEMENT
     ──────────────────────────────────────────────────────── */

    public function verificationRequests(Request $request)
    {
        $status = $request->get('status', 'pending');

        $doctors = User::where('role', 'doctor')
            ->where('verification_status', $status)
            ->select(['id', 'name', 'email', 'profile_photo', 'verification_status', 'verification_requested_at', 'verification_reviewed_at', 'verification_notes', 'category_id'])
            ->with('category:id,name')
            ->orderByDesc('verification_requested_at')
            ->get();

        return response()->json($doctors);
    }

    public function approveVerification($id)
    {
        $doctor = User::where('role', 'doctor')->findOrFail($id);

        $doctor->update([
            'verification_status'      => 'approved',
            'verification_reviewed_at' => now(),
            'verification_notes'       => null,
        ]);

        // Notify doctor via email
        try {
            Mail::raw(
                "Dear Dr. {$doctor->name},\n\nCongratulations! Your CareLens verification request has been approved.\n\nYou can now access all verified doctor features on CareLens.\n\nBest regards,\nThe CareLens Team",
                function ($message) use ($doctor) {
                    $message->to($doctor->email)
                            ->subject('CareLens — Verification Approved ✅');
                }
            );
        } catch (\Exception $e) {
            // Mail failure shouldn't break the response
        }

        return response()->json(['message' => 'Verification approved.', 'doctor' => $doctor]);
    }

    public function rejectVerification(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $doctor = User::where('role', 'doctor')->findOrFail($id);

        $doctor->update([
            'verification_status'      => 'rejected',
            'verification_reviewed_at' => now(),
            'verification_notes'       => $request->reason,
        ]);

        // Notify doctor via email
        try {
            Mail::raw(
                "Dear Dr. {$doctor->name},\n\nWe have reviewed your CareLens verification request.\n\nUnfortunately, your request was not approved at this time.\n\nReason: {$request->reason}\n\nYou may re-submit your request after addressing the above.\n\nBest regards,\nThe CareLens Team",
                function ($message) use ($doctor) {
                    $message->to($doctor->email)
                            ->subject('CareLens — Verification Update');
                }
            );
        } catch (\Exception $e) {
            // Mail failure shouldn't break the response
        }

        return response()->json(['message' => 'Verification rejected.', 'doctor' => $doctor]);
    }

    /* ─────────────────────────────────────────────────────────
     |  ARTICLES OVERVIEW
     ──────────────────────────────────────────────────────── */

    public function articles(Request $request)
    {
        $articles = Article::with('doctor:id,name')
            ->withCount(['likes', 'comments', 'saves'])
            ->orderByDesc('published_at')
            ->paginate(20);

        return response()->json($articles);
    }

    public function deleteArticle($id)
    {
        $article = Article::findOrFail($id);
        $article->delete();

        return response()->json(['message' => 'Article removed.']);
    }
}
