import type { Potluck, PotluckItem, Participant, ItemSignup } from "./types"
import { query } from "./db"

// This would connect to your database in a real implementation
// For now, we'll return mock data

export async function getPotluckForAdmin(id: string): Promise<Potluck | null> {
  try {
    // Get the potluck
    const potluckResult = await query(
      `SELECT * FROM potlucks WHERE id = $1`,
      [id]
    );

    if (potluckResult.rows.length === 0) {
      return null;
    }

    const potluck = potluckResult.rows[0];

    // Get the items
    const itemsResult = await query(
      `SELECT * FROM potluck_items WHERE potluck_id = $1`,
      [id]
    );

    // Get the participants
    const participantsResult = await query(
      `SELECT * FROM participants WHERE potluck_id = $1`,
      [id]
    );

    // Get the signups
    const signupsResult = await query(
      `SELECT s.*, p.email as participant_email, p.name as participant_name, 
              i.name as item_name, i.quantity as item_quantity
       FROM item_signups s
       JOIN participants p ON s.participant_id = p.id
       JOIN potluck_items i ON s.item_id = i.id
       WHERE p.potluck_id = $1`,
      [id]
    );

    // Map items with their signups
    const items: PotluckItem[] = itemsResult.rows.map(item => {
      const itemSignups = signupsResult.rows
        .filter(signup => signup.item_id === item.id)
        .map(signup => {
          return {
            id: signup.id.toString(),
            quantity: signup.quantity,
            participant: {
              id: signup.participant_id.toString(),
              email: signup.participant_email,
              name: signup.participant_name || undefined,
              signups: []
            },
            item: {
              id: item.id.toString(),
              name: item.name,
              quantity: item.quantity,
              signups: []
            }
          } as ItemSignup;
        });

      return {
        id: item.id.toString(),
        name: item.name,
        quantity: item.quantity,
        signups: itemSignups
      } as PotluckItem;
    });

    // Map participants with their signups
    const participants: Participant[] = participantsResult.rows.map(participant => {
      const participantSignups = signupsResult.rows
        .filter(signup => signup.participant_id === participant.id)
        .map(signup => {
          const matchingItem = itemsResult.rows.find(item => item.id === signup.item_id);
          
          return {
            id: signup.id.toString(),
            quantity: signup.quantity,
            participant: {
              id: participant.id.toString(),
              email: participant.email,
              name: participant.name || undefined,
              signups: []
            },
            item: {
              id: matchingItem.id.toString(),
              name: matchingItem.name,
              quantity: matchingItem.quantity,
              signups: []
            }
          } as ItemSignup;
        });

      return {
        id: participant.id.toString(),
        email: participant.email,
        name: participant.name || undefined,
        signups: participantSignups
      } as Participant;
    });

    // Transform DB model to application model
    return {
      id: potluck.id.toString(),
      name: potluck.name,
      date: new Date(potluck.date).toISOString(),
      theme: potluck.theme || undefined,
      location: potluck.location || undefined,
      description: potluck.description || undefined,
      adminEmail: potluck.admin_email,
      adminName: potluck.admin_name || undefined,
      notificationsEnabled: potluck.notifications_enabled,
      items,
      participants
    };
  } catch (error) {
    console.error('Error fetching potluck for admin:', error);
    return null;
  }
}

export async function getPotluckForParticipant(id: string): Promise<Potluck | null> {
  try {
    // Get the potluck
    const potluckResult = await query(
      `SELECT * FROM potlucks WHERE id = $1`,
      [id]
    );

    if (potluckResult.rows.length === 0) {
      return null;
    }

    const potluck = potluckResult.rows[0];

    // Get the items
    const itemsResult = await query(
      `SELECT * FROM potluck_items WHERE potluck_id = $1`,
      [id]
    );

    // Get the signups
    const signupsResult = await query(
      `SELECT s.*, p.email as participant_email, p.name as participant_name, 
              i.name as item_name, i.quantity as item_quantity
       FROM item_signups s
       JOIN participants p ON s.participant_id = p.id
       JOIN potluck_items i ON s.item_id = i.id
       WHERE p.potluck_id = $1`,
      [id]
    );

    // Map items with their signups
    const items: PotluckItem[] = itemsResult.rows.map(item => {
      const itemSignups = signupsResult.rows
        .filter(signup => signup.item_id === item.id)
        .map(signup => {
          return {
            id: signup.id.toString(),
            quantity: signup.quantity,
            participant: {
              id: signup.participant_id.toString(),
              email: signup.participant_email,
              name: signup.participant_name || undefined,
              signups: []
            },
            item: {
              id: item.id.toString(),
              name: item.name,
              quantity: item.quantity,
              signups: []
            }
          } as ItemSignup;
        });

      return {
        id: item.id.toString(),
        name: item.name,
        quantity: item.quantity,
        signups: itemSignups
      } as PotluckItem;
    });

    // Transform DB model to application model, but hide participant details
    return {
      id: potluck.id.toString(),
      name: potluck.name,
      date: new Date(potluck.date).toISOString(),
      theme: potluck.theme || undefined,
      location: potluck.location || undefined,
      description: potluck.description || undefined,
      adminEmail: potluck.admin_email,
      adminName: potluck.admin_name || undefined,
      notificationsEnabled: potluck.notifications_enabled,
      items,
      participants: [] // Hide participant details from participants view
    };
  } catch (error) {
    console.error('Error fetching potluck for participant:', error);
    return null;
  }
}

