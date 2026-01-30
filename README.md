# StreetFixer

A platform for reporting local infrastructure issues (potholes, broken lights, etc.) to local authorities.

## Features

### Core Functionality
- **Report Creation**: Multi-step wizard to create infrastructure issue reports
- **Photo Upload**: Upload multiple photos with automatic EXIF GPS extraction
- **Spatial Triaging**: Automatically assign reports to the correct authority based on location
- **Duplicate Detection**: Check for existing reports within 50 meters before submission
- **Status Tracking**: Real-time status updates (Open, In Progress, Fixed, Closed)
- **Email Notifications**: Automatic notifications when report status changes
- **Comment System**: Users and officials can comment on reports

### Roles & Permissions
- **Role-Based Access Control**: Powered by Spatie Laravel Permission
- **4 User Roles**:
  - **User**: Can create reports, view reports, and donate to tasks
  - **Bidder**: Can bid on fixes, plus all User permissions
  - **Manager**: Can approve, edit, and delete reports, plus all User permissions
  - **Admin**: Full system access with all permissions
- **Granular Permissions**: create-report, edit-report, delete-report, approve-report, bid-on-report, donate-to-task, view-report

### Bidding & Donations System
- **Bidding on Fixes**: Bidders can submit bids with amounts and descriptions to fix reported issues
- **Bid Acceptance**: Managers/Admins can accept bids when sufficient donations are available
- **Crowdfunding**: Users can donate money to help fund the fixes
- **Automatic Assignment**: The bidder with the accepted bid gets assigned to the task
- **Bid Tracking**: All bids are tracked with status (pending, accepted, rejected, completed)

### Technical Stack
- **Backend**: Laravel 11.48 with PHP 8.3+
- **Frontend**: React 18 with TypeScript, Inertia.js
- **Styling**: Tailwind CSS
- **Database**: SQLite (configurable to MySQL/PostgreSQL with PostGIS)
- **Maps**: Leaflet.js integration ready
- **Build Tool**: Vite

## Installation

### Prerequisites
- PHP 8.3 or higher
- Composer
- Node.js 20+ and npm
- SQLite extension enabled

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/arslansiddiq/FixMyStreet.git
   cd FixMyStreet
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   touch database/database.sqlite
   php artisan migrate
   php artisan db:seed --class=RolesAndPermissionsSeeder
   ```

6. **Build frontend assets**
   ```bash
   npm run build
   ```

7. **Start the development server**
   ```bash
   php artisan serve
   ```

   In a separate terminal:
   ```bash
   npm run dev
   ```

8. **Access the application**
   Open your browser to `http://localhost:8000`

## Default Test Credentials

After seeding, you can use these credentials:
- **Email**: test@example.com
- **Password**: password

## Database Schema

### Tables

**users** - Standard Laravel users table
- id, name, email, password, email_verified_at, remember_token, timestamps

**authorities** - Local authorities/municipalities
- id, name, email, boundary (GeoJSON polygon), timestamps

**categories** - Issue categories
- id, name, timestamps

**reports** - Infrastructure issue reports
- id, title, description, lat, lng, status, user_id, category_id, authority_id, assigned_bid_id, timestamps

**bids** - Bids from contractors to fix issues
- id, report_id, user_id, amount, description, status, timestamps

**donations** - User donations to fund fixes
- id, report_id, user_id, amount, message, timestamps

**roles** - User roles (from Spatie Permission)
- id, name, guard_name, timestamps

**permissions** - System permissions (from Spatie Permission)
- id, name, guard_name, timestamps

**photos** - Report photos
- id, report_id, path, timestamps

**comments** - Report comments
- id, report_id, user_id, body, is_official, timestamps

## Services

### SpatialTriagingService
Automatically assigns reports to the correct authority based on geographic boundaries using point-in-polygon detection.

### DuplicateDetectionService
Finds existing open reports within a 50-meter radius using the Haversine formula for accurate distance calculation.

### ExifService
Extracts GPS coordinates from uploaded JPEG photos to automatically suggest location.

## API Endpoints

### Reports
- `GET /reports` - List all reports (with filtering)
- `GET /reports/create` - Show report creation form (requires create-report permission)
- `POST /reports` - Create a new report (requires create-report permission)
- `GET /reports/{id}` - Show report details
- `PATCH /reports/{id}` - Update report (requires edit-report or approve-report permission)
- `DELETE /reports/{id}` - Delete report (requires delete-report permission)
- `POST /reports/extract-gps` - Extract GPS from photo
- `POST /reports/check-duplicates` - Check for duplicate reports

### Bids
- `POST /reports/{report}/bids` - Submit a bid (requires bid-on-report permission)
- `PATCH /bids/{bid}/accept` - Accept a bid (requires approve-report permission)
- `PATCH /bids/{bid}/complete` - Mark bid as completed (requires approve-report permission)

### Donations
- `POST /reports/{report}/donations` - Make a donation (requires donate-to-task permission)

## Project Structure

```
app/
├── Events/              # Laravel events
├── Http/Controllers/    # Controllers
├── Listeners/          # Event listeners
├── Mail/               # Email templates
├── Models/             # Eloquent models
└── Services/           # Business logic services

resources/
├── js/
│   ├── Components/     # Reusable React components
│   ├── Layouts/        # Layout components
│   ├── Pages/          # Page components
│   │   ├── Auth/       # Authentication pages
│   │   ├── Profile/    # Profile pages
│   │   └── Reports/    # Report pages
│   └── types/          # TypeScript type definitions
└── views/              # Blade templates

database/
├── migrations/         # Database migrations
└── seeders/           # Database seeders
```

## Seeded Data

The database comes with:
- 8 default categories (Pothole, Graffiti, Lighting, etc.)
- 2 test authorities (San Francisco and Oakland)
- 4 roles with appropriate permissions (Admin, Manager, Bidder, User)
- 7 granular permissions for fine-grained access control

## Future Enhancements

- Full Leaflet.js map integration for interactive location selection
- Admin dashboard for authority management
- Real-time updates using Laravel Broadcasting
- Mobile app using React Native
- Advanced analytics and reporting
- Integration with municipal management systems

## Security

- CSRF protection on all forms
- SQL injection prevention via Eloquent ORM
- XSS protection via React
- File upload validation
- Input sanitization and validation
- Role-based access control using Spatie Laravel Permission
- Permission checks on all sensitive controller actions
- Proper authorization with Laravel's built-in gates and policies

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open-sourced software.

## Support

For support, email dev@streetfixer.local or open an issue on GitHub.
