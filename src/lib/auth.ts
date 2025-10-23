import { createHash, createHmac } from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import type { SessionUser } from './types'

const SESSION_COOKIE_NAME = 'todo_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

interface TelegramAuthPayload {
  id: string
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not configured')
  }
  return token
}

export function verifyTelegramAuthPayload(raw: unknown): TelegramAuthPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid payload')
  }

  const data = raw as Record<string, unknown>
  const hash = typeof data.hash === 'string' ? data.hash : null
  if (!hash) {
    throw new Error('Missing hash in payload')
  }

  const id = data.id
  const firstName = data.first_name
  const authDateRaw = data.auth_date

  if (typeof id !== 'number' && typeof id !== 'string') {
    throw new Error('Missing Telegram user id')
  }

  if (typeof firstName !== 'string' || firstName.trim().length === 0) {
    throw new Error('Missing Telegram first name')
  }

  if (typeof authDateRaw !== 'number' && typeof authDateRaw !== 'string') {
    throw new Error('Missing authentication date')
  }

  const authDate = Number(authDateRaw)
  if (!Number.isFinite(authDate)) {
    throw new Error('Invalid authentication date')
  }

  const entries = Object.entries(data)
    .filter(([key, value]) => key !== 'hash' && value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
  const dataCheckString = entries.join('\n')

  const botToken = getBotToken()
  const secret = createHash('sha256').update(botToken).digest()
  const computedHash = createHmac('sha256', secret).update(dataCheckString).digest('hex')

  if (computedHash !== hash) {
    throw new Error('Invalid Telegram signature')
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  if (nowSeconds - authDate > 24 * 60 * 60) {
    throw new Error('Telegram authentication payload is too old')
  }

  return {
    id: String(id),
    first_name: firstName,
    last_name: typeof data.last_name === 'string' ? data.last_name : undefined,
    username: typeof data.username === 'string' ? data.username : undefined,
    photo_url: typeof data.photo_url === 'string' ? data.photo_url : undefined,
    auth_date: authDate,
    hash,
  }
}

function mapToSessionUser(user: { id: string; firstName: string; lastName: string | null; username: string | null; photoUrl: string | null }): SessionUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
  }
}

async function removeExistingSession(sessionId: string | undefined) {
  if (!sessionId) return
  try {
    await prisma.session.delete({ where: { id: sessionId } })
  } catch {
    // ignore missing session
  }
}

export async function createSession(userId: string) {
  const cookieStore = cookies()
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value
  await removeExistingSession(existing)

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
  const session = await prisma.session.create({
    data: { userId, expiresAt },
    include: { user: true },
  })

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: session.id,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return mapToSessionUser(session.user)
}

export async function destroySession() {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  await removeExistingSession(sessionId)
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!sessionId) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session) {
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    })
    return null
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } })
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    })
    return null
  }

  return mapToSessionUser(session.user)
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS }
