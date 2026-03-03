<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProcurementRevision extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'procurement_id',
        'actor_user_id',
        'action',
        'entity_type',
        'entity_id',
        'before_data',
        'after_data',
        'changed_fields',
        'reason',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'before_data' => 'array',
        'after_data' => 'array',
        'changed_fields' => 'array',
        'created_at' => 'datetime',
    ];

    public function procurement()
    {
        return $this->belongsTo(Procurement::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
