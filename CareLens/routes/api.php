<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ChatAiController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\FollowUpController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\TreatmentPlanController;
use App\Http\Middleware\EmergencyAlert;
use App\Http\Middleware\EnsureMedicalProfile;
use App\Http\Middleware\EnsureRole;
use App\Services\RagService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/* ═══════════════════════════════════════════════════════════
   PUBLIC
═══════════════════════════════════════════════════════════ */

Route::get('/home', function () {
    return response()->json(['we are in home' => true]);
})->name('home');

Route::post('/ask', function (Request $request) {
    return app(RagService::class)->ask($request->question);
});

/* ═══════════════════════════════════════════════════════════
   AUTH ROUTES (web middleware for session/CSRF)
═══════════════════════════════════════════════════════════ */

Route::middleware('web')->group(function () {
    Route::controller(RegisterController::class)->group(function () {
        Route::get('/register', 'create')->name('register');
        Route::post('/register', 'store')->name('register.store');
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
});

/* ═══════════════════════════════════════════════════════════
   AUTHENTICATED ROUTES
═══════════════════════════════════════════════════════════ */

Route::middleware('auth:sanctum')->group(function () {

    /* ── Current user ───────────────────────────────────── */
    Route::get('/user', fn (Request $request) => Auth::user());

    /* ── Requires medical profile ───────────────────────── */
    Route::middleware(EnsureMedicalProfile::class)->group(function () {

        /* ═══════════════════════════════════════════════════════
           PATIENT ROUTES
        ═══════════════════════════════════════════════════════ */
        Route::middleware([EnsureRole::class.':patient'])->prefix('patient')->group(function () {
            
            Route::post('/treatment-plans/{id}/log', [TreatmentPlanController::class, 'log']);
            Route::get('/doctors/all', [DoctorController::class, 'index'])->name('doctors.get');
            Route::post('/follow/request', [FollowUpController::class, 'sendRequest'])->name('doctors.get');

            /* ── Patient: medical profile ───────────────────────── */
            Route::controller(PatientController::class)->group(function () {
                Route::put('/medical-profile/update', 'updateMedicalProfile')->name('medicalProfile.update');
                Route::get('/medical-profile/get', 'getMedicalProfile')->name('medicalProfile.get');
            });
        });

        /* ── Chat AI ─────────────────────────────────────── */
        Route::controller(ChatAiController::class)->prefix('chatAi')->group(function () {
            Route::post('/send', 'send')->name('chatAi.send')->middleware(EmergencyAlert::class);
            Route::get('/conversation/get/names', 'userConversations')->name('chatAi.conversation.names');
            Route::post('/conversation/create', 'createConversation')->name('chatAi.conversation.create');
            Route::delete('/conversation/delete', 'deletConversation')->name('chatAi.conversation.delete');
            Route::get('/conversation/get/{conversation}', 'getConversation')->name('chatAi.conversation.get');
        });
    });

    /* ═══════════════════════════════════════════════════════
       DOCTOR ROUTES
    ═══════════════════════════════════════════════════════ */
    Route::middleware([EnsureRole::class.':doctor'])->prefix('doctor')->group(function () {

        /* ── Doctor: category ────────────────────────────── */
        Route::controller(DoctorController::class)->prefix('doctor')->group(function () {
            Route::get('/categories/get', 'getCategories')->name('categories.get');
            Route::put('/category/update', 'updateCategory')->name('categories.put');
        });

        /* Verification */
        Route::get('/verification/status', [DoctorController::class, 'getVerificationStatus']);
        Route::post('/verification/request', [DoctorController::class, 'requestVerification']);
        Route::delete('/verification/cancel', [DoctorController::class, 'cancelVerification']);

        /* Doctor's own articles */
        Route::get('/articles', [ArticleController::class, 'doctorIndex']);
        Route::post('/articles', [ArticleController::class, 'store']);
        Route::post('/articles/{id}', [ArticleController::class, 'update']);  // POST for multipart
        Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);

        /* Treatment plans — doctor CRUD */
        Route::post('/treatment-plans', [TreatmentPlanController::class, 'store']);
        Route::put('/treatment-plans/{id}', [TreatmentPlanController::class, 'update']);
        Route::delete('/treatment-plans/{id}', [TreatmentPlanController::class, 'destroy']);
        Route::get('/treatment-plans/{id}/logs', [TreatmentPlanController::class, 'logs']);
        Route::post('/treatment-plans/{id}/feedback', [TreatmentPlanController::class, 'feedback']);
    });

    /* ═══════════════════════════════════════════════════════
       SHARED — ARTICLES (all authenticated users)
    ═══════════════════════════════════════════════════════ */
    Route::prefix('articles')->group(function () {
        Route::get('/', [ArticleController::class, 'index']);
        Route::get('/saved', [ArticleController::class, 'savedArticles']);
        Route::get('/{id}', [ArticleController::class, 'show']);
        Route::post('/{id}/like', [ArticleController::class, 'like']);
        Route::post('/{id}/save', [ArticleController::class, 'save']);
        Route::post('/{id}/comment', [ArticleController::class, 'comment']);
    });

    /* ═══════════════════════════════════════════════════════
       SHARED — TREATMENT PLANS (read)
    ═══════════════════════════════════════════════════════ */
    Route::prefix('treatment-plans')->group(function () {
        Route::get('/', [TreatmentPlanController::class, 'index']);
        Route::get('/{id}', [TreatmentPlanController::class, 'show']);
        /* Patient log (also reachable without prefix for legacy frontend) */
        Route::post('/{id}/log', [TreatmentPlanController::class, 'log']);
    });

    /* ═══════════════════════════════════════════════════════
       ADMIN ROUTES
    ═══════════════════════════════════════════════════════ */
    Route::middleware([EnsureRole::class.':admin'])->prefix('admin')->group(function () {
        Route::get('/dashboard/stats', [AdminController::class, 'dashboardStats']);

        /* Users */
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        /* Verification */
        Route::get('/verification/requests', [AdminController::class, 'verificationRequests']);
        Route::put('/verification/{id}/approve', [AdminController::class, 'approveVerification']);
        Route::put('/verification/{id}/reject', [AdminController::class, 'rejectVerification']);

        /* Articles */
        Route::get('/articles', [AdminController::class, 'articles']);
        Route::delete('/articles/{id}', [AdminController::class, 'deleteArticle']);
    });
});
