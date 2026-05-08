<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EmergencyAlert
{
    /**
     * Dangerous symptom keywords that trigger an emergency alert.
     * Grouped by category for maintainability.
     */
    private array $emergencyKeywords = [
        // Cardiac
        'chest pain', 'severe chest pain', 'chest tightness', 'heart attack',
        'cardiac arrest', 'palpitations severe',

        // Neurological
        'stroke', 'loss of consciousness', 'unconscious', 'seizure', 'convulsions',
        'sudden confusion', 'sudden numbness', 'face drooping', 'arm weakness',
        'slurred speech', 'sudden severe headache',

        // Respiratory
        'difficulty breathing', 'can\'t breathe', 'cannot breathe', 'shortness of breath',
        'choking', 'stopped breathing',

        // Bleeding & Trauma
        'severe bleeding', 'uncontrolled bleeding', 'coughing blood', 'vomiting blood',

        // Allergic
        'anaphylaxis', 'severe allergic reaction', 'throat swelling', 'tongue swelling',

        // Other life-threatening
        'overdose', 'poisoning', 'attempted suicide', 'suicidal',
    ];

    public function handle(Request $request, Closure $next)
    {
        $message = strtolower($request->input('message', ''));

        foreach ($this->emergencyKeywords as $keyword) {
            if (str_contains($message, strtolower($keyword))) {
                return response()->json([
                    'type'     => 'emergency_alert',
                    'keyword'  => $keyword,
                    'message'  => 'Emergency symptoms detected. Please call emergency services immediately.',
                ], 200);
            }
        }

        return $next($request);
    }
}