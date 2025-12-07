import { TodoApp } from '@/TodoApp'
import { LoginScreen } from '@/components/LoginScreen'
import { TelegramAuthHandler } from '@/components/TelegramAuthHandler'
import { getCurrentUser } from '@/lib/auth/session'
import { getTodoState } from '@/lib/todoService'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

type SearchParamsShape = Record<string, string | string[] | undefined> | undefined

interface PageProps {
  searchParams?: SearchParamsShape | Promise<SearchParamsShape>
}

export default async function Page({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  const resolvedSearchParams = await searchParams
  const authError = typeof resolvedSearchParams?.authError === 'string' ? resolvedSearchParams.authError : null

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
