import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth/session'

interface TelegramAuthPayload {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function verifyTelegramPayload(payload: unknown, botToken: string): TelegramAuthPayload | null {
  if (!isRecord(payload)) return null

  const map = new Map<string, string>()
  for (const [key, raw] of Object.entries(payload)) {
    if (raw === undefined || raw === null) continue
    if (typeof raw === 'object') continue
    map.set(key, String(raw))
  }

  const hash = map.get('hash')
  if (!hash) return null
  map.delete('hash')

  const checkString = Array.from(map.keys())
    .sort()
    .map((key) => `${key}=${map.get(key)}`)
    .join('\n')

  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const computed = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')
  if (computed !== hash) {
    return null
  }

  const authDate = Number(map.get('auth_date'))
  if (!Number.isFinite(authDate)) {
    return null
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  if (nowSeconds - authDate > 86400) {
    return null
  }

  const id = Number(map.get('id'))
  const firstName = map.get('first_name')
  if (!Number.isFinite(id) || !firstName) {
    return null
  }

  return {
    id,
    first_name: firstName,
    last_name: typeof payload.last_name === 'string' ? payload.last_name : undefined,
    username: typeof payload.username === 'string' ? payload.username : undefined,
    photo_url: typeof payload.photo_url === 'string' ? payload.photo_url : undefined,
    auth_date: authDate,
    hash,
  }
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not configured')
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const data = verifyTelegramPayload(payload, botToken)
  if (!data) {
    return NextResponse.json({ error: 'Invalid Telegram authorization data' }, { status: 400 })
  }

  const telegramId = String(data.id)

  const user = await prisma.user.upsert({
    where: { telegramId },
    update: {
      firstName: data.first_name,
      lastName: data.last_name ?? null,
      username: data.username ?? null,
      photoUrl: data.photo_url ?? null,
    },
    create: {
      telegramId,
      firstName: data.first_name,
      lastName: data.last_name ?? null,
      username: data.username ?? null,
      photoUrl: data.photo_url ?? null,
    },
  })

  await createSession(user.id)

  return NextResponse.json({ ok: true })
}
