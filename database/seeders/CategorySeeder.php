<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Pothole',
            'Graffiti',
            'Lighting',
            'Broken Sidewalk',
            'Traffic Signal',
            'Illegal Dumping',
            'Street Cleaning',
            'Tree Maintenance',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['name' => $category]);
        }
    }
}
