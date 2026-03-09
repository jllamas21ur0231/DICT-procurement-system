<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SrfiAttachment extends Model
{
    protected $table = 'srfis';

    protected $fillable = [
        'procurement_id',
        'uploaded_by',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'remarks',
        'deleted',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'deleted' => 'boolean',
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
