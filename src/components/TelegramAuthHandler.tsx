'use client'

import { useEffect, useState } from 'react'

export function TelegramAuthHandler() {
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (!hash) return

    const params = new URLSearchParams(hash)
    const tgAuthResult = params.get('tgAuthResult')

    if (!tgAuthResult) return

    setIsProcessing(true)

    // Send auth data to server
    fetch('/api/auth/telegram/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tgAuthResult }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Clear hash from URL
        window.history.replaceState(null, '', window.location.pathname)

        if (data.success) {
          // Reload to get authenticated state
          window.location.reload()
        } else {
          window.location.href = '/?authError=' + (data.error || 'default')
        }
      })
      .catch(() => {
        window.location.href = '/?authError=default'
      })
  }, [])

  if (!isProcessing) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="text-center text-white">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        <p className="text-lg">Завершаем авторизацию...</p>
      </div>
    </div>
  )
}
