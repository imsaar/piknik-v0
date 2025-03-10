#!/bin/bash

# Exit on error
set -e

echo "Setting up PIKNIK application..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install PostgreSQL and try again."
    exit 1
fi

# Check if the database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw piknik; then
    echo "Creating piknik database..."
    createdb piknik
else
    echo "Database piknik already exists."
fi

# Test database connection
echo "Testing database connection..."
npm run db:test

echo "Setup complete! You can now run the application with:"
echo "npm run dev" 