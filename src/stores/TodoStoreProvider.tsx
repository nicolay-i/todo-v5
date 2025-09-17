import { type ReactNode } from 'react'
import { TodoStoreContext } from './context'
import { todoStore } from './todoStore'

export const TodoStoreProvider = ({ children }: { children: ReactNode }) => (
  <TodoStoreContext.Provider value={todoStore}>{children}</TodoStoreContext.Provider>
)
