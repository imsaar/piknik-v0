import type { Potluck } from "./types"

// This would connect to your database in a real implementation
// For now, we'll return mock data

export async function getPotluckForAdmin(id: string): Promise<Potluck | null> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Create base objects first to avoid circular references
  const item1 = { id: "item_1", name: "Pasta Salad", quantity: 2, signups: [] }
  const item2 = { id: "item_2", name: "Hamburger Buns", quantity: 3, signups: [] }
  const item3 = { id: "item_3", name: "Potato Chips", quantity: 4, signups: [] }
  const item4 = { id: "item_4", name: "Watermelon", quantity: 2, signups: [] }

  const participant1 = { id: "participant_1", email: "john@example.com", name: "John Doe", signups: [] }
  const participant2 = { id: "participant_2", email: "sarah@example.com", name: "Sarah Johnson", signups: [] }
  const participant3 = { id: "participant_3", email: "mike@example.com", name: "Mike Wilson", signups: [] }

  const signup1 = { id: "signup_1", quantity: 1, participant: participant1, item: item1 }
  const signup2 = { id: "signup_2", quantity: 2, participant: participant2, item: item3 }
  const signup3 = { id: "signup_3", quantity: 2, participant: participant3, item: item4 }

  // Now add signups to items and participants
  item1.signups = [signup1]
  item3.signups = [signup2]
  item4.signups = [signup3]

  participant1.signups = [signup1]
  participant2.signups = [signup2]
  participant3.signups = [signup3]

  // Mock data
  return {
    id,
    name: "Summer BBQ Potluck",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    theme: "BBQ",
    location: "123 Main St, Anytown, USA",
    description: "Join us for a fun summer BBQ! Please bring your favorite dish to share.",
    adminEmail: "admin@example.com",
    adminName: "Jane Smith",
    notificationsEnabled: true,
    items: [item1, item2, item3, item4],
    participants: [participant1, participant2, participant3],
  }
}

export async function getPotluckForParticipant(id: string): Promise<Potluck | null> {
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Create base objects first to avoid circular references
  const item1 = { id: "item_1", name: "Pasta Salad", quantity: 2, signups: [] }
  const item2 = { id: "item_2", name: "Hamburger Buns", quantity: 3, signups: [] }
  const item3 = { id: "item_3", name: "Potato Chips", quantity: 4, signups: [] }
  const item4 = { id: "item_4", name: "Watermelon", quantity: 2, signups: [] }

  const participant1 = { id: "participant_1", email: "john@example.com", name: "John Doe", signups: [] }
  const participant2 = { id: "participant_2", email: "sarah@example.com", name: "Sarah Johnson", signups: [] }
  const participant3 = { id: "participant_3", email: "mike@example.com", name: "Mike Wilson", signups: [] }

  const signup1 = { id: "signup_1", quantity: 1, participant: participant1, item: item1 }
  const signup2 = { id: "signup_2", quantity: 2, participant: participant2, item: item3 }
  const signup3 = { id: "signup_3", quantity: 2, participant: participant3, item: item4 }

  // Now add signups to items
  item1.signups = [signup1]
  item3.signups = [signup2]
  item4.signups = [signup3]

  // Mock data - simplified version for participants
  return {
    id,
    name: "Summer BBQ Potluck",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    theme: "BBQ",
    location: "123 Main St, Anytown, USA",
    description: "Join us for a fun summer BBQ! Please bring your favorite dish to share.",
    adminEmail: "admin@example.com",
    adminName: "Jane Smith",
    notificationsEnabled: true,
    items: [item1, item2, item3, item4],
    participants: [],
  }
}

