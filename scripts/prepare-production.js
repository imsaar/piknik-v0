#!/usr/bin/env node

/**
 * Production Database Preparation Script
 * 
 * This script is designed to run at build time on Vercel or other deployment platforms.
 * It will run the database migrations and setup when the RUN_MIGRATIONS environment variable is set.
 */

require('dotenv').config();
const { Pool } = require('pg');
const { execSync } = require('child_process');

// Only run if RUN_MIGRATIONS is set
if (process.env.RUN_MIGRATIONS !== 'true') {
  console.log('Skipping production database preparation. Set RUN_MIGRATIONS=true to enable.');
  process.exit(0);
}

async function prepareDatabaseForProduction() {
  console.log('Starting production database preparation...');
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set!');
    process.exit(1);
  }
  
  // Check if the connection string contains Supabase
  const isSupabase = process.env.DATABASE_URL.includes('supabase.co');
  
  // Configure SSL based on environment or database provider
  const sslConfig = process.env.DATABASE_SSL === 'true' || isSupabase || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false;
  
  console.log(`Using SSL configuration: ${sslConfig ? 'enabled' : 'disabled'}`);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
  });
  
  try {
    console.log('Connecting to database...');
    
    // Test database connection
    const client = await pool.connect();
    console.log('Database connection successful!');
    
    // Import the migration script and run it
    console.log('Running schema migrations...');
    const { migrateSchema } = require('./migrate-schema');
    await migrateSchema(pool);
    
    console.log('Production database preparation completed successfully!');
    client.release();
  } catch (error) {
    console.error('Error during production database preparation:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

prepareDatabaseForProduction(); 