<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technical_specifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('procurement_id')->constrained('procurements')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('spec_type', 100);
            $table->string('label')->nullable();
            $table->string('file_name');
            $table->string('file_path', 1000);
            $table->string('mime_type', 150);
            $table->unsignedBigInteger('file_size');
            $table->text('remarks')->nullable();
            $table->unsignedInteger('sort_order')->nullable();
            $table->timestamps();

            $table->index(['procurement_id', 'spec_type']);
            $table->index('uploaded_by');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technical_specifications');
    }
};
