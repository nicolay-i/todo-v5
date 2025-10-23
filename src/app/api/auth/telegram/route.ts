import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession, verifyTelegramAuthPayload } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const raw = await request.json()
    const payload = verifyTelegramAuthPayload(raw)

    await prisma.user.upsert({
      where: { id: payload.id },
      update: {
        firstName: payload.first_name,
        lastName: payload.last_name ?? null,
        username: payload.username ?? null,
        photoUrl: payload.photo_url ?? null,
      },
      create: {
        id: payload.id,
        firstName: payload.first_name,
        lastName: payload.last_name ?? null,
        username: payload.username ?? null,
        photoUrl: payload.photo_url ?? null,
      },
    })

    const user = await createSession(payload.id)
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Telegram auth failed', error)
    return NextResponse.json({ message: 'Не удалось подтвердить данные Telegram' }, { status: 400 })
  }
}
