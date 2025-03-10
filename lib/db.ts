import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to execute SQL queries
export async function query(text: string, params?: any[]) {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  }
}

// Initialize the database schema
export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    
    // Potluck table
    await query(`
      CREATE TABLE IF NOT EXISTS potlucks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date TIMESTAMP NOT NULL,
        theme VARCHAR(255),
        location VARCHAR(255),
        description TEXT,
        admin_email VARCHAR(255) NOT NULL,
        admin_name VARCHAR(255),
        notifications_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // PotluckItem table
    await query(`
      CREATE TABLE IF NOT EXISTS potluck_items (
        id SERIAL PRIMARY KEY,
        potluck_id INTEGER REFERENCES potlucks(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Participant table
    await query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        potluck_id INTEGER REFERENCES potlucks(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, potluck_id)
      )
    `);

    // ItemSignup table
    await query(`
      CREATE TABLE IF NOT EXISTS item_signups (
        id SERIAL PRIMARY KEY,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES potluck_items(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(participant_id, item_id)
      )
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema', error);
    throw error;
  }
}

export default pool; 