'use client'

import { observer } from 'mobx-react-lite'
import { useTodoStore } from '@/stores/TodoStoreContext'

export const LoadingIndicator = observer(() => {
  const store = useTodoStore()

  if (store.pendingOperations === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse z-50" />
  )
})

LoadingIndicator.displayName = 'LoadingIndicator'
