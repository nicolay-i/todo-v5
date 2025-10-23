import { LoginScreen } from '@/components/LoginScreen'
import { TodoApp } from '@/components/TodoApp'
import { getCurrentSessionUser } from '@/lib/auth'
import { getTodoState } from '@/lib/todoService'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Page() {
  const user = await getCurrentSessionUser()
  if (!user) {
    return <LoginScreen />
  }
  const initialState = await getTodoState(user.id)
  return <TodoApp initialState={initialState} user={user} />
}
