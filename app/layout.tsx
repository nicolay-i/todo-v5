import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Дерево задач',
  description: 'Управление задачами с вложенностью и закреплениями'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
