# Wine Journal - Neon Database Setup Guide

This guide explains how to set up and configure the Neon database for the Wine Journal application.

## Overview

The Wine Journal application uses Neon (PostgreSQL) as its database to store user accounts and wine data. The application is configured to work with Vercel's serverless functions and the Neon serverless driver.

## Database Architecture

### Tables

1. **users** - Stores user account information
   - `id` (VARCHAR(255), PRIMARY KEY) - Unique user identifier
   - `email` (VARCHAR(255), UNIQUE) - User email address
   - `name` (VARCHAR(255)) - User display name
   - `password_hash` (VARCHAR(255)) - Bcrypt hashed password
   - `date_created` (TIMESTAMP) - Account creation timestamp

2. **wines** - Stores wine entries for each user
   - `id` (VARCHAR(255), PRIMARY KEY) - Unique wine identifier
   - `user_id` (VARCHAR(255), FOREIGN KEY) - References users.id
   - `name` (VARCHAR(255)) - Wine name
   - `vintage` (INTEGER) - Wine vintage year
   - `rating` (INTEGER, 1-5) - User rating
   - `notes` (TEXT) - Tasting notes
   - `photo` (TEXT) - Base64 encoded photo data
   - `date_created` (TIMESTAMP) - Entry creation timestamp

## Setup Instructions

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up or log in to your account
3. Create a new project
4. Note down your database connection string

### 2. Configure Environment Variables

#### For Local Development

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

#### For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `DATABASE_URL`: Your Neon database connection string
   - `VITE_ANTHROPIC_API_KEY`: Your Anthropic API key (optional, for wine photo analysis)

### 3. Initialize Database Tables

After deploying to Vercel or running locally, initialize the database by making a POST request to:

```
POST /api/init-db
```

This will create the necessary tables and indexes.

#### Using curl:
```bash
curl -X POST https://your-app.vercel.app/api/init-db
```

#### Using the browser:
You can also create a simple HTML page to trigger the initialization:

```html
<!DOCTYPE html>
<html>
<body>
  <button onclick="initDB()">Initialize Database</button>
  <script>
    async function initDB() {
      const response = await fetch('/api/init-db', { method: 'POST' });
      const result = await response.json();
      console.log(result);
      alert(JSON.stringify(result));
    }
  </script>
</body>
</html>
```

## API Endpoints

### Authentication (`/api/auth`)

- **POST** with `action: 'signup'` - Create new user account
- **POST** with `action: 'login'` - Authenticate user
- **POST** with `action: 'admin-login'` - Admin authentication
- **POST** with `action: 'get-all-users'` - Get all users (admin only)

### Wine Management (`/api/wines`)

- **POST** with `action: 'get-wines'` - Get user's wines
- **POST** with `action: 'add-wine'` - Add new wine entry
- **POST** with `action: 'update-wine'` - Update existing wine
- **POST** with `action: 'delete-wine'` - Delete wine entry

## Security Features

1. **Password Hashing**: Uses bcrypt with salt rounds of 10
2. **User Isolation**: All wine operations are scoped to the authenticated user
3. **Input Validation**: Email format and password strength validation
4. **SQL Injection Protection**: Uses parameterized queries via Neon's serverless driver
5. **Foreign Key Constraints**: Ensures data integrity between users and wines

## Database Service Layer

The application includes a `DatabaseService` class (`src/services/databaseService.ts`) that provides:

- User registration and authentication
- Wine CRUD operations
- Admin functionality
- Error handling and validation

## Client-Side Integration

### WineService (`src/services/wineService.ts`)
Handles all wine-related API calls from the frontend.

### AuthService (`src/services/authService.ts`)
Manages user authentication and session handling.

### Context Providers
- `WineContext` - Manages wine state and operations
- `AuthContext` - Manages authentication state

## Testing

The application includes comprehensive tests for:

- Database service operations
- API endpoint functionality
- Client-side service integration
- End-to-end user workflows

Run tests with:
```bash
npm test                # Unit tests
npm run test:e2e       # End-to-end tests
```

## Troubleshooting

### Common Issues

1. **Connection String Format**
   - Ensure your DATABASE_URL includes `?sslmode=require`
   - Verify the username, password, and hostname are correct

2. **Tables Not Created**
   - Make sure to call `/api/init-db` after deployment
   - Check Vercel function logs for any errors

3. **Authentication Issues**
   - Verify user exists in the database
   - Check password hashing is working correctly

4. **CORS Issues**
   - API routes are configured for same-origin requests
   - Ensure frontend and API are on the same domain

### Monitoring

- Check Vercel function logs for API errors
- Monitor Neon dashboard for database performance
- Use browser developer tools to debug client-side issues

## Production Considerations

1. **Connection Pooling**: Neon serverless driver handles this automatically
2. **Rate Limiting**: Consider implementing rate limiting for API endpoints
3. **Backup Strategy**: Neon provides automatic backups
4. **Monitoring**: Set up alerts for database errors and performance issues
5. **Security**: Regularly rotate database credentials and API keys

## Migration and Updates

When updating the database schema:

1. Create migration scripts in the `api/` directory
2. Test migrations on a staging environment first
3. Update the `init-db.ts` script for new installations
4. Document any breaking changes

## Support

For issues related to:
- Neon database: [Neon Documentation](https://neon.tech/docs)
- Vercel deployment: [Vercel Documentation](https://vercel.com/docs)
- Application-specific issues: Check the project's GitHub issues
