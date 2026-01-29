<?php

namespace App\Services;

use App\Models\Authority;

class SpatialTriagingService
{
    /**
     * Determine which authority boundary contains the given point.
     * 
     * @param float $lat
     * @param float $lng
     * @return Authority|null
     */
    public function findAuthorityForPoint(float $lat, float $lng): ?Authority
    {
        $authorities = Authority::all();

        foreach ($authorities as $authority) {
            if ($this->pointInPolygon($lat, $lng, $authority->boundary)) {
                return $authority;
            }
        }

        return null;
    }

    /**
     * Check if a point is inside a GeoJSON polygon using ray-casting algorithm.
     * 
     * @param float $lat
     * @param float $lng
     * @param array $geoJson
     * @return bool
     */
    protected function pointInPolygon(float $lat, float $lng, array $geoJson): bool
    {
        if ($geoJson['type'] !== 'Polygon' || empty($geoJson['coordinates'])) {
            return false;
        }

        // Get the first ring (exterior boundary) of the polygon
        $polygon = $geoJson['coordinates'][0];
        
        $inside = false;
        $count = count($polygon);

        for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
            $xi = $polygon[$i][0]; // longitude
            $yi = $polygon[$i][1]; // latitude
            $xj = $polygon[$j][0]; // longitude
            $yj = $polygon[$j][1]; // latitude

            $intersect = (($yi > $lat) !== ($yj > $lat))
                && ($lng < ($xj - $xi) * ($lat - $yi) / ($yj - $yi) + $xi);

            if ($intersect) {
                $inside = !$inside;
            }
        }

        return $inside;
    }
}
