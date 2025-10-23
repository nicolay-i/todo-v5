import { redirect } from 'next/navigation'
import { TodoApp } from '@/components/TodoApp'
import { getCurrentUser } from '@/lib/auth/session'
import { getTodoState } from '@/lib/todoService'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  const initialState = await getTodoState(user.id)
  return <TodoApp initialState={initialState} currentUser={user} />
}
