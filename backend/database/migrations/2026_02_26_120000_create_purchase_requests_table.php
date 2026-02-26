<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('procurement_id')->unique()->constrained('procurements')->cascadeOnDelete();
            $table->string('purchase_request_number')->unique();
            $table->string('office');
            $table->date('date_created');
            $table->string('responsibility_center_code', 100);
            $table->text('purpose');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_requests');
    }
};
