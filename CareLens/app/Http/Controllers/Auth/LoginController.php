<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Mail\resetPasswordMail;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PassValidator;

class LoginController extends Controller
{
    public function create()
    {
        return response()->json([
            'passwordForget' => route('password.forget'),
            'register' => route('register'),
            'googleLogin' => route('auth.redirect'),
        ]);
    }

    public function store(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json([
                'errors' => ['email' => ['Email doesn\'t exist']],
            ], 422);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'errors' => ['password' => ['Invalid Password']],
            ], 422);
        }


        Auth::login($user);
        $request->session()->regenerate();
        
        $user = Auth::user();
        
        return response()->json([
            'status' => true,
            'user' => $user,
            'redirect' => 'home',
        ]);
    }

    public function destroy()
    {
        Auth::logout();

        return to_route('login');
    }

    public function forgetLink()
    {
        return response()->json([
            'you are in forgetLink',
        ]);
    }

    public function forget(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $email = $request->email;
        $user = User::where('email', $email)->first();

        if ($user) {
            $cacheKey = 'password_reset_count_'.md5($email);
            $cacheKey2 = 'try_again_'.md5($email);

            $count = Cache::get($cacheKey, 0);
            $try_again = Cache::get($cacheKey2, false);

            if ($count >= 3) {
                return response()->json([
                    'error' => 'You excceded the limit, try again after 1 Day',
                    'input' => 'email',
                ]);
            }
            if ($try_again) {
                return response()->json([
                    'error' => 'Too many request, please wait 2 minutes',
                    'input' => 'email',
                ]);
            }
            if ($user) {
                $token = Password::createToken($user);
                $url = url(route('password.reset', ['token' => $token, 'email' => $user->email]));
            }
            Mail::to($user->email)->send(new resetPasswordMail($user, $url));

            Cache::put($cacheKey, $count + 1, 86400);
            Cache::put($cacheKey2, true, 120);

            return response()->json(['email' => 'We have emailed you password reset link.']);
        }
    }

    public function reset($token)
    {
        return view('Auth.reset-password', ['token' => $token, 'token']);
    }

    public function updatePass(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', PassValidator::min(8)->letters()->numbers()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));
                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PasswordReset
            ? redirect()->route('login')->with('status', __($status))
            : back()->withErrors(['email' => [__($status)]]);
    }
}
