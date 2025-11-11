import { TodoApp } from '@/TodoApp'
import { LoginScreen } from '@/components/LoginScreen'
import { TelegramAuthHandler } from '@/components/TelegramAuthHandler'
import { getCurrentUser } from '@/lib/auth/session'
import { getTodoState } from '@/lib/todoService'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function Page({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  const authError = typeof searchParams?.authError === 'string' ? searchParams?.authError : null

  if (!user) {
    return (
      <>
        <TelegramAuthHandler />
        <LoginScreen errorCode={authError ?? undefined} />
      </>
    )
  }

  const initialState = await getTodoState(user.id)
  return <TodoApp initialState={initialState} user={user} />
}
