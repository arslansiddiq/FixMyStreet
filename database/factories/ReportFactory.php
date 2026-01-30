<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'lat' => $this->faker->latitude(),
            'lng' => $this->faker->longitude(),
            'status' => 'open',
            'user_id' => \App\Models\User::factory(),
            'category_id' => \App\Models\Category::factory(),
            'authority_id' => null,
        ];
    }
}
