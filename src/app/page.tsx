import { TodoApp } from '@/components/TodoApp'
import { getTodoState } from '@/lib/todoService'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function Page() {
  const initialState = await getTodoState()
  return <TodoApp initialState={initialState} />
}
