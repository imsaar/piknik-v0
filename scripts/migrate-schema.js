// Script to migrate the database schema with new columns
require('dotenv').config();
const { Pool } = require('pg');
const crypto = require('crypto');

async function migrateSchema() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting schema migration...');

    // Update potlucks table - add event_code and admin_token if they don't exist
    await addColumn(pool, 'potlucks', 'event_code', 'VARCHAR(20)');
    await addColumn(pool, 'potlucks', 'admin_token', 'VARCHAR(64)');

    // Update participants table - add token if it doesn't exist
    await addColumn(pool, 'participants', 'token', 'VARCHAR(64)');

    // Add unique constraints
    await addUniqueConstraint(pool, 'potlucks', 'event_code');
    await addUniqueConstraint(pool, 'potlucks', 'admin_token');
    await addUniqueConstraint(pool, 'participants', 'token');

    // Generate values for existing records
    await generateTokensForExistingRecords(pool);
    
    // Normalize event codes
    await normalizeEventCodes(pool);
    
    // Create index on event_code if it doesn't exist
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS potlucks_event_code_idx ON potlucks (event_code);
      `);
      console.log('Created index on potlucks.event_code');
    } catch (err) {
      console.error('Error creating index:', err.message);
    }

    console.log('Schema migration completed successfully!');
  } catch (err) {
    console.error('Error during schema migration:', err.message);
  } finally {
    await pool.end();
  }
}

// Helper to add a column if it doesn't exist
async function addColumn(pool, table, column, dataType) {
  try {
    // Check if column already exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        AND column_name = $2
      )
    `, [table, column]);

    if (!checkResult.rows[0].exists) {
      console.log(`Adding column '${column}' to table '${table}'...`);
      await pool.query(`
        ALTER TABLE ${table} 
        ADD COLUMN ${column} ${dataType}
      `);
      console.log(`Column '${column}' added to table '${table}'`);
    } else {
      console.log(`Column '${column}' already exists in table '${table}'`);
    }
  } catch (err) {
    console.error(`Error adding column '${column}' to table '${table}':`, err.message);
    throw err;
  }
}

// Helper to add a unique constraint if needed
async function addUniqueConstraint(pool, table, column) {
  try {
    // Generate a constraint name
    const constraintName = `${table}_${column}_key`;
    
    // Check if constraint already exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = $1
        AND constraint_name = $2
      )
    `, [table, constraintName]);

    if (!checkResult.rows[0].exists) {
      console.log(`Adding unique constraint for '${column}' in table '${table}'...`);
      
      // First, check if all values are non-null to avoid constraint violation
      const nullCheck = await pool.query(`
        SELECT COUNT(*) FROM ${table} WHERE ${column} IS NULL
      `);
      
      if (parseInt(nullCheck.rows[0].count) > 0) {
        console.log(`Cannot add unique constraint to '${column}' in '${table}' - NULL values present`);
      } else {
        await pool.query(`
          ALTER TABLE ${table}
          ADD CONSTRAINT ${constraintName} UNIQUE (${column})
        `);
        console.log(`Unique constraint added for '${column}' in table '${table}'`);
      }
    } else {
      console.log(`Unique constraint already exists for '${column}' in table '${table}'`);
    }
  } catch (err) {
    console.error(`Error adding unique constraint for '${column}' in table '${table}':`, err.message);
    throw err;
  }
}

// Generate tokens for existing records
async function generateTokensForExistingRecords(pool) {
  try {
    // Check for existing potlucks without event_code or admin_token
    const potlucksToUpdate = await pool.query(`
      SELECT id FROM potlucks 
      WHERE event_code IS NULL OR admin_token IS NULL
    `);

    if (potlucksToUpdate.rows.length > 0) {
      console.log(`Generating codes and tokens for ${potlucksToUpdate.rows.length} existing potlucks...`);
      
      for (const potluck of potlucksToUpdate.rows) {
        // Generate event code: 4 letters + 4 digits
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const numbers = '23456789';
        
        let eventCode = '';
        for (let i = 0; i < 4; i++) {
          eventCode += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        eventCode += '-';
        for (let i = 0; i < 4; i++) {
          eventCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        // Generate admin token
        const adminToken = crypto.randomBytes(32).toString('hex');
        
        // Update the potluck
        await pool.query(`
          UPDATE potlucks 
          SET event_code = $1, admin_token = $2 
          WHERE id = $3
        `, [eventCode, adminToken, potluck.id]);
        
        console.log(`  Updated potluck id=${potluck.id} with event_code=${eventCode}`);
      }
    } else {
      console.log('No potlucks need updating');
    }
    
    // Check for existing participants without tokens
    const participantsToUpdate = await pool.query(`
      SELECT id FROM participants WHERE token IS NULL
    `);
    
    if (participantsToUpdate.rows.length > 0) {
      console.log(`Generating tokens for ${participantsToUpdate.rows.length} existing participants...`);
      
      for (const participant of participantsToUpdate.rows) {
        // Generate participant token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Update the participant
        await pool.query(`
          UPDATE participants SET token = $1 WHERE id = $2
        `, [token, participant.id]);
        
        console.log(`  Updated participant id=${participant.id} with token`);
      }
    } else {
      console.log('No participants need updating');
    }
  } catch (err) {
    console.error('Error generating tokens for existing records:', err.message);
    throw err;
  }
}

// Function to normalize event codes
async function normalizeEventCodes(pool) {
  try {
    console.log('Checking for potlucks that need event code normalization...');
    
    // Find all potlucks without properly formatted event codes
    const potlucksResult = await pool.query(`
      SELECT id, event_code FROM potlucks
      WHERE event_code IS NOT NULL 
      AND event_code NOT SIMILAR TO '[A-Z0-9]{4}-[A-Z0-9]{4}'
    `);
    
    if (potlucksResult.rows.length === 0) {
      console.log('No potlucks need event code normalization');
      return;
    }
    
    console.log(`Found ${potlucksResult.rows.length} potlucks to normalize`);
    
    for (const potluck of potlucksResult.rows) {
      // Extract the alphanumeric characters and normalize to uppercase
      const originalCode = potluck.event_code;
      const normalized = originalCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      
      // If we have at least 8 characters, format as XXXX-XXXX
      let formattedCode;
      if (normalized.length >= 8) {
        formattedCode = `${normalized.slice(0, 4)}-${normalized.slice(4, 8)}`;
      } else {
        // If there aren't enough characters, pad with random ones
        const randomChars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        let paddedCode = normalized;
        while (paddedCode.length < 8) {
          paddedCode += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        formattedCode = `${paddedCode.slice(0, 4)}-${paddedCode.slice(4, 8)}`;
      }
      
      // Update the potluck with the formatted code
      await pool.query(`
        UPDATE potlucks 
        SET event_code = $1 
        WHERE id = $2
      `, [formattedCode, potluck.id]);
      
      console.log(`  Updated potluck ID ${potluck.id}: ${originalCode} → ${formattedCode}`);
    }
    
    console.log('Event code normalization completed');
  } catch (err) {
    console.error('Error normalizing event codes:', err.message);
    throw err;
  }
}

migrateSchema(); 