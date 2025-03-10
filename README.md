# PIKNIK - Potluck Event Organizer

PIKNIK is a web application that helps you organize potluck events with friends and family. No more spreadsheets or group texts to keep track of who's bringing what!

## Features

- Create potluck events with dates, themes, and descriptions
- Add items that need to be brought to the event
- Share a link with guests so they can sign up to bring items
- View event details and manage signups

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [node-postgres](https://node-postgres.com/) - PostgreSQL client for Node.js
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - UI components

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

This application can be deployed to any platform that supports Next.js applications, such as Vercel, Netlify, or your own server.

Remember to set up your production PostgreSQL database and update the `DATABASE_URL` environment variable accordingly.

## License

This project is licensed under the MIT License. 