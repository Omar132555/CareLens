<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ChatAiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::controller(RegisterController::class)->group(function () {
    Route::get('/register', 'create')->name('register');
    Route::post('/register', 'store')->name('register.store');
    Route::get('/auth/redirect', 'redirect')->name('auth.redirect');
    Route::get('/auth/callback', 'callback')->name('auth.callback');
    Route::post('/complete-profile', 'storeCompleteForm');
});
Route::controller(LoginController::class)->group(function () {
    Route::get('/login', 'create')->name('login');
    Route::post('/login', 'store')->name('login.store');
    Route::delete('/logout', 'destroy')->name('logout');
    Route::get('/forgot-password', 'forgetLink')->middleware('guest')->name('password.forget');
    Route::post('/forgot-password', 'forget')->middleware('guest')->name('password.email');
    Route::get('/reset-password/{token}/{email}', 'reset')->middleware('guest')->name('password.reset');
    Route::post('/reset-password', 'updatePass')->middleware('guest')->name('password.update');
});
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return Auth::user();
    });
    Route::controller(ChatAiController::class)->prefix('chatAi')->group(function (){
        Route::post('/send', 'send')->name('chatAi.send');
        Route::get('/conversation/get/{conversation}', 'getConversation')->name('chatAi.conversation.get');
        Route::get('/conversation/get/names', 'userConversations')->name('chatAi.conversation.names');
        Route::post('/conversation/create', 'createConversation')->name('chatAi.conversation.create');
        Route::delete('/conversation/delete', 'deletConversation')->name('chatAi.conversation.delete');
    });
});
