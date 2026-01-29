<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    protected $fillable = [
        'title',
        'description',
        'lat',
        'lng',
        'status',
        'user_id',
        'category_id',
        'authority_id',
    ];

    protected $casts = [
        'lat' => 'decimal:8',
        'lng' => 'decimal:8',
    ];

    /**
     * Get the user that created the report.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of the report.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the authority assigned to the report.
     */
    public function authority(): BelongsTo
    {
        return $this->belongsTo(Authority::class);
    }

    /**
     * Get the photos for the report.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }

    /**
     * Get the comments for the report.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
