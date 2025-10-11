import { createHash, createHmac } from 'node:crypto'

export interface TelegramAuthPayload {
  id: number | string
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date?: number | string
  hash?: string
  [key: string]: unknown
}

export interface TelegramUserData {
  telegramId: string
  firstName: string
  lastName?: string | null
  username?: string | null
  photoUrl?: string | null
}

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24

export function verifyTelegramAuth(payload: TelegramAuthPayload): TelegramUserData {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured')
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid Telegram payload')
  }

  const hash = typeof payload.hash === 'string' ? payload.hash : ''
  if (!hash) {
    throw new Error('Missing payload hash')
  }

  const authDateNumber = Number(payload.auth_date)
  if (!Number.isFinite(authDateNumber)) {
    throw new Error('Invalid auth_date')
  }

  const maxAge = Number(process.env.TELEGRAM_AUTH_MAX_AGE ?? DEFAULT_MAX_AGE_SECONDS)
  if (Number.isFinite(maxAge) && maxAge > 0) {
    const nowSeconds = Math.floor(Date.now() / 1000)
    if (nowSeconds - authDateNumber > maxAge) {
      throw new Error('Telegram auth data has expired')
    }
  }

  const dataCheck = Object.keys(payload)
    .filter((key) => key !== 'hash' && payload[key] !== undefined && payload[key] !== null)
    .sort()
    .map((key) => `${key}=${String(payload[key])}`)
    .join('\n')

  const secret = createHash('sha256').update(botToken).digest()
  const expectedHash = createHmac('sha256', secret).update(dataCheck).digest('hex')

  if (expectedHash !== hash) {
    throw new Error('Failed to verify Telegram signature')
  }

  const telegramId = String(payload.id ?? '')
  if (!telegramId) {
    throw new Error('Missing Telegram user id')
  }

  const firstName = typeof payload.first_name === 'string' && payload.first_name.trim()
    ? payload.first_name.trim()
    : ''

  if (!firstName) {
    throw new Error('Missing Telegram first name')
  }

  return {
    telegramId,
    firstName,
    lastName: typeof payload.last_name === 'string' ? payload.last_name : null,
    username: typeof payload.username === 'string' ? payload.username : null,
    photoUrl: typeof payload.photo_url === 'string' ? payload.photo_url : null,
  }
}
