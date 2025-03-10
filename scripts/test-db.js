// Script to test the database connection
require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current database time:', result.rows[0].now);
    
    // Test if tables exist
    console.log('\nChecking if tables exist...');
    const tables = ['potlucks', 'potluck_items', 'participants', 'item_signups'];
    
    for (const table of tables) {
      try {
        const tableResult = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [table]);
        
        if (tableResult.rows[0].exists) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' does not exist`);
        }
      } catch (err) {
        console.error(`Error checking table '${table}':`, err.message);
      }
    }
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection(); 