<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Report;
use App\Models\Category;
use App\Models\Bid;
use App\Models\Donation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BidTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
    }

    public function test_bidder_can_submit_bid(): void
    {
        $bidder = User::factory()->create();
        $bidder->assignRole('Bidder');

        $category = Category::factory()->create();
        $user = User::factory()->create();
        $report = Report::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);

        $this->actingAs($bidder);

        $response = $this->post(route('bids.store', $report), [
            'amount' => 100.50,
            'description' => 'I can fix this issue',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('bids', [
            'report_id' => $report->id,
            'user_id' => $bidder->id,
            'amount' => 100.50,
            'status' => 'pending',
        ]);
    }

    public function test_user_without_permission_cannot_submit_bid(): void
    {
        $user = User::factory()->create();
        $user->assignRole('User'); // User role doesn't have bid permission

        $category = Category::factory()->create();
        $report = Report::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);

        $this->actingAs($user);

        $response = $this->post(route('bids.store', $report), [
            'amount' => 100.50,
            'description' => 'I can fix this issue',
        ]);

        $response->assertStatus(403);
    }

    public function test_manager_can_accept_bid_with_sufficient_donations(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('Manager');

        $bidder = User::factory()->create();
        $bidder->assignRole('Bidder');

        $category = Category::factory()->create();
        $user = User::factory()->create();
        $report = Report::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);

        // Create a bid
        $bid = Bid::factory()->create([
            'report_id' => $report->id,
            'user_id' => $bidder->id,
            'amount' => 100,
            'status' => 'pending',
        ]);

        // Create sufficient donations
        Donation::factory()->create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'amount' => 150,
        ]);

        $this->actingAs($manager);

        $response = $this->patch(route('bids.accept', $bid));

        $response->assertRedirect();
        $this->assertDatabaseHas('bids', [
            'id' => $bid->id,
            'status' => 'accepted',
        ]);
        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'in-progress',
            'assigned_bid_id' => $bid->id,
        ]);
    }

    public function test_manager_cannot_accept_bid_without_sufficient_donations(): void
    {
        $manager = User::factory()->create();
        $manager->assignRole('Manager');

        $bidder = User::factory()->create();
        $bidder->assignRole('Bidder');

        $category = Category::factory()->create();
        $user = User::factory()->create();
        $report = Report::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);

        // Create a bid
        $bid = Bid::factory()->create([
            'report_id' => $report->id,
            'user_id' => $bidder->id,
            'amount' => 100,
            'status' => 'pending',
        ]);

        // Create insufficient donations
        Donation::factory()->create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'amount' => 50,
        ]);

        $this->actingAs($manager);

        $response = $this->patch(route('bids.accept', $bid));

        $response->assertRedirect();
        $this->assertDatabaseHas('bids', [
            'id' => $bid->id,
            'status' => 'pending', // Should still be pending
        ]);
    }
}
