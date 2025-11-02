import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildSessionCookie, createSession } from '@/lib/auth/session'
import { TELEGRAM_STATE_COOKIE, verifyTelegramAuth } from '@/lib/auth/telegram'

function buildRedirectResponse(request: NextRequest, errorCode?: string) {
  const target = new URL('/', request.url)
  if (errorCode) {
    target.searchParams.set('authError', errorCode)
  }
  const response = NextResponse.redirect(target)
  response.cookies.delete(TELEGRAM_STATE_COOKIE)
  return response
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  const storedState = request.cookies.get(TELEGRAM_STATE_COOKIE)?.value

  if (!state || !storedState || state !== storedState) {
    return buildRedirectResponse(request, 'state')
  }

  try {
    const payload = verifyTelegramAuth(url.searchParams)
    const firstName = payload.firstName?.trim() || 'Пользователь'

    const user = await prisma.user.upsert({
      where: { telegramId: payload.id },
      update: {
        firstName,
        lastName: payload.lastName,
        username: payload.username,
        photoUrl: payload.photoUrl,
      },
      create: {
        telegramId: payload.id,
        firstName,
        lastName: payload.lastName,
        username: payload.username,
        photoUrl: payload.photoUrl,
      },
    })

    const session = await createSession(user.id)
    const response = buildRedirectResponse(request)
    response.cookies.set(buildSessionCookie(session.token, session.expiresAt))
    return response
  } catch (error) {
    console.error('Telegram OAuth callback error', error)
    let code: string | undefined = 'signature'
    if (error instanceof Error) {
      if (error.message.includes('Authorization data is too old')) {
        code = 'expired'
      } else if (error.message.includes('Missing Telegram hash')) {
        code = 'signature'
      }
    }
    return buildRedirectResponse(request, code)
  }
}
