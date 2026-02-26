<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procurements', function (Blueprint $table): void {
            $table->id();
            $table->string('procurement_no')->unique();
            $table->string('title');
            $table->string('mode_of_procurement');
            $table->string('project');
            $table->string('status')->default('pending');
            $table->text('description')->nullable();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('deleted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurements');
    }
};