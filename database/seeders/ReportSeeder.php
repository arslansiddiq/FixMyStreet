<?php

namespace Database\Seeders;

use App\Models\Authority;
use App\Models\Category;
use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test user if not exists
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        $categories = Category::all();
        $authorities = Authority::all();

        // Sample reports in San Francisco area
        $reports = [
            [
                'title' => 'Large Pothole on Market Street',
                'description' => 'Deep pothole causing traffic issues near the intersection of Market and 5th Street. Approximately 2 feet in diameter.',
                'lat' => 37.7849,
                'lng' => -122.4094,
                'category' => 'Pothole',
                'status' => 'open',
            ],
            [
                'title' => 'Broken Street Light',
                'description' => 'Street light has been out for over a week. Area is very dark at night, safety concern.',
                'lat' => 37.7899,
                'lng' => -122.3942,
                'category' => 'Lighting',
                'status' => 'in-progress',
            ],
            [
                'title' => 'Graffiti on Building Wall',
                'description' => 'Large graffiti on the side of commercial building. Needs removal.',
                'lat' => 37.7749,
                'lng' => -122.4194,
                'category' => 'Graffiti',
                'status' => 'open',
            ],
            [
                'title' => 'Cracked Sidewalk - Trip Hazard',
                'description' => 'Severely cracked sidewalk creating a tripping hazard. Multiple sections need repair.',
                'lat' => 37.7799,
                'lng' => -122.4144,
                'category' => 'Broken Sidewalk',
                'status' => 'open',
            ],
            [
                'title' => 'Malfunctioning Traffic Signal',
                'description' => 'Traffic signal stuck on red in all directions. Causing confusion and traffic backup.',
                'lat' => 37.7829,
                'lng' => -122.4089,
                'category' => 'Traffic Signal',
                'status' => 'fixed',
            ],
            [
                'title' => 'Illegal Dumping Site',
                'description' => 'Furniture and household waste dumped on the corner. Needs immediate cleanup.',
                'lat' => 37.7699,
                'lng' => -122.4269,
                'category' => 'Illegal Dumping',
                'status' => 'open',
            ],
            [
                'title' => 'Overflowing Tree Branches',
                'description' => 'Tree branches hanging low over sidewalk, blocking pedestrian path.',
                'lat' => 37.7759,
                'lng' => -122.4389,
                'category' => 'Tree Maintenance',
                'status' => 'open',
            ],
            [
                'title' => 'Street Needs Cleaning',
                'description' => 'Accumulated debris and litter on the street. Regular cleaning needed.',
                'lat' => 37.7889,
                'lng' => -122.4324,
                'category' => 'Street Cleaning',
                'status' => 'closed',
            ],
        ];

        foreach ($reports as $reportData) {
            $category = $categories->firstWhere('name', $reportData['category']);
            
            Report::create([
                'title' => $reportData['title'],
                'description' => $reportData['description'],
                'lat' => $reportData['lat'],
                'lng' => $reportData['lng'],
                'category_id' => $category->id,
                'user_id' => $user->id,
                'authority_id' => $authorities->first()->id ?? null,
                'status' => $reportData['status'],
            ]);
        }
    }
}
