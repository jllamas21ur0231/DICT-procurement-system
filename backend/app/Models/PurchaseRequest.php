<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'procurement_id',
        'purchase_request_number',
        'office',
        'date_created',
        'responsibility_center_code',
        'purpose',
        'deleted',
    ];

    protected $casts = [
        'date_created' => 'date',
        'deleted' => 'boolean',
    ];

    public function procurement()
    {
        return $this->belongsTo(Procurement::class);
    }

    public function items()
    {
        return $this->hasMany(Item::class);
    }
}
