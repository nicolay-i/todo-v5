'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { RandomTodoStore } from './RandomTodoStore'

const RandomTodoStoreContext = createContext<RandomTodoStore | null>(null)

interface ProviderProps {
  store: RandomTodoStore
  children: ReactNode
}

export function RandomTodoStoreProvider({ store, children }: ProviderProps) {
  return <RandomTodoStoreContext.Provider value={store}>{children}</RandomTodoStoreContext.Provider>
}

export function useRandomTodoStore() {
  const store = useContext(RandomTodoStoreContext)
  if (!store) {
    throw new Error('useRandomTodoStore must be used within RandomTodoStoreProvider')
  }

  return store
}
