<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('verification_status', ['none', 'pending', 'approved', 'rejected'])->default('none')->after('role');
            $table->timestamp('verification_requested_at')->nullable()->after('verification_status');
            $table->timestamp('verification_reviewed_at')->nullable()->after('verification_requested_at');
            $table->text('verification_notes')->nullable()->after('verification_reviewed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['verification_status', 'verification_requested_at', 'verification_reviewed_at', 'verification_notes']);
        });
    }
};
