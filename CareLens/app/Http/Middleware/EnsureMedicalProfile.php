<?php

namespace App\Http\Middleware;

use App\Models\MedicalProfile;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMedicalProfile
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()->role != 'doctor') {
            $medicalProfile = MedicalProfile::where('user_id', '=', $request->user()->id)->first();
            if ($medicalProfile) {
                return $next($request);
            } else {
                return response()->json([
                    'message' => 'Complete profile first',
                ], 403);
            }
        } else {
            return $next($request);
        }
    }
}
