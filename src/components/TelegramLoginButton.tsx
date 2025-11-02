'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TelegramAuthPayload } from '@/lib/auth/types'

declare global {
  interface Window {
    telegramLoginCallback?: (user: TelegramAuthPayload & { hash: string }) => void
  }
}

const BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME

export const TelegramLoginButton = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!BOT_NAME || !container) {
      return
    }

    const handler = async (user: TelegramAuthPayload & { hash: string }) => {
      try {
        setIsProcessing(true)
        setError(null)
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}))
          throw new Error(payload.error ?? 'Не удалось выполнить вход')
        }

        router.refresh()
      } catch (authError) {
        console.error('Telegram auth failed', authError)
        setIsProcessing(false)
        setError(authError instanceof Error ? authError.message : 'Не удалось выполнить вход')
      }
    }

    window.telegramLoginCallback = handler

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', BOT_NAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-request-access', 'write')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-radius', '8')
    script.setAttribute('data-onauth', 'telegramLoginCallback')

    container.innerHTML = ''
    container.appendChild(script)

    return () => {
      delete window.telegramLoginCallback
      container.innerHTML = ''
    }
  }, [router])

  if (!BOT_NAME) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        Укажите имя бота в переменной <code className="font-mono">NEXT_PUBLIC_TELEGRAM_BOT_NAME</code>, чтобы включить авторизацию.
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} />
      {isProcessing && <p className="text-xs text-slate-500">Проверяем данные…</p>}
      {error && <p className="max-w-sm text-xs text-red-600">{error}</p>}
    </div>
  )
}
