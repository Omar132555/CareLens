<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Socialite;

class RegisterController extends Controller
{
    public function create()
    {
        //
    }

    public function store(RegisterRequest $request)
    {
        $user = User::create($request->validated());
        Auth::login($user);

        return response()->json([
            'status' => true,
            'user' => $user,
            'redirect' => 'home',
        ]);
    }

    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request)
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::withoutGlobalScopes()->where('email', $googleUser->email)->first();

        if (! $user) {
            session([
                'google_user' => [
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                ],
            ]);

            return redirect('http://localhost:5173/CompleteProfile');
        }

        // لو موجود → login عادي
        Auth::login($user);
        $request->session()->regenerate();

        return redirect('http://localhost:5173/home');
    }

    public function storeCompleteForm(Request $request)
    {
        $googleUser = session('google_user');

        if (! $googleUser) {
            return redirect('/login');
        }

        $user = User::withoutGlobalScopes()->where('phone', $request->phone)->first();
        if ($user) {
            return response()->json([
                'error' => 'Phone number already exists',
                'field' => 'phone',
            ], 409);
        }
        $user = User::create([
            'name' => $googleUser['name'],
            'email' => $googleUser['email'],
            'password' => bcrypt('google'.$googleUser['email']),
            'email_verified_at' => now(),
            'phone' => $request->phone,
            'role' => $request->role,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        session()->forget('google_user');

        return response()->json([
            'message' => 'Profile completed successfully',
            'redirect' => '/home',
        ]);
    }
}
