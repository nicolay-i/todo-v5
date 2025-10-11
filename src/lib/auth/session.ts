import { cookies } from 'next/headers'
import { randomBytes } from 'node:crypto'
import type { Session, User } from '@prisma/client'
import { prisma } from '../prisma'

export const SESSION_COOKIE_NAME = 'todo_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export interface SessionWithUser extends Session {
  user: User
}

export function buildSessionCookie(token: string, expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
  }
}

export function buildClearedSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
  }
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await prisma.session.create({ data: { token, userId, expiresAt } })
  return { token, expiresAt }
}

export async function invalidateSession(token: string) {
  if (!token) return
  await prisma.session.deleteMany({ where: { token } })
}

export async function getSessionFromCookies(): Promise<SessionWithUser | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
  if (!session) {
    cookies().delete(SESSION_COOKIE_NAME)
    return null
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined)
    cookies().delete(SESSION_COOKIE_NAME)
    return null
  }

  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSessionFromCookies()
  return session?.user ?? null
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new UnauthorizedError()
  }
  return user
}
