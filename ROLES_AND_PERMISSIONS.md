# Roles and Permissions System

This document explains the roles, permissions, and bidding system implemented in the FixMyStreet application.

## Overview

The application uses [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) to manage user roles and permissions. This provides fine-grained access control throughout the application.

## Roles

### 1. User
**Default role for regular users**

Permissions:
- Create reports
- View reports  
- Donate to tasks

Use case: Citizens reporting infrastructure issues and supporting fixes through donations.

### 2. Bidder
**For contractors and service providers**

Permissions (includes all User permissions plus):
- Bid on reports

Use case: Contractors who want to bid on fixing reported issues and earn money.

### 3. Manager
**For local authority managers**

Permissions:
- Create reports
- View reports
- Edit reports
- Delete reports
- Approve reports
- Donate to tasks

Use case: Local authority staff who manage and approve reports but don't bid on fixes.

### 4. Admin
**Full system access**

Permissions:
- All permissions

Use case: System administrators with complete control.

## Permissions

| Permission | Description | Roles |
|------------|-------------|-------|
| create-report | Create new infrastructure issue reports | User, Bidder, Manager, Admin |
| view-report | View report details | All roles |
| edit-report | Edit existing reports | Manager, Admin |
| delete-report | Delete reports | Manager, Admin |
| approve-report | Approve reports and accept bids | Manager, Admin |
| bid-on-report | Submit bids to fix issues | Bidder, Admin |
| donate-to-task | Donate money to fund fixes | User, Bidder, Manager, Admin |

## Bidding System

### How it Works

1. **Report Creation**: A user creates a report about an infrastructure issue
2. **Bidding**: Bidders can submit bids with an amount and description to fix the issue
3. **Donations**: Other users can donate money to help fund the fix
4. **Bid Acceptance**: When donations meet or exceed a bid amount, managers/admins can accept that bid
5. **Task Assignment**: The accepted bidder gets assigned to fix the issue
6. **Completion**: When the work is done, managers/admins mark the bid as completed

### Bid Lifecycle

```
Pending → Accepted → Completed
        ↓
     Rejected
```

- **Pending**: Bid has been submitted and awaiting review
- **Accepted**: Bid has been accepted and bidder is assigned to the task
- **Rejected**: Bid was not accepted (automatically happens when another bid is accepted)
- **Completed**: Work has been finished

### Business Rules

1. Multiple bidders can submit bids on the same report
2. Only one bid can be accepted per report
3. A bid can only be accepted if total donations >= bid amount
4. When a bid is accepted, all other pending bids are automatically rejected
5. The report status changes to "in-progress" when a bid is accepted
6. The report status changes to "fixed" when the bid is marked as completed

## Donations System

### How it Works

- Users can donate any amount to a report
- Donations are tracked per report
- Total donations determine which bids can be accepted
- Donations help crowdfund infrastructure fixes

### Example Flow

```
1. User reports a pothole
2. Bidder A bids $100 to fix it
3. Bidder B bids $80 to fix it
4. User C donates $50
5. User D donates $40
6. Total donations: $90
7. Manager can accept Bidder B's $80 bid (sufficient funds)
8. Bidder B fixes the pothole
9. Manager marks the bid as completed
10. Report status becomes "fixed"
```

## Assigning Roles

### Via Tinker (Development)

```bash
php artisan tinker
```

```php
// Get a user
$user = User::find(1);

// Assign a role
$user->assignRole('Bidder');

// Assign multiple roles
$user->assignRole(['User', 'Bidder']);

// Check if user has role
$user->hasRole('Admin'); // returns boolean

// Remove role
$user->removeRole('Bidder');
```

### Programmatically

```php
// In a controller or service
use App\Models\User;

$user = User::find($userId);
$user->assignRole('Manager');
```

## Checking Permissions

### In Controllers

```php
// Check permission
if (!$request->user()->can('bid-on-report')) {
    abort(403, 'You do not have permission to bid on reports.');
}

// Alternative
$this->authorize('bid-on-report');
```

### In Blade Templates

```blade
@can('edit-report')
    <button>Edit Report</button>
@endcan

@role('Admin')
    <button>Admin Only Button</button>
@endrole
```

### In Routes

```php
Route::middleware(['permission:edit-report'])->group(function () {
    Route::patch('/reports/{report}', [ReportController::class, 'update']);
});
```

## API Examples

### Submit a Bid

```bash
POST /reports/{report_id}/bids
Content-Type: application/json

{
    "amount": 150.00,
    "description": "I can fix this within 2 days with quality materials"
}
```

### Accept a Bid

```bash
PATCH /bids/{bid_id}/accept
```

### Make a Donation

```bash
POST /reports/{report_id}/donations
Content-Type: application/json

{
    "amount": 25.00,
    "message": "Happy to help fix our neighborhood!"
}
```

## Database Schema

### Bids Table
- `id`: Primary key
- `report_id`: Foreign key to reports
- `user_id`: Foreign key to users (the bidder)
- `amount`: Bid amount (decimal)
- `description`: Bid description (text)
- `status`: Enum (pending, accepted, rejected, completed)
- `created_at`, `updated_at`: Timestamps

### Donations Table
- `id`: Primary key
- `report_id`: Foreign key to reports
- `user_id`: Foreign key to users (the donor)
- `amount`: Donation amount (decimal)
- `message`: Optional message (text)
- `created_at`, `updated_at`: Timestamps

### Reports Table (Updated)
- Added `assigned_bid_id`: Foreign key to bids (nullable)

## Testing

Run the test suite:

```bash
# Run all permission tests
php artisan test --filter=RolesAndPermissionsTest

# Run all bid tests
php artisan test --filter=BidTest

# Run all tests
php artisan test
```

## Seeding Roles and Permissions

The roles and permissions are automatically seeded when you run:

```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

This creates:
- 4 roles (Admin, Manager, Bidder, User)
- 7 permissions
- Assigns appropriate permissions to each role

## Best Practices

1. **Always check permissions** before allowing actions in controllers
2. **Use roles for broad access** (e.g., "Admin" gets everything)
3. **Use permissions for specific actions** (e.g., "can edit reports")
4. **Assign roles to users, not direct permissions** (easier to manage)
5. **Test permission checks** to ensure security

## Troubleshooting

### Permission not working?

1. Clear permission cache:
   ```bash
   php artisan permission:cache-reset
   ```

2. Verify role assignment:
   ```php
   $user->roles; // Should show assigned roles
   $user->permissions; // Should show permissions
   ```

3. Check if seeder ran:
   ```bash
   php artisan tinker
   \Spatie\Permission\Models\Role::count(); // Should be 4
   \Spatie\Permission\Models\Permission::count(); // Should be 7
   ```

## Support

For more information on Spatie Laravel Permission, see the [official documentation](https://spatie.be/docs/laravel-permission).
