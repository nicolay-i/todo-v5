import { createContext, useContext } from 'react'
import type { TodoStore } from './TodoStore'

export const TodoStoreContext = createContext<TodoStore | null>(null)

export function useTodoStore() {
  const store = useContext(TodoStoreContext)
  if (!store) {
    throw new Error('useTodoStore must be used within a TodoStoreProvider')
  }
  return store
}
