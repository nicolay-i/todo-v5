import { redirect } from 'next/navigation'
import { LoginContent } from './LoginContent'
import { getCurrentUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-canvas-light">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-16">
        <LoginContent />
      </div>
    </div>
  )
}
