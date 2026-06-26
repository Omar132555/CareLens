<?php

namespace App\Http\Controllers;

use App\Models\FollowUpQuestion;
use App\Models\PatientDailyLog;
use App\Models\PlanMedication;
use App\Models\TreatmentPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TreatmentPlanController extends Controller
{
    /* ─────────────────────────────────────────────────────────
     |  SHARED
     ──────────────────────────────────────────────────────── */

    /**
     * GET /api/treatment-plans
     * Doctor  → own plans (with patient, medications, log counts)
     * Patient → plans assigned to them
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'doctor') {
            $plans = TreatmentPlan::where('doctor_id', $user->id)
                ->with([
                    'patient:id,name,email,profile_photo',
                    'medications',
                    'followUpQuestions',
                ])
                ->withCount('dailyLogs')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn($p) => $this->formatPlan($p));

            return response()->json($plans);
        }

        // Patient
        $plans = TreatmentPlan::where('patient_id', $user->id)
            ->with([
                'doctor:id,name,profile_photo',
                'medications',
                'followUpQuestions',
            ])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => $this->formatPlan($p));

        return response()->json($plans);
    }

    /**
     * GET /api/treatment-plans/{id}
     */
    public function show($id)
    {
        $user = Auth::user();
        $plan = TreatmentPlan::with(['doctor:id,name,profile_photo', 'patient:id,name,email,profile_photo', 'medications', 'followUpQuestions'])
            ->findOrFail($id);

        $this->authorizeAccess($plan, $user);

        return response()->json($this->formatPlan($plan));
    }

    /* ─────────────────────────────────────────────────────────
     |  DOCTOR-ONLY
     ──────────────────────────────────────────────────────── */

    /**
     * POST /api/treatment-plans
     */
    public function store(Request $request)
    {
        $request->validate([
            'title'               => 'required|string|max:255',
            'instructions'        => 'required|string',
            'patient_email'       => 'required|email|exists:users,email',
            'start_date'          => 'required|date',
            'end_date'            => 'nullable|date|after:start_date',
            'status'              => 'sometimes|string',
            'medications'         => 'nullable|array',
            'medications.*.name'     => 'required_with:medications|string',
            'medications.*.dosage'   => 'required_with:medications|string',
            'medications.*.timing'   => 'nullable|string',
            'medications.*.instructions' => 'nullable|string',
            'follow_up_questions' => 'nullable|array',
            'follow_up_questions.*.question' => 'required_with:follow_up_questions|string',
        ]);

        $patient = User::where('email', $request->patient_email)->where('role', 'patient')->firstOrFail();

        $plan = TreatmentPlan::create([
            'doctor_id'    => Auth::id(),
            'patient_id'   => $patient->id,
            'title'        => $request->title,
            'instructions' => $request->instructions,
            'start_date'   => $request->start_date,
            'end_date'     => $request->end_date,
            'status'       => $request->status ?? 'active',
        ]);

        // Medications
        if ($request->filled('medications')) {
            foreach ($request->medications as $med) {
                PlanMedication::create([
                    'plan_id'      => $plan->id,
                    'name'         => $med['name'],
                    'dosage'       => $med['dosage'],
                    'timing'       => $med['timing'] ?? null,
                    'instructions' => $med['instructions'] ?? null,
                ]);
            }
        }

        // Follow-up questions
        if ($request->filled('follow_up_questions')) {
            foreach ($request->follow_up_questions as $q) {
                FollowUpQuestion::create([
                    'plan_id'  => $plan->id,
                    'question' => $q['question'],
                ]);
            }
        }

        $plan->load(['medications', 'followUpQuestions', 'patient:id,name,email']);

        return response()->json($this->formatPlan($plan), 201);
    }

    /**
     * PUT /api/treatment-plans/{id}
     */
    public function update(Request $request, $id)
    {
        $plan = TreatmentPlan::where('doctor_id', Auth::id())->findOrFail($id);

        $request->validate([
            'title'        => 'sometimes|required|string|max:255',
            'instructions' => 'sometimes|required|string',
            'start_date'   => 'sometimes|required|date',
            'end_date'     => 'nullable|date',
            'status'       => 'sometimes|string',
        ]);

        $plan->update($request->only(['title', 'instructions', 'start_date', 'end_date', 'status']));

        // Re-sync medications if provided
        if ($request->has('medications')) {
            $plan->medications()->delete();
            foreach ($request->medications as $med) {
                PlanMedication::create([
                    'plan_id'      => $plan->id,
                    'name'         => $med['name'],
                    'dosage'       => $med['dosage'],
                    'timing'       => $med['timing'] ?? null,
                    'instructions' => $med['instructions'] ?? null,
                ]);
            }
        }

        // Re-sync follow-up questions if provided
        if ($request->has('follow_up_questions')) {
            $plan->followUpQuestions()->delete();
            foreach ($request->follow_up_questions as $q) {
                FollowUpQuestion::create([
                    'plan_id'  => $plan->id,
                    'question' => $q['question'],
                ]);
            }
        }

        $plan->load(['medications', 'followUpQuestions', 'patient:id,name,email']);

        return response()->json($this->formatPlan($plan));
    }

    /**
     * DELETE /api/treatment-plans/{id}
     */
    public function destroy($id)
    {
        $plan = TreatmentPlan::where('doctor_id', Auth::id())->findOrFail($id);
        $plan->delete();

        return response()->json(['message' => 'Treatment plan deleted.']);
    }

    /**
     * GET /api/treatment-plans/{id}/logs  — doctor views patient logs
     */
    public function logs($id)
    {
        $plan = TreatmentPlan::where('doctor_id', Auth::id())
            ->with('patient:id,name')
            ->findOrFail($id);

        $logs = PatientDailyLog::where('plan_id', $id)
            ->orderByDesc('logged_at')
            ->get();

        $total    = $logs->count();
        $taken    = $logs->where('took_medication', true)->count();
        $adherence = $total > 0 ? round(($taken / $total) * 100, 1) : 0;

        return response()->json([
            'plan'             => $this->formatPlan($plan),
            'logs'             => $logs,
            'total_logs'       => $total,
            'adherence_percent' => $adherence,
        ]);
    }

    /**
     * POST /api/treatment-plans/{id}/feedback  — doctor sends feedback on a log
     */
    public function feedback(Request $request, $id)
    {
        $request->validate([
            'log_id'   => 'required|exists:patient_daily_logs,id',
            'feedback' => 'required|string|max:1000',
        ]);

        TreatmentPlan::where('doctor_id', Auth::id())->findOrFail($id);

        $log = PatientDailyLog::where('plan_id', $id)->findOrFail($request->log_id);
        $log->update(['doctor_feedback' => $request->feedback]);

        return response()->json(['message' => 'Feedback saved.', 'log' => $log]);
    }

    /* ─────────────────────────────────────────────────────────
     |  PATIENT-ONLY
     ──────────────────────────────────────────────────────── */

    /**
     * POST /api/treatment-plans/{id}/log
     */
    public function log(Request $request, $id)
    {
        $request->validate([
            'compliance'    => 'required|in:yes,partial,no',
            'symptom_score' => 'nullable|integer|min:1|max:10',
            'notes'         => 'nullable|string|max:2000',
        ]);

        $plan = TreatmentPlan::where('patient_id', Auth::id())->findOrFail($id);

        $tookMedication = $request->compliance === 'yes';

        $log = PatientDailyLog::create([
            'plan_id'         => $plan->id,
            'patient_id'      => Auth::id(),
            'took_medication' => $tookMedication,
            'symptom_score'   => $request->symptom_score,
            'symptoms'        => $request->compliance === 'partial' ? 'partial compliance' : null,
            'notes'           => $request->notes,
            'logged_at'       => now(),
        ]);

        return response()->json(['message' => 'Log submitted.', 'log' => $log], 201);
    }

    /* ─────────────────────────────────────────────────────────
     |  HELPERS
     ──────────────────────────────────────────────────────── */

    private function formatPlan(TreatmentPlan $plan): array
    {
        return [
            'id'                  => $plan->id,
            'title'               => $plan->title,
            'instructions'        => $plan->instructions,
            'start_date'          => $plan->start_date,
            'end_date'            => $plan->end_date,
            'status'              => $plan->status,
            'doctor'              => $plan->relationLoaded('doctor') ? $plan->doctor : null,
            'doctor_id'           => $plan->doctor_id,
            'doctor_name'         => $plan->relationLoaded('doctor') ? optional($plan->doctor)->name : null,
            'patient'             => $plan->relationLoaded('patient') ? $plan->patient : null,
            'patient_id'          => $plan->patient_id,
            'medications'         => $plan->relationLoaded('medications') ? $plan->medications : [],
            'follow_up_questions' => $plan->relationLoaded('followUpQuestions') ? $plan->followUpQuestions : [],
            'daily_logs_count'    => $plan->daily_logs_count ?? null,
            'created_at'          => $plan->created_at,
        ];
    }

    private function authorizeAccess(TreatmentPlan $plan, $user): void
    {
        if ($user->role === 'doctor' && $plan->doctor_id !== $user->id) {
            abort(403, 'You do not have access to this plan.');
        }
        if ($user->role === 'patient' && $plan->patient_id !== $user->id) {
            abort(403, 'You do not have access to this plan.');
        }
    }
}
