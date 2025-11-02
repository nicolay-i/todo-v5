import { TodoApp } from '@/components/TodoApp'
import { getTodoState } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'
import { runWithUserContext } from '@/lib/auth/userContext'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Page() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <TodoApp initialState={{ todos: [], pinnedLists: [], tags: [] }} currentUser={null} />
  }

  const initialState = await runWithUserContext(currentUser.id, () => getTodoState())
  return <TodoApp initialState={initialState} currentUser={currentUser} />
}
