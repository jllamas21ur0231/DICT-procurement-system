<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_request_id')->constrained('purchase_requests')->cascadeOnDelete();
            $table->string('item_no', 50);
            $table->string('stock_no', 100)->nullable();
            $table->string('unit', 50);
            $table->text('item_description');
            $table->text('item_inclusions')->nullable();
            $table->decimal('quantity', 12, 2);
            $table->decimal('unit_cost', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
