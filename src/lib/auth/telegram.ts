import { createHash, createHmac } from 'node:crypto'

export interface TelegramAuthPayload {
  id: string
  firstName: string
  lastName: string | null
  username: string | null
  photoUrl: string | null
  authDate: number
}

export const TELEGRAM_STATE_COOKIE = 'telegram_oauth_state'
const TELEGRAM_STATE_TTL_SECONDS = 10 * 60

export function buildTelegramStateCookie(value: string) {
  return {
    name: TELEGRAM_STATE_COOKIE,
    value,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: TELEGRAM_STATE_TTL_SECONDS,
    path: '/',
  }
}

function normalizeParams(params: URLSearchParams | Record<string, string | string[] | null | undefined>) {
  if (params instanceof URLSearchParams) {
    return Array.from(params.entries())
  }
  return Object.entries(params).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value.map((item) => [key, item ?? ''] as const)
    }
    if (value === undefined || value === null) {
      return []
    }
    return [[key, value] as const]
  })
}

export function verifyTelegramAuth(params: URLSearchParams | Record<string, string | string[] | null | undefined>): TelegramAuthPayload {
  const entries = normalizeParams(params)
  const data: Record<string, string> = {}

  for (const [key, value] of entries) {
    data[key] = value
  }

  const hash = data.hash
  if (!hash) {
    throw new Error('Missing Telegram hash')
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured')
  }

  const checkPairs = Object.keys(data)
    .filter((key) => key !== 'hash' && key !== 'state')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n')

  const secretKey = createHash('sha256').update(botToken).digest()
  const computedHash = createHmac('sha256', secretKey).update(checkPairs).digest('hex')

  if (computedHash !== hash) {
    throw new Error('Invalid Telegram signature')
  }

  const authDateRaw = data.auth_date
  const authDate = Number(authDateRaw)
  if (!Number.isFinite(authDate)) {
    throw new Error('Invalid auth date')
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  if (nowSeconds - authDate > 86400) {
    throw new Error('Authorization data is too old')
  }

  const id = data.id ?? data.user ?? ''
  if (!id) {
    throw new Error('Missing Telegram user id')
  }

  return {
    id: String(id),
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? null,
    username: data.username ?? null,
    photoUrl: data.photo_url ?? null,
    authDate,
  }
}

