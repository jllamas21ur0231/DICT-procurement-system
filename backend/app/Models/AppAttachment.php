<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppAttachment extends Model
{
    protected $table = 'apps';

    protected $fillable = [
        'procurement_id',
        'uploaded_by',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'remarks',
    ];

    protected $casts = [
        'file_size' => 'integer',
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
