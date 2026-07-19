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
            $table->decimal('sms_bus_exc_rate', 10, 2)->default(1500)->after('daisy_sms_top_up');
            $table->decimal('sms_bus_top_up', 10, 8)->default(60)->after('sms_bus_exc_rate');
        });
    }

    public function down(): void
    {
        Schema::table('servicesettings_models', function (Blueprint $table) {
            $table->dropColumn(['sms_bus_exc_rate', 'sms_bus_top_up']);
        });
    }
};
