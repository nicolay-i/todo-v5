'use client'

import { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiPlus } from 'react-icons/fi'
import type { TodoState } from '@/lib/types'
import { TodoStore } from '@/stores/TodoStore'
import { TodoStoreProvider, useTodoStore } from '@/stores/TodoStoreContext'
import { RandomTodoStore } from '@/stores/RandomTodoStore'
import { RandomTodoStoreProvider, useRandomTodoStore } from '@/stores/RandomTodoStoreContext'
import { TagStore } from '@/stores/TagStore'
import { TagStoreProvider } from '@/stores/TagStoreContext'
import { NotificationStore } from '@/stores/NotificationStore'
import { NotificationContainer } from './components/NotificationContainer'
import { LoadingIndicator } from './components/LoadingIndicator'
import { useSearchParams } from 'next/navigation'
import type { SessionUser } from '@/lib/auth/session'
import type { TabKey } from './components/TabLayout'
import { TabLayout } from './components/TabLayout'
import { AddTodoModal } from './components/AddTodoModal'
import { AllTasksTab } from '@/pages/AllTasksTab'
import { PinnedTab } from '@/pages/PinnedTab'
import { SettingsTab } from '@/pages/SettingsTab'
import { RandomTodoTab } from '@/pages/RandomTodoTab'

interface TodoAppProps {
  initialState: TodoState
  user: SessionUser
}

const TodoAppContent = ({ user }: { user: SessionUser }) => {
  const store = useTodoStore()
  const randomStore = useRandomTodoStore()
  const [newTitle, setNewTitle] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddModalMounted, setIsAddModalMounted] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const searchParams = useSearchParams()

  // Инициализируем вкладку из URL (?tab=...)
  const tabFromUrl = searchParams?.get('tab')
  const normalizedTab = (tabFromUrl === 'pinned' || tabFromUrl === 'all' || tabFromUrl === 'settings' || tabFromUrl === 'random')
    ? (tabFromUrl as TabKey)
    : 'pinned'
  const [activeTab, setActiveTab] = useState<TabKey>(normalizedTab)

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Failed to log out', error)
    } finally {
      window.location.href = '/'
    }
  }, [])

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false)
    window.setTimeout(() => setIsAddModalMounted(false), 200)
  }, [])

  const openAddModal = useCallback(() => {
    setIsAddModalMounted(true)
    setSelectedTagIds([])
    requestAnimationFrame(() => setIsAddModalOpen(true))
  }, [])

  const handleAdd = useCallback(async () => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    await store.addTodo(null, trimmed, selectedTagIds)
    setNewTitle('')
    setSelectedTagIds([])
    closeAddModal()
  }, [closeAddModal, newTitle, selectedTagIds, store])

  // Авто-обновление данных при возвращении во вкладку / фокусе окна
  useEffect(() => {
    if (typeof window === 'undefined') return

    let isRefreshing = false

    const refreshIfVisible = () => {
      if (document.visibilityState !== 'visible' || isRefreshing) return
      isRefreshing = true
      void store.refresh().finally(() => {
        isRefreshing = false
      })
    }

    document.addEventListener('visibilitychange', refreshIfVisible)
    window.addEventListener('focus', refreshIfVisible)

    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible)
      window.removeEventListener('focus', refreshIfVisible)
    }
  }, [store])

  // Подписка на событие открытия модала (из TabLayout)
  useEffect(() => {
    const handler = () => openAddModal()
    window.addEventListener('openAddModal', handler)
    return () => window.removeEventListener('openAddModal', handler)
  }, [openAddModal])

  return (
    <TabLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onPinnedStepList={(delta) => store.stepActivePinnedList(delta)}
      headerActions={
        <>
          {activeTab === 'all' && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              aria-label="Добавить задачу"
            >
              <FiPlus />
              Добавить
            </button>
          )}
          {activeTab === 'random' && (
            <button
              type="button"
              onClick={() => randomStore.loadRandomChain()}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              aria-label="Загрузить другую задачу"
            >
              Другой
            </button>
          )}
        </>
      }
    >
      {activeTab === 'pinned' && <PinnedTab />}
      {activeTab === 'all' && <AllTasksTab />}
      {activeTab === 'random' && <RandomTodoTab />}
      {activeTab === 'settings' && <SettingsTab user={user} onLogout={handleLogout} />}

      <AddTodoModal
        isOpen={isAddModalOpen}
        isMounted={isAddModalMounted}
        newTitle={newTitle}
        selectedTagIds={selectedTagIds}
        onTitleChange={setNewTitle}
        onTagsChange={setSelectedTagIds}
        onAdd={() => void handleAdd()}
        onClose={closeAddModal}
      />
    </TabLayout>
  )
}

const ObservedContent = observer(TodoAppContent)

export const TodoApp = ({ initialState, user }: TodoAppProps) => {
  const [notificationStore] = useState(() => new NotificationStore())
  const [store] = useState(() => new TodoStore(initialState, notificationStore))
  const [randomStore] = useState(() => new RandomTodoStore(notificationStore))
  const [tagStore] = useState(() => {
    const ts = new TagStore(initialState.tags ?? [], notificationStore)
    store.setTagStore(ts)
    return ts
  })

  return (
    <TodoStoreProvider store={store}>
      <RandomTodoStoreProvider store={randomStore}>
        <TagStoreProvider store={tagStore}>
          <LoadingIndicator />
          <NotificationContainer />
          <ObservedContent user={user} />
        </TagStoreProvider>
      </RandomTodoStoreProvider>
    </TodoStoreProvider>
  )
}
