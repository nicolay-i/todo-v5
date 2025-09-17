import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Todo Lists',
  description: 'Nested todo manager with pinned lists',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-canvas-light text-slate-900">{children}</body>
    </html>
  )
}
