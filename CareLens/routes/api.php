<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChatAiController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\FollowUpController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\SymptomController;
use App\Http\Controllers\TestController;
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
    Route::get('/notification/test', [TestController::class, 'notificationTest']);
                Route::get('/patient/medical-profile/get', [PatientController::class,'getMedicalProfile'])->name('medicalProfile.get');
                Route::put('/patient/medical-profile/update', [PatientController::class,'updateMedicalProfile'])->name('medicalProfile.update');

    /* ── Notifications ───────────────────────────────────── */
    Route::controller(NotificationController::class)->group(function () {
        Route::get('/notifications', 'index');
        Route::post('/notifications/{id}/read', 'markAsRead');
        Route::post('/notifications/read-all', 'markAllRead');
    });

    /* ── Requires medical profile ───────────────────────── */
    Route::middleware(EnsureMedicalProfile::class)->group(function () {

        /* ═══════════════════════════════════════════════════════
           PATIENT ROUTES
        ═══════════════════════════════════════════════════════ */
        Route::middleware([EnsureRole::class.':patient'])->prefix('patient')->group(function () {

            Route::post('/treatment-plans/{id}/log', [TreatmentPlanController::class, 'log']);
            Route::get('/doctors/all', [DoctorController::class, 'index'])->name('doctors.get');
            Route::post('/follow/request', [FollowUpController::class, 'toggleRequest'])->name('follow.toggle');
            Route::delete('/follow/remove', [FollowUpController::class, 'removeFollow'])->name('follow.remove.patient');

            /* ── Patient: medical profile ───────────────────────── */
            Route::controller(PatientController::class)->group(function () {
            });
        });

        /* ── Symptom Tracker ─────────────────────────────────── */
        Route::prefix('symptoms')->group(function () {
            Route::get('/logs', [SymptomController::class, 'index']);
            Route::post('/log', [SymptomController::class, 'store']);
            Route::delete('/logs/{id}', [SymptomController::class, 'destroy']);
            Route::get('/logs/chart', [SymptomController::class, 'chart']);
        });

        /* ── Medications ─────────────────────────────────────── */
        Route::prefix('medications')->group(function () {
            Route::get('/', [MedicationController::class, 'index']);
            Route::post('/', [MedicationController::class, 'store']);
            Route::put('/{id}', [MedicationController::class, 'update']);
            Route::delete('/{id}', [MedicationController::class, 'destroy']);
        });

        /* ── Dashboard Overview ───────────────────────────────── */
        Route::get('/dashboard/overview', [MedicationController::class, 'dashboardOverview']);

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

        /* ── Doctor: category & patients ────────────────────────────── */
        Route::controller(DoctorController::class)->group(function () {
            Route::put('/category/update', 'updateCategory')->name('categories.put');
            Route::post('/follow/approve', [FollowUpController::class, 'approveRequest'])->name('follow.approve');
            Route::delete('/follow/remove', [FollowUpController::class, 'removeFollow'])->name('follow.remove');
            Route::get('/patients', 'myPatients')->name('doctor.patients');
        });

        /* Verification */
        Route::get('/verification/status', [DoctorController::class, 'getVerificationStatus']);
        Route::post('/verification/request', [DoctorController::class, 'requestVerification']);
        Route::delete('/verification/cancel', [DoctorController::class, 'cancelVerification']);

        /* Doctor's own articles */
        Route::get('/articles', [ArticleController::class, 'doctorIndex']);
        Route::post('/articles', [ArticleController::class, 'store']);
        Route::post('/articles/{id}', [ArticleController::class, 'update']);
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
       SHARED
    ═══════════════════════════════════════════════════════ */
    Route::get('/categories/get', [CategoryController::class, 'index'])->name('categories.get');

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
