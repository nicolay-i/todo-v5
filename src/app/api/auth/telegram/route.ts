import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTelegramPayload } from '@/lib/auth/telegram'
import { attachSessionCookie } from '@/lib/auth/session'
import type { TelegramAuthPayload } from '@/lib/auth/types'

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN не настроен на сервере' }, { status: 500 })
  }

  try {
    const rawPayload = (await request.json()) as TelegramAuthPayload & { hash: string }
    const verified = verifyTelegramPayload(rawPayload, botToken)

    if (!verified) {
      return NextResponse.json({ error: 'Неверные данные авторизации Telegram' }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { telegramId: verified.id },
      update: {
        firstName: verified.firstName,
        lastName: verified.lastName,
        username: verified.username,
        photoUrl: verified.photoUrl,
        languageCode: verified.languageCode,
        authDate: verified.authDate,
      },
      create: {
        telegramId: verified.id,
        firstName: verified.firstName,
        lastName: verified.lastName,
        username: verified.username,
        photoUrl: verified.photoUrl,
        languageCode: verified.languageCode,
        authDate: verified.authDate,
      },
    })

    const response = NextResponse.json({ success: true })
    attachSessionCookie(response, user.id)
    return response
  } catch (error) {
    console.error('Telegram OAuth error', error)
    return NextResponse.json({ error: 'Не удалось выполнить вход через Telegram' }, { status: 400 })
  }
}
