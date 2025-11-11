'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { isInputLike } from '@/lib/dom/todoFocus'
import { focusEdgeTodo } from '@/lib/dom/todoFocus'

export type TabKey = 'pinned' | 'all' | 'settings' | 'random'

interface Tab {
  key: TabKey
  label: string
}

interface TabLayoutProps {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  children: ReactNode
  headerActions?: ReactNode
  onPinnedStepList?: (delta: number) => void
}

const tabs: Tab[] = [
  { key: 'pinned', label: 'Слоты' },
  { key: 'all', label: 'Список задач' },
  { key: 'random', label: 'Случайное' },
  { key: 'settings', label: 'Настройки' },
]

export function TabLayout({ activeTab, onTabChange, children, headerActions, onPinnedStepList }: TabLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabKeys = useMemo(() => tabs.map((tab) => tab.key), [])

  // Синхронизация URL при смене вкладки
  const applyTabToUrl = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams?.toString())
      params.set('tab', tab)
      const next = `${pathname}?${params.toString()}`
      router.replace(next, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const handleSwitchTab = useCallback(
    (tab: TabKey) => {
      if (tab === activeTab) return
      onTabChange(tab)
      applyTabToUrl(tab)
    },
    [activeTab, applyTabToUrl, onTabChange],
  )

  // Глобальные хоткеи
  useEffect(() => {
    const handleGlobalKeys = (event: KeyboardEvent) => {
      if (isInputLike(event.target)) return

      const lowerKey = event.key.toLowerCase()

      // n — открыть модал добавления (только на вкладке 'all')
      if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && lowerKey === 'n' && activeTab === 'all') {
        event.preventDefault()
        // Это событие будет обработано в AllTasksTab
        window.dispatchEvent(new CustomEvent('openAddModal'))
        return
      }

      // Стрелки вверх/вниз для фокуса на задачах
      if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        const scope = activeTab === 'all' ? 'list' : activeTab === 'pinned' ? 'pinned' : null
        if (!scope) return
        const activeElement = document.activeElement as HTMLElement | null
        if (activeElement && activeElement !== document.body) return
        event.preventDefault()
        focusEdgeTodo(scope, event.key === 'ArrowUp')
        return
      }

      // Alt + стрелки для переключения вкладок
      if (event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          const currentIndex = tabKeys.indexOf(activeTab)
          if (currentIndex === -1) return
          const delta = event.key === 'ArrowRight' ? 1 : -1
          const nextIndex = Math.min(Math.max(currentIndex + delta, 0), tabKeys.length - 1)
          if (nextIndex !== currentIndex) {
            event.preventDefault()
            handleSwitchTab(tabKeys[nextIndex])
          }
          return
        }
        // Alt + стрелки вверх/вниз для переключения pinned lists
        if (activeTab === 'pinned' && (event.key === 'ArrowDown' || event.key === 'ArrowUp') && onPinnedStepList) {
          event.preventDefault()
          onPinnedStepList(event.key === 'ArrowDown' ? 1 : -1)
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeys)
    return () => window.removeEventListener('keydown', handleGlobalKeys)
  }, [activeTab, handleSwitchTab, onPinnedStepList, tabKeys])

  // Обратная синхронизация: если URL изменился, обновляем стейт
  useEffect(() => {
    const current = searchParams?.get('tab')
    const nextTab = (current === 'pinned' || current === 'all' || current === 'settings' || current === 'random')
      ? (current as TabKey)
      : 'pinned'
    if (nextTab !== activeTab) {
      onTabChange(nextTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex-1 rounded-3xl bg-white/60 p-5 shadow-inner ring-1 ring-white/40">
          <div className="pb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-2xl bg-white/70 p-1 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200/70">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleSwitchTab(tab.key)}
                  className={[
                    'rounded-xl px-4 py-2 transition focus-visible:outline-none',
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {headerActions}
          </div>
          {children}
        </section>
      </div>
    </div>
  )
}
