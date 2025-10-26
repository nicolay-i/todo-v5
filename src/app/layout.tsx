import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Todo Planner',
  description: 'Nested todos with pinned lists powered by Next.js and Prisma',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
