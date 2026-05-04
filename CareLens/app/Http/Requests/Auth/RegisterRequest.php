<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|min:3',
            'email'=> 'required|email|unique:users,email',
            'phone' => ['required', 'regex:/^01[0-2,5]{1}[0-9]{8}$/'],
            'password' => ['required','confirmed',Password::min(8)->letters()->numbers()],
        ];
    }
}
