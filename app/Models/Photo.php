<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    protected $fillable = [
        'report_id',
        'path',
    ];

    /**
     * Get the report that owns the photo.
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
