import { useContext } from 'react'
import { TodoStoreContext } from './context'

export const useTodoStore = () => {
  const store = useContext(TodoStoreContext)
  if (!store) {
    throw new Error('useTodoStore must be used within a TodoStoreProvider')
  }
  return store
}
