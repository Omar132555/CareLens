<?php

namespace App\Http\Controllers;

use App\Notifications\TestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestController extends Controller
{
    public function notificationTest()
    {
        Auth::user()->notify(new TestNotification());
    }
}
