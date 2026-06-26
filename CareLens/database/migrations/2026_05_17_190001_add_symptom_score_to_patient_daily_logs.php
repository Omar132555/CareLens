<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_daily_logs', function (Blueprint $table) {
            $table->tinyInteger('symptom_score')->nullable()->after('took_medication');
            $table->text('doctor_feedback')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('patient_daily_logs', function (Blueprint $table) {
            $table->dropColumn(['symptom_score', 'doctor_feedback']);
        });
    }
};
