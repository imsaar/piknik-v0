# Setting Up Supabase for PIKNIK

This document provides a detailed guide for setting up a Supabase PostgreSQL database for your PIKNIK application.

## Why Supabase?

[Supabase](https://supabase.com) is an excellent choice for PIKNIK because:

1. **Open Source Firebase Alternative**: Supabase provides PostgreSQL databases with authentication, storage, and realtime features
2. **PostgreSQL Compatible**: PIKNIK is designed to work with PostgreSQL, making Supabase a perfect fit
3. **Generous Free Tier**: Free tier includes 500MB database, 1GB file storage, and 2GB bandwidth
4. **Simple Dashboard**: User-friendly interface for managing your database
5. **Built-in Authentication**: Can be leveraged for future enhancements of PIKNIK
6. **Automatic Backups**: Daily backups are included even on the free tier

## Step 1: Create a Supabase Account and Project

1. Sign up for a free Supabase account at [supabase.com](https://supabase.com)

2. After signing in, click the "New Project" button

3. Fill out the project details:
   - **Name**: Choose a name for your project (e.g., "piknik")
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose a region closest to your users
   - **Pricing Plan**: Start with the Free tier

4. Click "Create new project" and wait for your database to be provisioned (usually takes 1-2 minutes)

## Step 2: Get Your Database Connection Information

Once your project is created, you'll need to get your database connection string:

1. In your Supabase dashboard, navigate to the "Settings" icon in the sidebar
2. Select "Database" from the menu
3. Scroll down to the "Connection string" section
4. Click on "URI" to see the PostgreSQL connection string format
5. Copy the connection string. It should look something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your database password from Step 1

## Step 3: Configure PIKNIK to Use Supabase

### For Local Development

1. Update your `.env` file with the Supabase connection string:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres?sslmode=require"
   ```

   Note the addition of `?sslmode=require` at the end - this is required for connecting to Supabase.

2. Run the database migrations:
   ```bash
   npm run db:migrate
   ```

### For Vercel Deployment

1. Add your Supabase connection string as an environment variable in Vercel:
   - Go to your project dashboard in Vercel
   - Navigate to "Settings" → "Environment Variables"
   - Add a variable with name `DATABASE_URL` and the Supabase connection string as the value
   - Include `?sslmode=require` at the end of the connection string

2. Ensure the `RUN_MIGRATIONS` environment variable is set to `true` (it should be configured in your `vercel.json`)

## Step 4: Supabase SSL Configuration

Supabase requires SSL for all connections. The PIKNIK application already includes SSL support in the `prepare-production.js` script. If you're connecting directly or through other scripts, remember to include the SSL configuration:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

## Step 5: Exploring Your Database

Supabase provides a handy SQL editor and database management interface:

1. In your Supabase dashboard, click on "Table Editor" in the sidebar to see your tables after migration
2. Click on "SQL Editor" to run custom SQL queries
3. You can view and manage your database structure, create indices, and more through the interface

## Troubleshooting Supabase Connections

### Connection Refused Issues

If you see connection refused errors:

1. Verify your connection string is correct
2. Ensure you've added `?sslmode=require` to the connection string
3. Check that the IP address you're connecting from is allowed (Supabase allows connections from anywhere by default)

### SSL Errors

If you encounter SSL-related errors:

1. Make sure you're using the SSL configuration in your database connection code
2. Try setting `rejectUnauthorized: false` in your SSL config if you continue to have issues

### Database Migration Failures

If migrations fail:

1. Check the Supabase logs in the Dashboard under "Database" → "Logs"
2. Verify that the Postgres user has sufficient permissions
3. Make sure your tables don't already exist (you may need to drop existing tables if doing a fresh setup)

## Advanced Features

### Using Supabase Auth (Future Enhancement)

Supabase offers a built-in authentication system that could be integrated into PIKNIK in the future:

1. Navigate to "Authentication" → "Providers" in your Supabase dashboard
2. Enable the authentication providers you want to use
3. Update your application code to use Supabase Auth

### Realtime Updates (Future Enhancement)

Supabase provides realtime functionality that could be used to update the PIKNIK UI when other users make changes:

1. Enable realtime in your Supabase dashboard under "Database" → "Replication"
2. Select the tables you want to enable realtime for
3. Implement the Supabase client in your frontend code

## Further Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase GitHub Repository](https://github.com/supabase/supabase) 