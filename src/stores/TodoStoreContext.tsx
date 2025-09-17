import { createContext, useContext, type ReactNode } from 'react'
import { TodoStore } from './TodoStore'

const TodoStoreContext = createContext<TodoStore | null>(null)

interface ProviderProps {
  store: TodoStore
  children: ReactNode
}

export function TodoStoreProvider({ store, children }: ProviderProps) {
  return <TodoStoreContext.Provider value={store}>{children}</TodoStoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTodoStore() {
  const store = useContext(TodoStoreContext)
  if (!store) {
    throw new Error('useTodoStore must be used within TodoStoreProvider')
  }

  return store
}
