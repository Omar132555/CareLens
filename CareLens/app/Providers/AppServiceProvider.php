<?php

namespace App\Providers;

use App\Models\Conversation;
use App\Models\MedicalProfile;
use App\Models\User;
use App\Policies\ConversationPolicy;
use App\Policies\MedicalProfilePolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(MedicalProfile::class, MedicalProfilePolicy::class);
        Gate::policy(Conversation::class, ConversationPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
    }
}
