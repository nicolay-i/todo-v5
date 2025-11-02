import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { User } from '@prisma/client'
import { prisma } from '../prisma'
import type { AuthenticatedUser } from './types'

const SESSION_COOKIE_NAME = 'todo_session'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

interface SessionPayload {
  userId: string
  iat: number
  exp: number
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is not configured')
  }
  return secret
}

function encodePayload(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', getAuthSecret()).update(data).digest('base64url')
  return `${data}.${signature}`
}

function decodePayload(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null
  const [data, signature] = cookieValue.split('.')
  if (!data || !signature) return null

  const expected = createHmac('sha256', getAuthSecret()).update(data).digest('base64url')

  try {
    const provided = Buffer.from(signature, 'base64url')
    const actual = Buffer.from(expected, 'base64url')
    if (provided.length !== actual.length || !timingSafeEqual(provided, actual)) {
      return null
    }
  } catch {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as SessionPayload
    if (typeof payload.userId !== 'string' || typeof payload.exp !== 'number') {
      return null
    }
    if (payload.exp * 1000 < Date.now()) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

function toAuthUser(user: User): AuthenticatedUser {
  return {
    id: user.id,
    telegramId: user.telegramId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const sessionValue = cookies().get(SESSION_COOKIE_NAME)?.value
  const payload = decodePayload(sessionValue)
  if (!payload) {
    return null
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    return null
  }

  return toAuthUser(user)
}

export function attachSessionCookie(response: NextResponse, userId: string) {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    userId,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  }

  const value = encodePayload(payload)
  response.cookies.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function destroySessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
