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
        'procurement_mode_id',
        'project_id',
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

    public function procurementMode()
    {
        return $this->belongsTo(ProcurementMode::class, 'procurement_mode_id');
    }

    public function projectRecord()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function pdfs()
    {
        return $this->hasMany(ProcurementPdf::class);
    }

    public function purchaseRequest()
    {
        return $this->hasOne(PurchaseRequest::class);
    }

    public function revisions()
    {
        return $this->hasMany(ProcurementRevision::class);
    }
}
