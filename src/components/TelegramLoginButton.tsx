'use client'

import { useEffect, useRef } from 'react'
import type { TelegramAuthPayload } from '@/lib/auth/telegram'

interface TelegramLoginButtonProps {
  botUsername?: string
  onAuth: (payload: TelegramAuthPayload) => void
  disabled?: boolean
}

export function TelegramLoginButton({ botUsername, onAuth, disabled }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!botUsername) return
    const container = containerRef.current
    if (!container) return

    const handleAuth = (payload: TelegramAuthPayload) => {
      if (disabled) return
      onAuth(payload)
    }

    ;(window as any).telegramAuthCallback = handleAuth

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-onauth', 'telegramAuthCallback')

    container.innerHTML = ''
    container.appendChild(script)

    return () => {
      container.innerHTML = ''
      if ((window as any).telegramAuthCallback === handleAuth) {
        delete (window as any).telegramAuthCallback
      }
    }
  }, [botUsername, disabled, onAuth])

  if (!botUsername) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Укажите NEXT_PUBLIC_TELEGRAM_BOT_USERNAME в настройках окружения.
      </div>
    )
  }

  return <div ref={containerRef} />
}
