'use client'

import { useEffect, useRef, useState } from 'react'

interface TelegramWidgetUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

declare global {
  interface Window {
    handleTelegramAuth?: (user: TelegramWidgetUser) => void
  }
}

const BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME

export function LoginScreen() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!BOT_NAME) {
      setError('Укажите имя бота в переменной NEXT_PUBLIC_TELEGRAM_BOT_NAME.')
      return
    }

    const handleAuth = async (user: TelegramWidgetUser) => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          setError((data as { message?: string } | null)?.message ?? 'Не удалось выполнить вход.')
          setLoading(false)
          return
        }
        window.location.reload()
      } catch (err) {
        console.error('Telegram login failed', err)
        setError('Не удалось выполнить вход. Попробуйте снова.')
        setLoading(false)
      }
    }

    window.handleTelegramAuth = handleAuth

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', BOT_NAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-lang', 'ru')
    script.setAttribute('data-onauth', 'handleTelegramAuth')
    script.setAttribute('data-request-access', 'write')

    const container = containerRef.current
    if (container) {
      container.innerHTML = ''
      container.appendChild(script)
    }

    return () => {
      delete window.handleTelegramAuth
      if (container && script.parentNode === container) {
        container.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas-light px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl bg-white/80 p-8 text-center shadow-xl">
        <h1 className="text-xl font-semibold text-slate-800">Вход через Telegram</h1>
        <p className="mt-3 text-sm text-slate-500">
          Авторизуйтесь, чтобы управлять своими задачами и закрепленными списками.
        </p>
        <div ref={containerRef} className="mt-6 flex justify-center" aria-live="polite" />
        {loading && (
          <p className="mt-4 text-sm text-slate-500">Проверяем данные…</p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        )}
      </div>
    </div>
  )
}

export default LoginScreen
