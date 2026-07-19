<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('servicesettings_models', function (Blueprint $table) {
            $table->boolean('smsbus_enabled')->default(true)->after('sms_bus_top_up');
            $table->boolean('herosms_enabled')->default(true)->after('smsbus_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('servicesettings_models', function (Blueprint $table) {
            $table->dropColumn(['smsbus_enabled', 'herosms_enabled']);
        });
    }
};
