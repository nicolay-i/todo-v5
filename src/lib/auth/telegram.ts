import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { TelegramAuthPayload } from './types'

const MAX_AUTH_AGE_SECONDS = 60 * 5

export interface VerifiedTelegramData {
  id: string
  firstName: string
  lastName?: string | null
  username?: string | null
  photoUrl?: string | null
  authDate: Date
  languageCode?: string | null
}

function getTelegramSecret(botToken: string) {
  return createHash('sha256').update(botToken).digest()
}

export function verifyTelegramPayload(payload: TelegramAuthPayload, botToken: string): VerifiedTelegramData | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const { hash, auth_date, ...rest } = payload
  if (typeof hash !== 'string' || hash.length === 0) {
    return null
  }

  if (typeof auth_date !== 'number' || !Number.isFinite(auth_date)) {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (now - auth_date > MAX_AUTH_AGE_SECONDS) {
    return null
  }

  const dataCheckString = Object.entries({ ...rest, auth_date })
    .filter(([, value]) => typeof value !== 'undefined' && value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n')

  const secret = getTelegramSecret(botToken)
  const computedHash = createHmac('sha256', secret).update(dataCheckString).digest('hex')

  try {
    const provided = Buffer.from(hash, 'hex')
    const actual = Buffer.from(computedHash, 'hex')
    if (provided.length !== actual.length || !timingSafeEqual(provided, actual)) {
      return null
    }
  } catch {
    return null
  }

  return {
    id: String(payload.id),
    firstName: payload.first_name,
    lastName: payload.last_name ?? null,
    username: payload.username ?? null,
    photoUrl: payload.photo_url ?? null,
    authDate: new Date(auth_date * 1000),
    languageCode: typeof (payload as any).language_code === 'string' ? ((payload as any).language_code as string) : null,
  }
}
