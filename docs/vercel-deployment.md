# Deploying PIKNIK to Vercel

This document provides detailed instructions for deploying PIKNIK to Vercel, including configuration, database setup, and troubleshooting tips.

## Why Vercel?

Vercel is the preferred deployment platform for PIKNIK because:
1. It's built by the same team behind Next.js, ensuring optimal compatibility
2. It offers a generous free tier for personal projects
3. It provides seamless CI/CD integration with Git repositories
4. It has built-in analytics, logs, and performance monitoring
5. It handles environment variables securely

## Prerequisites

Before deploying to Vercel, you'll need:

1. **A Vercel Account**
   - Sign up at [vercel.com](https://vercel.com) if you don't already have an account
   - You can sign up using your GitHub, GitLab, or Bitbucket account

2. **A PostgreSQL Database**
   - You need a production PostgreSQL database accessible from the internet
   - Recommended providers:
     - [Supabase](https://supabase.com) (recommended, includes a generous free tier and detailed setup instructions in our [Supabase guide](supabase-setup.md))
     - [Neon](https://neon.tech) (serverless PostgreSQL with free tier)
     - [Railway](https://railway.app) (easy setup with GitHub integration)
     - [Render](https://render.com) (simple PostgreSQL hosting)
     - [DigitalOcean](https://www.digitalocean.com/products/managed-databases/) (managed database service)

3. **Your PIKNIK Code in a Git Repository**
   - Hosted on GitHub, GitLab, or Bitbucket
   - Make sure your repository is up to date with all changes

## Step 1: Set Up Your PostgreSQL Database

1. Create an account with your chosen PostgreSQL provider
2. Create a new PostgreSQL database (name it `piknik` for consistency)
3. Create a secure user with password
4. Note down your connection string in this format:
   ```
   postgresql://username:password@hostname:port/database
   ```
5. Make sure your database is accessible from Vercel's IP addresses (most cloud providers handle this automatically)

## Step 2: Deploy to Vercel

### Option A: Deploy from the Vercel Dashboard

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your repository from GitHub, GitLab, or Bitbucket
4. Configure the project:
   - Framework Preset: Next.js (should be automatically detected)
   - Root Directory: `.` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. Add environment variables:
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string from Step 1
   - (Optional) Name: `NODE_ENV`
   - (Optional) Value: `production`
6. Click "Deploy"

### Option B: Deploy using Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Navigate to your project directory:
   ```bash
   cd piknik-v0
   ```
4. Deploy to Vercel:
   ```bash
   vercel
   ```
5. Follow the interactive prompts:
   - Set up and deploy: `Y`
   - Existing project: `N` (or `Y` if redeploying)
   - Link to directory: (press Enter for current)
   - Environment variables: Add `DATABASE_URL` when prompted

## Step 3: Initialize Your Database

The database schema will be automatically initialized during deployment since the required environment variables are configured in the `vercel.json` file.

1. The `vercel.json` file already includes:
   ```json
   "env": {
     "DATABASE_URL": "@database_url",
     "RUN_MIGRATIONS": "true"
   }
   ```

2. You need to create the `@database_url` environment variable in your Vercel project:
   - Go to your Vercel project dashboard
   - Navigate to the "Settings" tab
   - Under "Environment Variables," add:
     - Name: `DATABASE_URL`
     - Value: Your PostgreSQL connection string

3. Deploy your application, and the build process will automatically run the database migrations

Note: If you need to disable migrations for any reason, you can override the `RUN_MIGRATIONS` variable in your project settings.

## Step 4: Test Your Deployment

1. Visit your deployed application URL (provided by Vercel)
2. Create a test potluck to verify everything is working
3. Check that you can:
   - Create potlucks
   - Add items
   - Access the admin panel
   - Share participant links

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Double-check your `DATABASE_URL` environment variable
2. Ensure your database allows connections from Vercel's IP addresses
3. Some PostgreSQL providers require SSL. Make sure your connection string includes `?sslmode=require` if needed

### Build Errors

If the build fails:

1. Check the build logs in your Vercel dashboard
2. Common issues include:
   - Missing environment variables
   - Database connection failures
   - TypeScript or lint errors

### Deployment Troubleshooting

1. **Check Logs**: Vercel provides detailed logs for each deployment
2. **Verify Environment Variables**: Make sure all required variables are set
3. **Check Database**: Connect to your database directly to verify it's working
4. **Check API Routes**: Test your API routes directly to isolate frontend vs. backend issues

## Advanced Configuration

### Custom Domains

To use a custom domain:

1. Go to your project in the Vercel dashboard
2. Navigate to the "Domains" tab
3. Add your domain
4. Verify ownership (usually via DNS records)
5. Set up DNS records as instructed by Vercel

### Performance Monitoring

Vercel provides built-in analytics and performance monitoring:

1. Go to your project dashboard
2. Navigate to the "Analytics" tab
3. View performance metrics, including:
   - Core Web Vitals
   - Page load times
   - API routes performance

### Continuous Deployment

By default, Vercel deploys automatically when changes are pushed to your main branch.

To customize this behavior:
1. Go to your project settings
2. Navigate to the "Git" tab
3. Under "Production Branch," you can change which branch triggers production deployments
4. You can also set up preview deployments for other branches

## Further Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PIKNIK Issues](https://github.com/yourusername/piknik-v0/issues) - Report any deployment issues here 