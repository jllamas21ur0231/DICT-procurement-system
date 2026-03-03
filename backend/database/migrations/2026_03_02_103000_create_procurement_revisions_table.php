<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procurement_revisions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('procurement_id')->constrained('procurements')->cascadeOnDelete();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('entity_type', 50);
            $table->unsignedBigInteger('entity_id');
            $table->json('before_data')->nullable();
            $table->json('after_data')->nullable();
            $table->json('changed_fields')->nullable();
            $table->text('reason')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['procurement_id', 'created_at'], 'proc_rev_proc_created_idx');
            $table->index('actor_user_id', 'proc_rev_actor_idx');
            $table->index(['entity_type', 'entity_id'], 'proc_rev_entity_idx');
            $table->index('action', 'proc_rev_action_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_revisions');
    }
};
