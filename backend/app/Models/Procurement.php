<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Procurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'procurement_no',
        'title',
        'mode_of_procurement',
        'project',
        'status',
        'description',
        'requested_by',
        'deleted',
    ];

    protected $casts = [
        'deleted' => 'boolean',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function pdfs()
    {
        return $this->hasMany(ProcurementPdf::class);
    }

    public function purchaseRequest()
    {
        return $this->hasOne(PurchaseRequest::class);
    }
}
