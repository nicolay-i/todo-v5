'use client'

import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTodoStore } from '@/stores/TodoStoreContext'
import { TodoTreeView } from './TodoTreeView'
import type { TodoNode } from '@/lib/types'

function RandomTodoTabComponent() {
  const store = useTodoStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const todoId = searchParams.get('id')

  useEffect(() => {
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
