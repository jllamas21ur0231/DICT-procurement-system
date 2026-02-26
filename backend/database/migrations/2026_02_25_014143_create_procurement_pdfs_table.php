<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procurement_pdfs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('procurement_id')->constrained('procurements')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->json('checklist');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_pdfs');
    }
};