'use client'

import { useState } from 'react'
import { FaTelegramPlane } from 'react-icons/fa'

interface TelegramLoginButtonProps {
  label?: string
}

export function TelegramLoginButton({ label }: TelegramLoginButtonProps) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleClick = () => {
    setIsRedirecting(true)
    window.location.href = '/api/auth/telegram/login'
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isRedirecting}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
        isRedirecting ? 'cursor-wait bg-sky-400' : 'bg-sky-500 hover:bg-sky-600'
      }`}
    >
      <FaTelegramPlane className="h-4 w-4" />
      {isRedirecting ? 'Перенаправляем...' : label ?? 'Войти через Telegram'}
    </button>
  )
}
