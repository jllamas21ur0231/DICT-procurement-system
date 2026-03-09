<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('saros', function (Blueprint $table): void {
            $table->boolean('deleted')->default(false)->after('remarks');
        });

        Schema::table('apps', function (Blueprint $table): void {
            $table->boolean('deleted')->default(false)->after('remarks');
        });

        Schema::table('ppmps', function (Blueprint $table): void {
            $table->boolean('deleted')->default(false)->after('remarks');
        });

        Schema::table('msris', function (Blueprint $table): void {
            $table->boolean('deleted')->default(false)->after('remarks');
        });

        Schema::table('srfis', function (Blueprint $table): void {
            $table->boolean('deleted')->default(false)->after('remarks');
        });

        Schema::table('technical_specifications', function (Blueprint $table): void {
            $table->boolean('deleted')->default(false)->after('sort_order');
        });
    }

    public function down(): void
    {
        Schema::table('technical_specifications', function (Blueprint $table): void {
            $table->dropColumn('deleted');
        });

        Schema::table('srfis', function (Blueprint $table): void {
            $table->dropColumn('deleted');
        });

        Schema::table('msris', function (Blueprint $table): void {
            $table->dropColumn('deleted');
        });

        Schema::table('ppmps', function (Blueprint $table): void {
            $table->dropColumn('deleted');
        });

        Schema::table('apps', function (Blueprint $table): void {
            $table->dropColumn('deleted');
        });

        Schema::table('saros', function (Blueprint $table): void {
            $table->dropColumn('deleted');
        });
    }
};
