# PIKNIK - Potluck Event Organizer

PIKNIK is a web application that helps you organize potluck events with friends and family. No more spreadsheets or group texts to keep track of who's bringing what!

## Features

- Create potluck events with dates, themes, and descriptions
- Add items that need to be brought to the event
- Share a link with guests so they can sign up to bring items
- View event details and manage signups
- Secure, non-guessable event codes and authentication tokens
- User-friendly sharing links with memorable event codes

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [node-postgres](https://node-postgres.com/) - PostgreSQL client for Node.js
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components

## Security Features

PIKNIK uses several security features to protect your potluck events:

- **Event Codes**: Human-readable unique identifiers for potlucks (e.g., `ABCD-2345`)
- **Admin Tokens**: Cryptographically secure tokens for potluck management
- **Participant Tokens**: Secure tokens for participants that map to their profiles

These features provide a secure way to share potluck links while protecting against unauthorized access. 
For more details, see [security documentation](docs/security.md).

## Prerequisites

- Node.js 14 or higher
- PostgreSQL database

## Getting Started

### Quick Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd piknik-v0
```

2. Run the setup script:

```bash
./setup.sh
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Manual Setup

If you prefer to set up the application manually:

1. Clone the repository:

```bash
git clone <repository-url>
cd piknik-v0
```

2. Install dependencies:

```bash
npm install
```

3. Set up your PostgreSQL database:

Make sure you have PostgreSQL installed and running. Then create a database named `piknik`:

```bash
createdb piknik
```

4. Configure environment variables:

Copy the example environment file and update it with your PostgreSQL connection details:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in the `.env` file if your PostgreSQL configuration differs from the default.

5. Run database migrations:

```bash
npm run migrate
```

6. Start the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following database schema:

- **potlucks**: Stores information about potluck events
- **potluck_items**: Items that need to be brought to the potluck
- **participants**: People who have signed up to bring items
- **item_signups**: Tracks which participants are bringing which items

## Deployment

### Database Options

PIKNIK supports multiple PostgreSQL database providers:

1. **Local PostgreSQL** - For development and self-hosted deployments
2. **[Supabase](https://supabase.com)** - Open-source Firebase alternative with a generous free tier
   - See [Supabase setup guide](docs/supabase-setup.md) for detailed instructions
3. **Other PostgreSQL providers** - Any PostgreSQL-compatible database service will work

### Deploying to Vercel

PIKNIK is optimized for deployment on [Vercel](https://vercel.com), the platform built by the creators of Next.js. Here's how to deploy your PIKNIK instance to Vercel:

#### Prerequisites for Deployment

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (options include [Supabase](https://supabase.com), [Neon](https://neon.tech), [Railway](https://railway.app), or any other PostgreSQL provider)
3. Git repository with your PIKNIK code (GitHub, GitLab, or Bitbucket)

#### Deployment Steps

1. **Set up a PostgreSQL Database**

   Set up a PostgreSQL database with your preferred provider. Make sure to:
   - Create a new database named `piknik` (or your preferred name)
   - Secure your database with strong credentials
   - Note down the connection string, which follows this format:
     ```
     postgresql://username:password@hostname:port/database
     ```

2. **Deploy to Vercel**

   **Option A: Deploy from the Vercel Dashboard**
   
   1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
   2. Click "Add New Project"
   3. Import your repository from GitHub, GitLab, or Bitbucket
   4. Configure the project:
      - Framework Preset: Next.js
      - Root Directory: `.` (default)
      - Build and Output Settings: Leave as default
   5. Add the environment variable:
      - Name: `DATABASE_URL`
      - Value: Your PostgreSQL connection string
   6. Click "Deploy"

   **Option B: Deploy using Vercel CLI**
   
   1. Install the Vercel CLI:
      ```bash
      npm install -g vercel
      ```
   
   2. Login to Vercel:
      ```bash
      vercel login
      ```
   
   3. Navigate to your project directory and deploy:
      ```bash
      cd piknik-v0
      vercel
      ```
   
   4. Follow the interactive prompts:
      - Set up and deploy: Yes
      - Existing project: No (or Yes if redeploying)
      - Link to directory: (press Enter for current)
      - Environment variables: Add DATABASE_URL when prompted

3. **Initialize the Database Schema**

   The database schema will be automatically initialized during deployment if you set up the environment variables correctly:
   
   1. Go to your Vercel project dashboard
   2. Navigate to the "Settings" tab and then "Environment Variables"
   3. Add these environment variables:
      - Name: `DATABASE_URL`
      - Value: Your PostgreSQL connection string
      
      - Name: `RUN_MIGRATIONS`
      - Value: `true`
   4. Deploy your application
   5. The build process will automatically run the database migrations

   Note: The `RUN_MIGRATIONS` variable is already configured in the `vercel.json` file, but you can override it in your project settings if needed.

4. **Verify Deployment**

   1. Visit your deployed application URL (provided by Vercel)
   2. Create a test potluck to verify everything is working correctly
   3. If you encounter any issues, check the logs in your Vercel dashboard

### Custom Domain Setup (Optional)

To use a custom domain with your PIKNIK deployment:

1. Go to your project in the Vercel dashboard
2. Navigate to the "Domains" tab
3. Add your domain and follow the verification steps
4. Update your domain's DNS settings as instructed by Vercel

### Continuous Deployment

Vercel automatically sets up continuous deployment from your Git repository. Any changes pushed to your main branch will be automatically deployed.

To change this behavior:
1. Go to your project settings in Vercel
2. Navigate to the "Git" tab
3. Under "Production Branch," you can change which branch triggers production deployments

### Monitoring and Logs

To monitor your application:
1. Go to your project in the Vercel dashboard
2. Navigate to the "Analytics" tab for performance metrics
3. Check the "Logs" tab to troubleshoot any issues

This application can also be deployed to other platforms that support Next.js applications, such as Netlify or your own server.

## License

This project is licensed under the MIT License. 