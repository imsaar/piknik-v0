export interface Potluck {
  id: string
  eventCode: string
  adminToken?: string  // Only included for admin view
  name: string
  date: string
  theme?: string
  location?: string
  description?: string
  adminEmail: string
  adminName?: string
  notificationsEnabled: boolean
  items: PotluckItem[]
  participants: Participant[]
}

export interface PotluckItem {
  id: string
  name: string
  quantity: number
  signups: ItemSignup[]
}

export interface Participant {
  id: string
  token?: string  // Only included for admin view or when the participant is logged in
  email: string
  name?: string
  signups: ItemSignup[]
}

export interface ItemSignup {
  id: string
  quantity: number
  participant: Participant
  item: PotluckItem
}

