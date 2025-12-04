'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiSearch, FiX, FiCheck } from 'react-icons/fi'
import { useTodoStore } from '@/stores/TodoStoreContext'
import { flattenNodes, hasTemporaryTag, findTodo as findTodoUtil } from '@/lib/todoUtils'
import { fuzzyMatch } from '@/lib/search/fuzzyMatch'
import type { TodoNode } from '@/lib/types'

interface SearchTodoModalProps {
  pinnedListId: string
  isOpen: boolean
  isMounted: boolean
  onClose: () => void
}

interface SearchResult {
  todo: TodoNode
  score: number
  titleMatch: { score: number; indices: [number, number][] } | null
  descriptionMatch: { score: number; indices: [number, number][] } | null
  path: TodoNode[]
}

const SearchTodoModalComponent = ({ pinnedListId, isOpen, isMounted, onClose }: SearchTodoModalProps) => {
  const store = useTodoStore()
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const targetList = store.pinnedLists.find((list) => list.id === pinnedListId)
  const todosInSlot = targetList ? new Set(targetList.order) : new Set()

  // Получаем все todo, исключая временные
  const allTodos = useMemo(() => {
    const flattened = flattenNodes(store.todos, [])
    return flattened.filter((todo) => !hasTemporaryTag(todo))
  }, [store.todos])

  // Поиск с использованием fuzzyMatch
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return []
    }

    const results: SearchResult[] = []

    for (const todo of allTodos) {
      const titleMatch = fuzzyMatch(query, todo.title)
      const descriptionMatch = todo.description ? fuzzyMatch(query, todo.description) : null

      if (titleMatch || descriptionMatch) {
        // Строим путь к todo (родители)
        const path: TodoNode[] = []
        let currentId = todo.parentId
        while (currentId) {
          const parentInfo = findTodoUtil(currentId, store.todos)
          if (parentInfo) {
            path.unshift(parentInfo.node)
            currentId = parentInfo.node.parentId
          } else {
            break
          }
        }

        const score = (titleMatch?.score ?? 0) * 2 + (descriptionMatch?.score ?? 0)
        results.push({
          todo,
          score,
          titleMatch,
          descriptionMatch,
          path,
        })
      }
    }

    // Сортируем по релевантности
    results.sort((a, b) => b.score - a.score)

    // Ограничиваем до 20 результатов
    return results.slice(0, 20)
  }, [searchQuery, allTodos, store.todos])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleSelectTodo = async (todoId: string) => {
    if (todosInSlot.has(todoId)) {
      return // Уже в слоте, ничего не делаем
    }
    await store.addExistingTodoToPinnedList(todoId, pinnedListId)
    // Не закрываем модал, чтобы можно было добавить несколько todo
  }

  const highlightText = (text: string, indices: [number, number][] | null): React.ReactNode => {
    if (!indices || indices.length === 0) {
      return text
    }

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    for (const [start, end] of indices) {
      if (lastIndex < start) {
        parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, start)}</span>)
      }
      parts.push(
        <mark key={`highlight-${start}`} className="bg-yellow-200 dark:bg-yellow-800">
          {text.slice(start, end + 1)}
        </mark>
      )
      lastIndex = end + 1
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
    }

    return <>{parts}</>
  }

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        } bg-black/30`}
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-2xl transform rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xl transition-all duration-200 ease-out ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Поиск задач</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Закрыть"
          >
            <FiX />
          </button>
        </div>

        <div className="relative mb-4">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите название задачи для поиска"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 pl-9 pr-10 text-sm text-slate-700 dark:text-slate-200 shadow-inner transition focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Очистить поиск"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {searchQuery.trim() === '' ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Введите запрос для поиска задач
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
              Ничего не найдено
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((result) => {
                const isInSlot = todosInSlot.has(result.todo.id)
                return (
                  <button
                    key={result.todo.id}
                    type="button"
                    onClick={() => handleSelectTodo(result.todo.id)}
                    disabled={isInSlot}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      isInSlot
                        ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 opacity-60'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {result.path.length > 0 && (
                          <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                            {result.path.map((p) => p.title).join(' → ')} →
                          </div>
                        )}
                        <div className="font-medium">
                          {highlightText(result.todo.title, result.titleMatch?.indices ?? null)}
                        </div>
                        {result.todo.description && (
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {highlightText(result.todo.description, result.descriptionMatch?.indices ?? null)}
                          </div>
                        )}
                      </div>
                      {isInSlot && (
                        <div className="flex-shrink-0">
                          <FiCheck className="text-emerald-500 dark:text-emerald-400" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Подсказка: Esc — закрыть
        </div>
      </div>
    </div>
  )
}

export const SearchTodoModal = observer(SearchTodoModalComponent)

