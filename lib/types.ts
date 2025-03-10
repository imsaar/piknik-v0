export interface Potluck {
  id: string
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

