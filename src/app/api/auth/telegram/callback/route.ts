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

// Handle GET request - return HTML page that will process hash fragment
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  
  if (!state) {
    return buildRedirectResponse(request, 'state')
  }

  // Return HTML page that extracts tgAuthResult from hash and sends to POST endpoint
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Авторизация...</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .loader { text-align: center; }
    .spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Завершаем авторизацию...</p>
  </div>
  <script>
    (function() {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const tgAuthResult = params.get('tgAuthResult');
      
      if (!tgAuthResult) {
        window.location.href = '/?authError=signature';
        return;
      }
      
      // Send tgAuthResult to POST endpoint
      fetch('/api/auth/telegram/callback?state=${state}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tgAuthResult })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.location.href = '/';
        } else {
          window.location.href = '/?authError=' + (data.error || 'default');
        }
      })
      .catch(() => {
        window.location.href = '/?authError=default';
      });
    })();
  </script>
</body>
</html>
  `
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}

// Handle POST request - process the auth data
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  const storedState = request.cookies.get(TELEGRAM_STATE_COOKIE)?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.json({ success: false, error: 'state' }, { status: 400 })
  }

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
    response.cookies.delete(TELEGRAM_STATE_COOKIE)
    return response
  } catch (error) {
    console.error('Telegram OAuth callback error', error)
    let code = 'signature'
    if (error instanceof Error) {
      if (error.message.includes('Authorization data is too old')) {
        code = 'expired'
      }
    }
    return NextResponse.json({ success: false, error: code }, { status: 400 })
  }
}
