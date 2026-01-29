<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class ExifService
{
    /**
     * Extract GPS coordinates from an image file.
     * 
     * @param UploadedFile|string $file
     * @return array|null Returns ['lat' => float, 'lng' => float] or null
     */
    public function extractGpsCoordinates($file): ?array
    {
        $path = $file instanceof UploadedFile ? $file->getRealPath() : $file;

        // Check if exif extension is loaded
        if (!function_exists('exif_read_data')) {
            return null;
        }

        // Read EXIF data
        $exif = @exif_read_data($path, 'GPS');
        
        if (!$exif || !isset($exif['GPS'])) {
            return null;
        }

        $gps = $exif['GPS'];

        // Check if GPS data exists
        if (!isset($gps['GPSLatitude'], $gps['GPSLatitudeRef'], $gps['GPSLongitude'], $gps['GPSLongitudeRef'])) {
            return null;
        }

        // Convert GPS data to decimal degrees
        $lat = $this->gpsToDecimal($gps['GPSLatitude'], $gps['GPSLatitudeRef']);
        $lng = $this->gpsToDecimal($gps['GPSLongitude'], $gps['GPSLongitudeRef']);

        if ($lat === null || $lng === null) {
            return null;
        }

        return [
            'lat' => $lat,
            'lng' => $lng,
        ];
    }

    /**
     * Convert GPS coordinates to decimal degrees.
     * 
     * @param array $coordinate
     * @param string $hemisphere
     * @return float|null
     */
    protected function gpsToDecimal(array $coordinate, string $hemisphere): ?float
    {
        if (count($coordinate) !== 3) {
            return null;
        }

        // Convert fractions to decimals
        $degrees = $this->fractionToDecimal($coordinate[0]);
        $minutes = $this->fractionToDecimal($coordinate[1]);
        $seconds = $this->fractionToDecimal($coordinate[2]);

        // Calculate decimal degrees
        $decimal = $degrees + ($minutes / 60) + ($seconds / 3600);

        // Adjust for hemisphere
        if (in_array($hemisphere, ['S', 'W'])) {
            $decimal *= -1;
        }

        return $decimal;
    }

    /**
     * Convert a fraction string to decimal.
     * 
     * @param mixed $fraction
     * @return float
     */
    protected function fractionToDecimal($fraction): float
    {
        if (is_numeric($fraction)) {
            return (float) $fraction;
        }

        if (is_string($fraction) && str_contains($fraction, '/')) {
            $parts = explode('/', $fraction);
            if (count($parts) === 2 && $parts[1] != 0) {
                return (float) $parts[0] / (float) $parts[1];
            }
        }

        return 0.0;
    }
}
