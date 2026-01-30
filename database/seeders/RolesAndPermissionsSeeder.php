<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'create-report',
            'edit-report',
            'delete-report',
            'approve-report',
            'bid-on-report',
            'donate-to-task',
            'view-report',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // User role - can create reports and donate
        $userRole = Role::create(['name' => 'User']);
        $userRole->givePermissionTo([
            'create-report',
            'view-report',
            'donate-to-task',
        ]);

        // Bidder role - can bid on reports and create reports
        $bidderRole = Role::create(['name' => 'Bidder']);
        $bidderRole->givePermissionTo([
            'create-report',
            'view-report',
            'bid-on-report',
            'donate-to-task',
        ]);

        // Manager role - can approve, edit, delete reports
        $managerRole = Role::create(['name' => 'Manager']);
        $managerRole->givePermissionTo([
            'create-report',
            'edit-report',
            'delete-report',
            'approve-report',
            'view-report',
            'donate-to-task',
        ]);

        // Admin role - has all permissions
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo(Permission::all());
    }
}
