<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnicalSpecificationAttachment extends Model
{
    protected $table = 'technical_specifications';

    protected $fillable = [
        'procurement_id',
        'uploaded_by',
        'spec_type',
        'label',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'remarks',
        'sort_order',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'sort_order' => 'integer',
    ];

    public function procurement()
    {
        return $this->belongsTo(Procurement::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
