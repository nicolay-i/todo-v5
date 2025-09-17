import type { PropsWithChildren } from 'react'
import type { TodoStore } from './TodoStore'
import { TodoStoreContext } from './TodoStoreContext'

export function TodoStoreProvider({ store, children }: PropsWithChildren<{ store: TodoStore }>) {
  return <TodoStoreContext.Provider value={store}>{children}</TodoStoreContext.Provider>
}
