<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementPdf extends Model
{
    use HasFactory;

    protected $table = 'procurement_pdfs';

    protected $fillable = [
        'procurement_id',
        'file_name',
        'file_path',
        'checklist',
    ];

    protected $casts = [
        'checklist' => 'array',
    ];

    public function procurement()
    {
        return $this->belongsTo(Procurement::class);
    }
}