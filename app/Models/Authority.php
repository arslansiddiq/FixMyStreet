<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Authority extends Model
{
    protected $fillable = [
        'name',
        'email',
        'boundary',
    ];

    protected $casts = [
        'boundary' => 'array', // Cast JSON to array
    ];

    /**
     * Get the reports for the authority.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
