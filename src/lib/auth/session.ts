import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'
import type { Session, User } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE_NAME = 'todo_session'
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60 // 30 days

export interface AuthenticatedUser {
  id: string
  firstName: string
  lastName: string | null
  username: string | null
  photoUrl: string | null
}

function mapUser(user: User): AuthenticatedUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName ?? null,
    username: user.username ?? null,
    photoUrl: user.photoUrl ?? null,
  }
}

async function getSessionByToken(token: string): Promise<(Session & { user: User }) | null> {
  return prisma.session.findUnique({ where: { token }, include: { user: true } })
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const store = cookies()
  const token = store.get(SESSION_COOKIE_NAME)?.value
  if (!token) {
    return null
  }

  const session = await getSessionByToken(token)
  if (!session) {
    store.delete(SESSION_COOKIE_NAME)
    return null
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { token: session.token } }).catch(() => {})
    store.delete(SESSION_COOKIE_NAME)
    return null
  }

  return mapUser(session.user)
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  await prisma.session.deleteMany({ where: { userId, expiresAt: { lt: new Date() } } })
  await prisma.session.create({ data: { token, userId, expiresAt } })

  const store = cookies()
  store.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: expiresAt,
  })
}

export async function clearSession() {
  const store = cookies()
  const token = store.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  store.delete(SESSION_COOKIE_NAME)
}
