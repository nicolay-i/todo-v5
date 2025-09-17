'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { TodoStore } from './TodoStore'

const TodoStoreContext = createContext<TodoStore | null>(null)

interface ProviderProps {
  children: ReactNode
}

export function TodoStoreProvider({ children }: ProviderProps) {
  const store = useMemo(() => new TodoStore(), [])

  return <TodoStoreContext.Provider value={store}>{children}</TodoStoreContext.Provider>
}

export function useTodoStore() {
  const store = useContext(TodoStoreContext)
  if (!store) {
    throw new Error('useTodoStore must be used within TodoStoreProvider')
  }

  return store
}
