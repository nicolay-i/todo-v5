'use client'

import { Fragment, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTodoStore } from '@/stores/TodoStoreContext'
import { TodoItem } from './TodoItem'
import type { TodoNode } from '@/lib/types'

interface TodoTreeViewProps {
  /**
   * Список todo для отображения.
   * Если не передан, используется store.visibleTodos
   */
  todos?: TodoNode[]
  /**
   * Показывать ли placeholder для пустого списка
   */
  showEmptyPlaceholder?: boolean
  /**
   * Текст placeholder при пустом списке
   */
  emptyPlaceholderText?: string
  /**
   * Поддержка drag & drop
   */
  enableDragDrop?: boolean
  /**
   * Принудительно развернуть все элементы
   */
  forceExpanded?: boolean
}

const TodoTreeViewComponent = ({
  todos,
  showEmptyPlaceholder = true,
  emptyPlaceholderText = 'Добавьте первую задачу или перетащите её в этот список',
  enableDragDrop = true,
  forceExpanded = false,
}: TodoTreeViewProps) => {
  const store = useTodoStore()
  const draggedId = store.draggedId
  const canAcceptRoot = draggedId !== null && store.canDrop(draggedId, null)
  const searchActive = store.isSearchActive
  const visibleTodos = todos ?? store.visibleTodos
  const [isOverEmpty, setIsOverEmpty] = useState(false)
  const isRootEmpty = visibleTodos.length === 0

  const handleEmptyDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!enableDragDrop || !canAcceptRoot || !isRootEmpty) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isOverEmpty) {
      setIsOverEmpty(true)
    }
  }

  const handleEmptyDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    if (isOverEmpty) {
      setIsOverEmpty(false)
    }
  }

  const handleEmptyDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!enableDragDrop || !canAcceptRoot || draggedId === null || !isRootEmpty) return
    event.preventDefault()
    setIsOverEmpty(false)
    void store.moveTodo(draggedId, null, 0)
    store.clearDragged()
  }

  return (
    <div
      className="space-y-3"
      onDragOver={enableDragDrop ? handleEmptyDragOver : undefined}
      onDragLeave={enableDragDrop ? handleEmptyDragLeave : undefined}
      onDrop={enableDragDrop ? handleEmptyDrop : undefined}
    >
      {searchActive && visibleTodos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
          Ничего не найдено — попробуйте изменить текст запроса или фильтр по тегам.
        </div>
      )}

      {isRootEmpty && showEmptyPlaceholder ? (
        <div
          className={[
            'flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center text-sm transition-colors',
            isOverEmpty && canAcceptRoot && enableDragDrop
              ? 'border-emerald-300 bg-emerald-50/70 text-emerald-700'
              : 'border-slate-200 bg-slate-50 text-slate-500',
          ].join(' ')}
        >
          {emptyPlaceholderText}
        </div>
      ) : (
        visibleTodos.map((todo, index) => (
          <Fragment key={todo.id}>
            <TodoItem todo={todo} depth={0} parentId={null} index={index} enableDragDrop={enableDragDrop} forceExpanded={forceExpanded} />
          </Fragment>
        ))
      )}
    </div>
  )
}

export const TodoTreeView = observer(TodoTreeViewComponent)
