<?php

namespace App\Services;

use App\Models\Report;
use Illuminate\Support\Collection;

class DuplicateDetectionService
{
    /**
     * Find open reports within a specified radius of a point.
     * 
     * @param float $lat
     * @param float $lng
     * @param float $radiusInMeters
     * @return Collection
     */
    public function findNearbyReports(float $lat, float $lng, float $radiusInMeters = 50): Collection
    {
        // Earth's radius in meters
        $earthRadius = 6371000;

        // Convert radius from meters to degrees (approximate)
        $latDelta = $radiusInMeters / $earthRadius * (180 / M_PI);
        $lngDelta = $radiusInMeters / ($earthRadius * cos($lat * M_PI / 180)) * (180 / M_PI);

        // Query for reports within the bounding box and status is 'open'
        $reports = Report::where('status', 'open')
            ->whereBetween('lat', [$lat - $latDelta, $lat + $latDelta])
            ->whereBetween('lng', [$lng - $lngDelta, $lng + $lngDelta])
            ->get();

        // Filter by actual distance using Haversine formula
        return $reports->filter(function ($report) use ($lat, $lng, $radiusInMeters) {
            $distance = $this->haversineDistance(
                $lat,
                $lng,
                (float) $report->lat,
                (float) $report->lng
            );

            return $distance <= $radiusInMeters;
        });
    }

    /**
     * Calculate distance between two points using Haversine formula.
     * 
     * @param float $lat1
     * @param float $lng1
     * @param float $lat2
     * @param float $lng2
     * @return float Distance in meters
     */
    protected function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000; // Earth's radius in meters

        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($lngDelta / 2) * sin($lngDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
