import type { Potluck, PotluckItem, Participant, ItemSignup } from "./types"
import { query } from "./db"

// This would connect to your database in a real implementation
// For now, we'll return mock data

// Get potluck by event code for admin (requires valid admin token)
export async function getPotluckForAdmin(eventCode: string, adminToken: string): Promise<Potluck | null> {
  try {
    // Normalize the event code to handle formatting differences
    const normalizedEventCode = eventCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formattedEventCode = eventCode;
    
    // If we have 8 characters, format it as XXXX-XXXX
    if (normalizedEventCode.length === 8) {
      formattedEventCode = `${normalizedEventCode.slice(0, 4)}-${normalizedEventCode.slice(4, 8)}`;
    }
    
    console.log(`Admin looking up potluck with event code: ${formattedEventCode} (normalized from ${eventCode})`);
    
    // Get the potluck and verify admin token
    const potluckResult = await query(
      `SELECT * FROM potlucks WHERE event_code = $1 AND admin_token = $2`,
      [formattedEventCode, adminToken]
    );

    // If not found with exact match, try case-insensitive search
    if (potluckResult.rows.length === 0) {
      console.log('Admin potluck not found with exact match, trying case-insensitive search');
      
      const fuzzyResult = await query(
        `SELECT * FROM potlucks 
         WHERE LOWER(event_code) = LOWER($1) AND admin_token = $2`,
        [formattedEventCode, adminToken]
      );
      
      // If still not found, try without the hyphen
      if (fuzzyResult.rows.length === 0 && normalizedEventCode.length === 8) {
        console.log('Admin trying without hyphen formatting');
        
        const noHyphenResult = await query(
          `SELECT * FROM potlucks 
           WHERE REPLACE(LOWER(event_code), '-', '') = $1 AND admin_token = $2`,
          [normalizedEventCode.toLowerCase(), adminToken]
        );
        
        if (noHyphenResult.rows.length > 0) {
          console.log('Admin found potluck using normalized code without hyphen');
          potluckResult.rows = noHyphenResult.rows;
        }
      } else if (fuzzyResult.rows.length > 0) {
        console.log('Admin found potluck with case-insensitive search');
        potluckResult.rows = fuzzyResult.rows;
      }
    }

    if (potluckResult.rows.length === 0) {
      console.log(`No potluck found for admin with event code: ${eventCode}`);
      return null;
    }

    const potluck = potluckResult.rows[0];
    console.log(`Admin found potluck: ${potluck.name} (ID: ${potluck.id})`);

    // Get the items
    const itemsResult = await query(
      `SELECT * FROM potluck_items WHERE potluck_id = $1`,
      [potluck.id]
    );

    // Get the participants
    const participantsResult = await query(
      `SELECT * FROM participants WHERE potluck_id = $1`,
      [potluck.id]
    );

    // Get the signups
    const signupsResult = await query(
      `SELECT s.*, p.email as participant_email, p.name as participant_name, p.token as participant_token,
              i.name as item_name, i.quantity as item_quantity
       FROM item_signups s
       JOIN participants p ON s.participant_id = p.id
       JOIN potluck_items i ON s.item_id = i.id
       WHERE p.potluck_id = $1`,
      [potluck.id]
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
              token: signup.participant_token,
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
              token: participant.token,
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
        token: participant.token,
        email: participant.email,
        name: participant.name || undefined,
        signups: participantSignups
      } as Participant;
    });

    // Transform DB model to application model
    return {
      id: potluck.id.toString(),
      eventCode: potluck.event_code,
      adminToken: potluck.admin_token,
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

// Get potluck by event code for participants
export async function getPotluckForParticipant(eventCode: string): Promise<Potluck | null> {
  try {
    // Normalize the event code to handle formatting differences
    const normalizedEventCode = eventCode.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formattedEventCode = eventCode;
    
    // If we have 8 characters, format it as XXXX-XXXX
    if (normalizedEventCode.length === 8) {
      formattedEventCode = `${normalizedEventCode.slice(0, 4)}-${normalizedEventCode.slice(4, 8)}`;
    }
    
    console.log(`Looking up potluck with event code: ${formattedEventCode} (normalized from ${eventCode})`);
    
    // Get the potluck
    const potluckResult = await query(
      `SELECT * FROM potlucks WHERE event_code = $1`,
      [formattedEventCode]
    );

    // If not found with exact match, try case-insensitive search
    if (potluckResult.rows.length === 0) {
      console.log('Potluck not found with exact match, trying case-insensitive search');
      
      const fuzzyResult = await query(
        `SELECT * FROM potlucks WHERE LOWER(event_code) = LOWER($1)`,
        [formattedEventCode]
      );
      
      // If still not found, try without the hyphen
      if (fuzzyResult.rows.length === 0 && normalizedEventCode.length === 8) {
        console.log('Trying without hyphen formatting');
        
        const noHyphenResult = await query(
          `SELECT * FROM potlucks 
           WHERE REPLACE(LOWER(event_code), '-', '') = $1`,
          [normalizedEventCode.toLowerCase()]
        );
        
        if (noHyphenResult.rows.length > 0) {
          console.log('Found potluck using normalized code without hyphen');
          potluckResult.rows = noHyphenResult.rows;
        }
      } else if (fuzzyResult.rows.length > 0) {
        console.log('Found potluck with case-insensitive search');
        potluckResult.rows = fuzzyResult.rows;
      }
    }

    if (potluckResult.rows.length === 0) {
      console.log(`No potluck found with event code: ${eventCode}`);
      return null;
    }

    const potluck = potluckResult.rows[0];
    console.log(`Found potluck: ${potluck.name} (ID: ${potluck.id})`);

    // Get the items
    const itemsResult = await query(
      `SELECT * FROM potluck_items WHERE potluck_id = $1`,
      [potluck.id]
    );

    // Get the signups
    const signupsResult = await query(
      `SELECT s.*, p.email as participant_email, p.name as participant_name, 
              i.name as item_name, i.quantity as item_quantity
       FROM item_signups s
       JOIN participants p ON s.participant_id = p.id
       JOIN potluck_items i ON s.item_id = i.id
       WHERE p.potluck_id = $1`,
      [potluck.id]
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
      eventCode: potluck.event_code,
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

// Get potluck by event code and participant token
export async function getPotluckForSignedInParticipant(eventCode: string, participantToken: string): Promise<{potluck: Potluck, participant: Participant} | null> {
  try {
    // Get the potluck
    const potluckResult = await query(
      `SELECT * FROM potlucks WHERE event_code = $1`,
      [eventCode]
    );

    if (potluckResult.rows.length === 0) {
      return null;
    }

    const potluck = potluckResult.rows[0];

    // Get the participant
    const participantResult = await query(
      `SELECT * FROM participants WHERE token = $1 AND potluck_id = $2`,
      [participantToken, potluck.id]
    );

    if (participantResult.rows.length === 0) {
      return null;
    }

    const participant = participantResult.rows[0];

    // Get the items
    const itemsResult = await query(
      `SELECT * FROM potluck_items WHERE potluck_id = $1`,
      [potluck.id]
    );

    // Get the signups
    const signupsResult = await query(
      `SELECT s.*, p.email as participant_email, p.name as participant_name, 
              i.name as item_name, i.quantity as item_quantity
       FROM item_signups s
       JOIN participants p ON s.participant_id = p.id
       JOIN potluck_items i ON s.item_id = i.id
       WHERE p.potluck_id = $1`,
      [potluck.id]
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

    // Get participant's signups
    const participantSignups = signupsResult.rows
      .filter(signup => signup.participant_id === participant.id)
      .map(signup => {
        const matchingItem = itemsResult.rows.find(item => item.id === signup.item_id);
        
        return {
          id: signup.id.toString(),
          quantity: signup.quantity,
          participant: {
            id: participant.id.toString(),
            token: participant.token,
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

    // Create participant object
    const participantData: Participant = {
      id: participant.id.toString(),
      token: participant.token,
      email: participant.email,
      name: participant.name || undefined,
      signups: participantSignups
    };

    // Transform DB model to application model
    const potluckData: Potluck = {
      id: potluck.id.toString(),
      eventCode: potluck.event_code,
      name: potluck.name,
      date: new Date(potluck.date).toISOString(),
      theme: potluck.theme || undefined,
      location: potluck.location || undefined,
      description: potluck.description || undefined,
      adminEmail: potluck.admin_email,
      adminName: potluck.admin_name || undefined,
      notificationsEnabled: potluck.notifications_enabled,
      items,
      participants: [] // Hide other participants
    };

    return {
      potluck: potluckData,
      participant: participantData
    };
  } catch (error) {
    console.error('Error fetching potluck for signed-in participant:', error);
    return null;
  }
}

