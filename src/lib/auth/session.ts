import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import type { Session, User } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const SESSION_COOKIE_NAME = 'todo_session'
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

export interface SessionUser {
  id: string
  telegramId: string
  firstName: string
  lastName: string | null
  username: string | null
  photoUrl: string | null
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

function mapUser(user: User): SessionUser {
  return {
    id: user.id,
    telegramId: user.telegramId,
    firstName: user.firstName,
    lastName: user.lastName ?? null,
    username: user.username ?? null,
    photoUrl: user.photoUrl ?? null,
  }
}

export function buildSessionCookie(token: string, expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  }
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export async function deleteSessionByToken(token: string) {
  if (!token) return
  await prisma.session.deleteMany({ where: { token } })
}

async function getSessionFromToken(token: string): Promise<(Session & { user: User }) | null> {
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }

  return session
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  // Dev режим: если указан DEV_USER_ID, используем его (только в development)
  const devUserId = process.env.DEV_USER_ID
  if (devUserId && process.env.NODE_ENV === 'development') {
    const user = await prisma.user.findUnique({ where: { id: devUserId } })
    if (user) {
      return mapUser(user)
    }
    console.warn(`DEV_USER_ID=${devUserId} не найден в базе данных`)
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const session = await getSessionFromToken(token)
  if (!session) return null

  return mapUser(session.user)
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}

export async function getUserId(): Promise<string | null> {
  // Dev режим: если указан DEV_USER_ID, используем его (только в development)
  const devUserId = process.env.DEV_USER_ID
  if (devUserId && process.env.NODE_ENV === 'development') {
    const user = await prisma.user.findUnique({ where: { id: devUserId } })
    if (user) {
      return user.id
    }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const session = await getSessionFromToken(token)
  return session?.userId ?? null
}

