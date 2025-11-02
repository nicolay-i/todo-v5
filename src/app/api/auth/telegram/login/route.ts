import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { buildTelegramStateCookie } from '@/lib/auth/telegram'

export async function GET(request: NextRequest) {
  const botId = process.env.TELEGRAM_BOT_ID
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botId || !botToken) {
    return NextResponse.json({ error: 'Telegram OAuth is not configured' }, { status: 500 })
  }

  const url = new URL(request.url)
  const origin = url.origin
  const state = randomBytes(16).toString('hex')
  const redirectUri = `${origin}/api/auth/telegram/callback?state=${state}`

  const telegramUrl = new URL('https://oauth.telegram.org/auth')
  telegramUrl.searchParams.set('bot_id', botId)
  telegramUrl.searchParams.set('origin', origin)
  telegramUrl.searchParams.set('request_access', 'write')
  telegramUrl.searchParams.set('redirect_uri', redirectUri)

  const response = NextResponse.redirect(telegramUrl.toString())
  response.cookies.set(buildTelegramStateCookie(state))
  return response
}
