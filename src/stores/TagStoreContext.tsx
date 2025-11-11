import { createContext, useContext, type ReactNode } from 'react'
import type { TagStore } from './TagStore'

const TagStoreContext = createContext<TagStore | null>(null)

export const TagStoreProvider = ({
  store,
  children,
}: {
  store: TagStore
  children: ReactNode
}) => {
  return <TagStoreContext.Provider value={store}>{children}</TagStoreContext.Provider>
}

export const useTagStore = () => {
  const store = useContext(TagStoreContext)
  if (!store) {
    throw new Error('useTagStore must be used within TagStoreProvider')
  }
  return store
}
