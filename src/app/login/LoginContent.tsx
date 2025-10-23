'use client'

import { useEffect, useState } from 'react'

const BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME ?? ''

type TelegramUserPayload = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export function LoginContent() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!BOT_NAME) return

    const callback = async (user: TelegramUserPayload) => {
      setIsSubmitting(true)
      setError(null)
      try {
        const response = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        })
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string }
          setError(data?.error ?? 'Не удалось выполнить вход. Попробуйте еще раз.')
          setIsSubmitting(false)
          return
        }
        window.location.href = '/'
      } catch (err) {
        console.error('Failed to authenticate via Telegram', err)
        setError('Не удалось выполнить вход. Попробуйте еще раз.')
        setIsSubmitting(false)
      }
    }

    ;(window as unknown as { TelegramLoginWidgetCallback?: typeof callback }).TelegramLoginWidgetCallback = callback
    return () => {
      delete (window as unknown as { TelegramLoginWidgetCallback?: typeof callback }).TelegramLoginWidgetCallback
    }
  }, [])

  useEffect(() => {
    if (!BOT_NAME) return
    const container = document.getElementById('telegram-login-container')
    if (!container) return

    container.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', BOT_NAME)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-onauth', 'TelegramLoginWidgetCallback(user)')
    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [])

  if (!BOT_NAME) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
        Не задано имя бота. Укажите переменную окружения <code className="font-mono">NEXT_PUBLIC_TELEGRAM_BOT_NAME</code>.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 text-center shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-800">Вход через Telegram</h1>
        <p className="mt-3 text-sm text-slate-500">
          Используйте официальный виджет Telegram, чтобы авторизоваться и получить доступ к своим задачам.
        </p>
        <div id="telegram-login-container" className="mt-6 flex justify-center" />
        {isSubmitting && (
          <p className="mt-4 text-sm text-slate-500">Выполняем вход...</p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        )}
      </div>
    </div>
  )
}
