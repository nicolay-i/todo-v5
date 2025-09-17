import type { ReactNode } from 'react';
import type { TodoStore } from './TodoStore';
import { TodoStoreContext } from './TodoStoreContext';

export interface TodoStoreProviderProps {
  store: TodoStore;
  children: ReactNode;
}

export function TodoStoreProvider({ store, children }: TodoStoreProviderProps) {
  return <TodoStoreContext.Provider value={store}>{children}</TodoStoreContext.Provider>;
}
