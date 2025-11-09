'use client'

import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRandomTodoStore } from '@/stores/RandomTodoStoreContext'
import { TodoTreeView } from './TodoTreeView'
import type { TodoNode } from '@/lib/types'

function RandomTodoTabComponent() {
  const store = useRandomTodoStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const todoId = searchParams.get('id')
  
  // Флаг для предотвращения повторной загрузки при обновлении URL
  const isUpdatingUrlRef = useRef(false)

  useEffect(() => {
    // Если мы только что обновили URL, сбрасываем флаг и не загружаем
    if (isUpdatingUrlRef.current) {
      isUpdatingUrlRef.current = false
      return
    }
    // Загружаем цепочку: если есть id в URL, загружаем по id, иначе случайную
    void store.loadRandomChain(todoId || undefined)
  }, [store, todoId])

  // Последний элемент в цепочке (листовой todo)
  const leafTodo = store.randomChain[store.randomChain.length - 1]

  // Обновляем URL параметр при загрузке новой цепочки
  useEffect(() => {
    if (leafTodo?.id && leafTodo.id !== todoId) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'random')
      params.set('id', leafTodo.id)
      router.replace(`?${params.toString()}`, { scroll: false })
      // Устанавливаем флаг, что мы обновляем URL из-за изменения состояния
      isUpdatingUrlRef.current = true
    }
  }, [leafTodo?.id, todoId, searchParams, router])

  // Преобразуем плоскую цепочку в вложенную структуру для правильного отображения
  const chainTree = useMemo(() => {
    if (store.randomChain.length === 0) return []
    
    // Создаём вложенную структуру: каждый элемент содержит следующий как child
    const result: TodoNode[] = []
    let current: TodoNode | null = null
    
    for (let i = store.randomChain.length - 1; i >= 0; i--) {
      const todo = store.randomChain[i]
      const node: TodoNode = {
        ...todo,
        children: current ? [current] : []
      }
      current = node
    }
    
    if (current) {
      result.push(current)
    }
    
    return result
  }, [store.randomChain])

  if (store.isLoadingRandomChain) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-slate-500">Загрузка случайной задачи...</span>
        </div>
      </div>
    )
  }

  if (store.randomChain.length === 0) {
    return (
      <div className="p-4">
        <p className="text-slate-500 text-center py-8">Нет незавершённых задач</p>
      </div>
    )
  }

  return (
    <div className="pt-3">
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-amber-900">
          🎯 Цепочка до случайной задачи
        </h3>
      </div>

      <TodoTreeView
        todos={chainTree}
        showEmptyPlaceholder={false}
        enableDragDrop={false}
        forceExpanded={true}
      />

      {leafTodo && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2 text-sm">
            🎯 Текущая задача
          </h3>
          <p className="text-green-900 font-medium">{leafTodo.title}</p>
          {leafTodo.alias && (
            <p className="text-sm text-green-700 italic mt-1">
              Алиас: {leafTodo.alias}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export const RandomTodoTab = observer(RandomTodoTabComponent)
