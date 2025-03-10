"use server"

import { revalidatePath } from "next/cache"
import { query } from "./db"
import { v4 as uuidv4 } from 'uuid'

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

export async function createPotluck(data: PotluckCreateInput): Promise<{ id: string; adminId: string }> {
  // Insert the potluck
  const potluckResult = await query(
    `INSERT INTO potlucks (name, date, theme, location, description, admin_email, admin_name, notifications_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
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

  const potluckId = potluckResult.rows[0].id;

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

  // In a real app, you would generate an admin token or use authentication
  const adminId = `admin_${potluckId}`;

  return { id: potluckId.toString(), adminId };
}

export async function updateNotificationSettings(potluckId: string, enabled: boolean): Promise<void> {
  await query(
    `UPDATE potlucks
     SET notifications_enabled = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [enabled, potluckId]
  );

  revalidatePath(`/admin/${potluckId}`);
}

export async function messageParticipant(potluckId: string, participantId: string, message: string): Promise<void> {
  // Get participant information
  const participantResult = await query(
    `SELECT p.*, po.id as potluck_id
     FROM participants p
     JOIN potlucks po ON p.potluck_id = po.id
     WHERE p.id = $1`,
    [participantId]
  );

  if (participantResult.rows.length === 0 || participantResult.rows[0].potluck_id.toString() !== potluckId) {
    throw new Error('Participant not found or not associated with this potluck');
  }

  const participant = participantResult.rows[0];

  // In a real implementation, you would send an email to the participant
  console.log(`Sending message to ${participant.email}: ${message}`);
}

interface SignupParams {
  potluckId: string
  itemId: string
  email: string
  name?: string
  quantity: number
}

export async function signUpForItem(params: SignupParams): Promise<void> {
  const { potluckId, itemId, email, name, quantity } = params;

  // First, check if the participant already exists
  let participantResult = await query(
    `SELECT * FROM participants
     WHERE email = $1 AND potluck_id = $2`,
    [email, potluckId]
  );

  let participantId;

  // If not, create the participant
  if (participantResult.rows.length === 0) {
    const newParticipantResult = await query(
      `INSERT INTO participants (email, name, potluck_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [email, name || null, potluckId]
    );
    participantId = newParticipantResult.rows[0].id;
  } else {
    participantId = participantResult.rows[0].id;
  }

  // Check if the item exists and belongs to the potluck
  const itemResult = await query(
    `SELECT * FROM potluck_items
     WHERE id = $1 AND potluck_id = $2`,
    [itemId, potluckId]
  );

  if (itemResult.rows.length === 0) {
    throw new Error('Item not found or does not belong to this potluck');
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

  revalidatePath(`/potluck/${potluckId}`);
}

