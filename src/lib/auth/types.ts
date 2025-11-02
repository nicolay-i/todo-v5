export interface AuthenticatedUser {
  id: string
  telegramId: string
  firstName: string
  lastName?: string | null
  username?: string | null
  photoUrl?: string | null
}

export interface TelegramAuthPayload {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
  [key: string]: unknown
}
