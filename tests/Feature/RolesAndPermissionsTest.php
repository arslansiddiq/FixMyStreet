<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Report;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class RolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles and permissions
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
    }

    public function test_user_role_has_correct_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('User');

        $this->assertTrue($user->can('create-report'));
        $this->assertTrue($user->can('view-report'));
        $this->assertTrue($user->can('donate-to-task'));
        $this->assertFalse($user->can('bid-on-report'));
        $this->assertFalse($user->can('approve-report'));
        $this->assertFalse($user->can('edit-report'));
        $this->assertFalse($user->can('delete-report'));
    }

    public function test_bidder_role_has_correct_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Bidder');

        $this->assertTrue($user->can('create-report'));
        $this->assertTrue($user->can('view-report'));
        $this->assertTrue($user->can('donate-to-task'));
        $this->assertTrue($user->can('bid-on-report'));
        $this->assertFalse($user->can('approve-report'));
        $this->assertFalse($user->can('edit-report'));
        $this->assertFalse($user->can('delete-report'));
    }

    public function test_manager_role_has_correct_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Manager');

        $this->assertTrue($user->can('create-report'));
        $this->assertTrue($user->can('view-report'));
        $this->assertTrue($user->can('donate-to-task'));
        $this->assertTrue($user->can('approve-report'));
        $this->assertTrue($user->can('edit-report'));
        $this->assertTrue($user->can('delete-report'));
        $this->assertFalse($user->can('bid-on-report'));
    }

    public function test_admin_role_has_all_permissions(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');

        $this->assertTrue($user->can('create-report'));
        $this->assertTrue($user->can('view-report'));
        $this->assertTrue($user->can('donate-to-task'));
        $this->assertTrue($user->can('bid-on-report'));
        $this->assertTrue($user->can('approve-report'));
        $this->assertTrue($user->can('edit-report'));
        $this->assertTrue($user->can('delete-report'));
    }

    public function test_user_without_permission_cannot_create_report(): void
    {
        $user = User::factory()->create();
        // Don't assign any role

        $this->actingAs($user);

        $category = Category::factory()->create();

        // Try to create a report directly
        $response = $this->post(route('reports.store'), [
            'title' => 'Test Report',
            'description' => 'Test Description',
            'lat' => 40.7128,
            'lng' => -74.0060,
            'category_id' => $category->id,
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_report(): void
    {
        $user = User::factory()->create();
        $user->assignRole('User');

        $this->actingAs($user);

        $category = Category::factory()->create();

        // Try to create a report directly
        $response = $this->post(route('reports.store'), [
            'title' => 'Test Report',
            'description' => 'Test Description',
            'lat' => 40.7128,
            'lng' => -74.0060,
            'category_id' => $category->id,
        ]);

        // Should succeed (redirect or success response)
        $this->assertFalse($response->isForbidden());
    }
}
