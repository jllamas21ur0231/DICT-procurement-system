<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saros', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('procurement_id')->unique()->constrained('procurements')->cascadeOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('file_name');
            $table->string('file_path', 1000);
            $table->string('mime_type', 150);
            $table->unsignedBigInteger('file_size');
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index('uploaded_by');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saros');
    }
};
