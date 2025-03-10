"use server"

import { revalidatePath } from "next/cache"
import { query } from "./db"
import { generateEventCode, generateSecureToken } from "./utils"

// This would connect to your database in a real implementation
// For now, we'll simulate the actions

interface PotluckCreateInput {
  name: string
  date: Date | string
  theme?: string
  location?: string
  description?: string
  adminEmail: string
  adminName?: string
  items?: Array<{ name: string; quantity: number }>
}

export async function createPotluck(data: PotluckCreateInput): Promise<{ eventCode: string; adminToken: string }> {
  // Generate unique event code and admin token
  // Add defensive code to ensure these are never undefined
  let eventCode = generateEventCode();
  let adminToken = generateSecureToken();
  
  // Fallback values in case the generators fail (should never happen)
  if (!eventCode) {
    console.error('Event code generation failed, using fallback');
    eventCode = `FALL-BACK${Date.now().toString().slice(-4)}`;
  }
  
  if (!adminToken) {
    console.error('Admin token generation failed, using fallback');
    adminToken = `fallback-token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  try {
    // Insert the potluck
    const potluckResult = await query(
      `INSERT INTO potlucks (event_code, admin_token, name, date, theme, location, description, admin_email, admin_name, notifications_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, event_code, admin_token`,
      [
        eventCode,
        adminToken,
        data.name,
        new Date(data.date),
        data.theme || null,
        data.location || null,
        data.description || null,
        data.adminEmail,
        data.adminName || null,
        true
      ]
    );

    // Verify the result has the required data
    if (!potluckResult.rows || potluckResult.rows.length === 0) {
      throw new Error('Failed to create potluck: No rows returned');
    }

    const potluckId = potluckResult.rows[0].id;
    
    // Double check that we have valid values from the database
    // This guards against database issues where NULL might be returned
    const dbEventCode = potluckResult.rows[0].event_code || eventCode;
    const dbAdminToken = potluckResult.rows[0].admin_token || adminToken;

    // Insert items if provided
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        await query(
          `INSERT INTO potluck_items (potluck_id, name, quantity)
           VALUES ($1, $2, $3)`,
          [potluckId, item.name, item.quantity]
        );
      }
    }

    // Return the event code and admin token, with guaranteed values
    return {
      eventCode: dbEventCode,
      adminToken: dbAdminToken
    };
  } catch (error) {
    console.error('Error creating potluck:', error);
    throw error;
  }
}

export async function updateNotificationSettings(eventCode: string, adminToken: string, enabled: boolean): Promise<void> {
  // Verify the admin token matches this potluck
  const potluckResult = await query(
    `SELECT id FROM potlucks 
     WHERE event_code = $1 AND admin_token = $2`,
    [eventCode, adminToken]
  );

  if (potluckResult.rows.length === 0) {
    throw new Error('Unauthorized: Invalid admin token');
  }

  const potluckId = potluckResult.rows[0].id;

  await query(
    `UPDATE potlucks
     SET notifications_enabled = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [enabled, potluckId]
  );

  revalidatePath(`/admin/${eventCode}`);
}

export async function messageParticipant(eventCode: string, adminToken: string, participantToken: string, message: string): Promise<void> {
  // Verify the admin token matches this potluck
  const potluckResult = await query(
    `SELECT id FROM potlucks 
     WHERE event_code = $1 AND admin_token = $2`,
    [eventCode, adminToken]
  );

  if (potluckResult.rows.length === 0) {
    throw new Error('Unauthorized: Invalid admin token');
  }

  const potluckId = potluckResult.rows[0].id;

  // Get participant information
  const participantResult = await query(
    `SELECT p.* FROM participants p
     WHERE p.token = $1 AND p.potluck_id = $2`,
    [participantToken, potluckId]
  );

  if (participantResult.rows.length === 0) {
    throw new Error('Participant not found or not associated with this potluck');
  }

  const participant = participantResult.rows[0];

  // In a real implementation, you would send an email to the participant
  console.log(`Sending message to ${participant.email}: ${message}`);
}

interface SignupParams {
  eventCode: string
  itemId: string
  email: string
  name?: string
  quantity: number
}

export async function signUpForItem(params: SignupParams): Promise<{ participantToken: string }> {
  const { eventCode, itemId, email, name, quantity } = params;

  try {
    // Log the exact params for debugging
    console.log('Sign up params:', { eventCode, itemId, email, name, quantity });

    // Get the potluck ID from the event code
    const potluckResult = await query(
      `SELECT * FROM potlucks WHERE event_code = $1`,
      [eventCode]
    );

    // Log the query results for debugging
    console.log('Potluck lookup result:', potluckResult.rows);

    if (potluckResult.rows.length === 0) {
      // If we still can't find it, try a case-insensitive search as a fallback
      const fuzzyResult = await query(
        `SELECT * FROM potlucks WHERE LOWER(event_code) = LOWER($1)`,
        [eventCode]
      );
      
      if (fuzzyResult.rows.length === 0) {
        throw new Error(`Potluck not found with event code: ${eventCode}`);
      }
      
      console.log('Found potluck with case-insensitive search:', fuzzyResult.rows[0]);
      potluckResult.rows = fuzzyResult.rows;
    }

    const potluckId = potluckResult.rows[0].id;

    // Check if the item exists and belongs to the potluck
    const itemResult = await query(
      `SELECT * FROM potluck_items
       WHERE id = $1 AND potluck_id = $2`,
      [itemId, potluckId]
    );

    // Log the item query results for debugging
    console.log('Item lookup result:', itemResult.rows);

    if (itemResult.rows.length === 0) {
      throw new Error(`Item not found or does not belong to this potluck (ID: ${itemId}, Potluck ID: ${potluckId})`);
    }

    // First, check if the participant already exists
    let participantResult = await query(
      `SELECT * FROM participants
       WHERE email = $1 AND potluck_id = $2`,
      [email, potluckId]
    );

    let participantId;
    let participantToken;

    // If not, create the participant with a secure token
    if (participantResult.rows.length === 0) {
      // Generate a token with fallback
      participantToken = generateSecureToken();
      
      // Ensure token is never undefined
      if (!participantToken) {
        console.error('Participant token generation failed, using fallback');
        participantToken = `participant-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      }
      
      const newParticipantResult = await query(
        `INSERT INTO participants (token, email, name, potluck_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, token`,
        [participantToken, email, name || null, potluckId]
      );
      
      if (!newParticipantResult.rows || newParticipantResult.rows.length === 0) {
        throw new Error('Failed to create participant: No rows returned');
      }
      
      participantId = newParticipantResult.rows[0].id;
      // Double-check token from database
      participantToken = newParticipantResult.rows[0].token || participantToken;
    } else {
      participantId = participantResult.rows[0].id;
      participantToken = participantResult.rows[0].token;
      
      // Handle case where existing participant has no token (migration scenario)
      if (!participantToken) {
        participantToken = generateSecureToken();
        if (!participantToken) {
          participantToken = `participant-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        }
        
        // Update the participant with a new token
        await query(
          `UPDATE participants SET token = $1 WHERE id = $2 RETURNING token`,
          [participantToken, participantId]
        );
      }
    }

    // Check if the participant already signed up for this item
    const existingSignupResult = await query(
      `SELECT * FROM item_signups
       WHERE participant_id = $1 AND item_id = $2`,
      [participantId, itemId]
    );

    if (existingSignupResult.rows.length > 0) {
      // Update the existing signup
      await query(
        `UPDATE item_signups
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [quantity, existingSignupResult.rows[0].id]
      );
    } else {
      // Create a new signup
      await query(
        `INSERT INTO item_signups (participant_id, item_id, quantity)
         VALUES ($1, $2, $3)`,
        [participantId, itemId, quantity]
      );
    }

    revalidatePath(`/potluck/${eventCode}`);
    
    // Final safety check to ensure token is never undefined
    if (!participantToken) {
      console.error('Participant token is still undefined, generating emergency token');
      participantToken = `emergency-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    
    return { participantToken };
  } catch (error) {
    console.error('Error signing up for item:', error);
    throw error;
  }
}

