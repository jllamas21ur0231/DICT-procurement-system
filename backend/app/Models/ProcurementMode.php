<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementMode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'legal_basis',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function procurements()
    {
        return $this->hasMany(Procurement::class);
    }
}
