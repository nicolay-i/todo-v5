import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildSessionCookie, createSession } from '@/lib/auth/session'
import { verifyTelegramAuth } from '@/lib/auth/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const tgAuthResult = body.tgAuthResult

    if (!tgAuthResult) {
      return NextResponse.json({ success: false, error: 'signature' }, { status: 400 })
    }

    // Decode the base64 payload
    const payload = JSON.parse(Buffer.from(tgAuthResult, 'base64').toString('utf-8'))

    // Convert payload to URLSearchParams for verification
    const params = new URLSearchParams()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.set(key, String(value))
      }
    })

    const verified = verifyTelegramAuth(params)
    const firstName = verified.firstName?.trim() || 'Пользователь'

    const user = await prisma.user.upsert({
      where: { telegramId: verified.id },
      update: {
        firstName,
        lastName: verified.lastName,
        username: verified.username,
        photoUrl: verified.photoUrl,
      },
      create: {
        telegramId: verified.id,
        firstName,
        lastName: verified.lastName,
        username: verified.username,
        photoUrl: verified.photoUrl,
      },
    })

    const session = await createSession(user.id)
    const response = NextResponse.json({ success: true })
    response.cookies.set(buildSessionCookie(session.token, session.expiresAt))
    return response
  } catch (error) {
    console.error('Telegram auth processing error:', error)
    let code = 'signature'
    if (error instanceof Error) {
      if (error.message.includes('Authorization data is too old')) {
        code = 'expired'
      }
    }
    return NextResponse.json({ success: false, error: code }, { status: 400 })
  }
}
