import { NextResponse } from 'next/server'
import { verifyTelegramAuth, type TelegramAuthPayload } from '@/lib/auth/telegram'
import { buildSessionCookie, createSession } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { getTodoStateForUser } from '@/lib/todoService'

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as TelegramAuthPayload
    const data = verifyTelegramAuth(payload)

    const user = await prisma.user.upsert({
      where: { telegramId: data.telegramId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        photoUrl: data.photoUrl,
      },
      create: {
        telegramId: data.telegramId,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        photoUrl: data.photoUrl,
      },
    })

    const session = await createSession(user.id)
    const state = await getTodoStateForUser(user.id)
    const response = NextResponse.json(state)
    response.cookies.set(buildSessionCookie(session.token, session.expiresAt))
    return response
  } catch (error) {
    console.error('Telegram authentication failed', error)
    const message = error instanceof Error ? error.message : 'Не удалось авторизоваться'
    return NextResponse.json({ message }, { status: 400 })
  }
}
