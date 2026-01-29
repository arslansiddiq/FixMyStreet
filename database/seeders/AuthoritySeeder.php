<?php

namespace Database\Seeders;

use App\Models\Authority;
use Illuminate\Database\Seeder;

class AuthoritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Example: Create a test authority with a simple polygon boundary
        // This represents a small area in San Francisco for demonstration
        Authority::firstOrCreate(
            ['email' => 'sf-authority@example.com'],
            [
                'name' => 'San Francisco Public Works',
                'email' => 'sf-authority@example.com',
                'boundary' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [-122.4194, 37.7749], // SW corner (longitude, latitude)
                        [-122.4194, 37.8049], // NW corner
                        [-122.3894, 37.8049], // NE corner
                        [-122.3894, 37.7749], // SE corner
                        [-122.4194, 37.7749], // Close the polygon
                    ]],
                ],
            ]
        );

        // Add another authority for demonstration
        Authority::firstOrCreate(
            ['email' => 'oakland-authority@example.com'],
            [
                'name' => 'Oakland Public Works',
                'email' => 'oakland-authority@example.com',
                'boundary' => [
                    'type' => 'Polygon',
                    'coordinates' => [[
                        [-122.2728, 37.8044], // SW corner
                        [-122.2728, 37.8344], // NW corner
                        [-122.2428, 37.8344], // NE corner
                        [-122.2428, 37.8044], // SE corner
                        [-122.2728, 37.8044], // Close the polygon
                    ]],
                ],
            ]
        );
    }
}
