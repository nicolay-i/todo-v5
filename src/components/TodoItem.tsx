'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { MAX_DEPTH } from '@/lib/constants'
import type { TodoNode } from '@/lib/types'
import { useTodoStore } from '@/stores/TodoStoreContext'
// DropZone больше не используется для сортировки; логика дропа реализована на карточке

interface TodoItemProps {
  todo: TodoNode
  depth: number
  allowChildren?: boolean
  // Для сортировки в рамках родителя
  parentId: string | null
  index: number
  // Для сортировки в закреплённых списках
  pinnedListId?: string
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const TodoItemComponent = ({ todo, depth, allowChildren = true, parentId, index, pinnedListId }: TodoItemProps) => {
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)
  const [childTitle, setChildTitle] = useState('')
  const [isOverInside, setIsOverInside] = useState(false)
  const [hoverPos, setHoverPos] = useState<'none' | 'top' | 'middle' | 'bottom'>('none')
  const childInputRef = useRef<HTMLInputElement>(null)

  const canAddChild = allowChildren && depth < MAX_DEPTH
  const isDragging = store.draggedId === todo.id
  const isCollapsed = store.isCollapsed(todo.id)
  const draggedId = store.draggedId
  const canDropInside =
    allowChildren && depth < MAX_DEPTH && draggedId !== null && store.canDrop(draggedId, todo.id)

  const canReorderInTree =
    draggedId !== null && parentId !== undefined && store.canDrop(draggedId, parentId)

  const canReorderInPinned = draggedId !== null && Boolean(pinnedListId) && store.isPinned(draggedId!)

  useEffect(() => {
    setTitleDraft(todo.title)
  }, [todo.title])

  useEffect(() => {
    if (isAddingChild && childInputRef.current) {
      childInputRef.current.focus()
    }
  }, [isAddingChild])

  const handleToggle = () => {
    void store.toggleTodo(todo.id)
  }

  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    await store.updateTitle(todo.id, titleDraft)
    setIsEditing(false)
  }

  const handleAddChild: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    await store.addTodo(todo.id, childTitle)
    setChildTitle('')
    setIsAddingChild(false)
  }

  const handleDelete = () => {
    void store.deleteTodo(todo.id)
  }

  const handleTogglePinned = () => {
    void store.togglePinned(todo.id)
  }

  const handleToggleCollapsed = () => {
    // Разрешаем сворачивать только если потенциально есть дети (или уже есть), иначе кнопка не показывается
    store.toggleCollapse(todo.id)
  }

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    store.setDragged(todo.id)
    event.dataTransfer.setData('text/plain', todo.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
    store.clearDragged()
  }

  // Allow dropping directly onto the card to append as a child (even when collapsed)
  const handleCardDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    // Позволяем сортировку по верх/низ и дроп внутрь по центру
    if (!(canReorderInTree || canReorderInPinned || canDropInside)) return
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
    const y = event.clientY - rect.top
    const ratio = rect.height > 0 ? y / rect.height : 0.5

    let nextHover: 'top' | 'middle' | 'bottom' = 'middle'
    if (ratio < 0.25) nextHover = 'top'
    else if (ratio > 0.75) nextHover = 'bottom'
    else nextHover = 'middle'

    // Если середина, но дроп внутрь запрещён, смещаем к ближайшей сортировочной зоне
    if (nextHover === 'middle' && !(canDropInside)) {
      nextHover = ratio < 0.5 ? 'top' : 'bottom'
    }

    setHoverPos(nextHover)
    setIsOverInside(nextHover === 'middle' && canDropInside)

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleCardDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    if (isOverInside) setIsOverInside(false)
    if (hoverPos !== 'none') setHoverPos('none')
  }

  const handleCardDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (draggedId === null) return
    if (!(canReorderInTree || canReorderInPinned || canDropInside)) return
    event.preventDefault()
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
    const y = event.clientY - rect.top
    const ratio = rect.height > 0 ? y / rect.height : 0.5

    let zone: 'top' | 'middle' | 'bottom'
    if (ratio < 0.25) zone = 'top'
    else if (ratio > 0.75) zone = 'bottom'
    else zone = 'middle'
    if (zone === 'middle' && !canDropInside) zone = ratio < 0.5 ? 'top' : 'bottom'

    setIsOverInside(false)
    setHoverPos('none')

    if (zone === 'middle' && canDropInside) {
      // дроп как потомок
      void store.moveTodo(draggedId, todo.id, todo.children.length)
      return
    }

    if (zone === 'top' || zone === 'bottom') {
      const targetIndex = zone === 'top' ? index : index + 1
      if (pinnedListId && canReorderInPinned) {
        void store.movePinnedTodo(draggedId, pinnedListId, targetIndex)
        store.clearDragged()
      } else if (canReorderInTree) {
        void store.moveTodo(draggedId, parentId, targetIndex)
      }
    }
  }

  const titleStyles = useMemo(
    () =>
      [
        'text-base font-medium leading-snug transition-colors',
        todo.completed ? 'text-slate-400 line-through' : 'text-slate-700',
      ].join(' '),
    [todo.completed],
  )

  return (
    <div className="space-y-1">
      <div
        className={[
          'group rounded-xl bg-white/95 ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md',
          isDragging ? 'opacity-60 ring-2 ring-slate-300' : '',
          isOverInside && canDropInside ? 'ring-2 ring-emerald-400/80 bg-emerald-50/50' : '',
          hoverPos === 'top' && !isOverInside ? 'border-t-2 border-emerald-400' : '',
          hoverPos === 'bottom' && !isOverInside ? 'border-b-2 border-emerald-400' : '',
        ].join(' ')}
        draggable={!isEditing && !isAddingChild}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleCardDragOver}
        onDragLeave={handleCardDragLeave}
        onDrop={handleCardDrop}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Toggle collapse button for nodes that can have children */}
          {allowChildren && (
            <button
              type="button"
              onClick={handleToggleCollapsed}
              className={`${actionButtonStyles} -ml-1.5 text-lg ${todo.children.length > 0 ? 'text-slate-500' : 'text-slate-300 cursor-default'}`}
              aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
              disabled={todo.children.length === 0}
            >
              {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
            </button>
          )}
          <button
            type="button"
            onClick={handleToggle}
            className={`${actionButtonStyles} text-xl text-slate-500`}
            aria-label={todo.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {todo.completed ? <FiCheckCircle /> : <FiCircle />}
          </button>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                  autoFocus
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setTitleDraft(todo.title)
                      setIsEditing(false)
                    }
                  }}
                  placeholder="Название задачи"
                />
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    type="submit"
                    className={`${actionButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`}
                    aria-label="Сохранить название"
                  >
                    <FiCheck />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitleDraft(todo.title)
                      setIsEditing(false)
                    }}
                    className={`${actionButtonStyles} hover:bg-slate-200`}
                    aria-label="Отменить редактирование"
                  >
                    <FiX />
                  </button>
                </div>
              </form>
            ) : (
              <p className={titleStyles}>{todo.title}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleTogglePinned}
                  className={[
                    actionButtonStyles,
                    todo.pinned ? 'text-amber-500 hover:text-amber-500' : '',
                  ].join(' ')}
                  aria-label={todo.pinned ? 'Открепить задачу' : 'Закрепить задачу'}
                  aria-pressed={todo.pinned}
                >
                  <FiStar className={todo.pinned ? 'text-amber-500' : undefined} />
                </button>
                {canAddChild && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingChild((value) => !value)
                    }}
                    className={actionButtonStyles}
                    aria-label={isAddingChild ? 'Скрыть форму добавления подзадачи' : 'Добавить подзадачу'}
                  >
                    <FiPlus />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={actionButtonStyles}
                  aria-label="Редактировать задачу"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className={`${actionButtonStyles} text-rose-400 hover:text-rose-600`}
                  aria-label="Удалить задачу"
                >
                  <FiTrash2 />
                </button>
              </>
            )}
          </div>
        </div>

  {canAddChild && isAddingChild && !isCollapsed && (
          <form onSubmit={handleAddChild} className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <input
              ref={childInputRef}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              value={childTitle}
              onChange={(event) => setChildTitle(event.target.value)}
              placeholder="Новая подзадача"
            />
            <div className="flex items-center gap-1">
              <button
                type="submit"
                className={`${actionButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`}
                aria-label="Добавить подзадачу"
              >
                <FiCheck />
              </button>
              <button
                type="button"
                onClick={() => {
                  setChildTitle('')
                  setIsAddingChild(false)
                }}
                className={actionButtonStyles}
                aria-label="Отменить добавление подзадачи"
              >
                <FiX />
              </button>
            </div>
          </form>
        )}
      </div>

      {canAddChild && !isCollapsed && (
        <div className="space-y-2 border-l border-slate-200/70 pl-6">
          {todo.children.map((child, childIndex) => (
            <Fragment key={child.id}>
              <TodoItem
                todo={child}
                depth={depth + 1}
                parentId={todo.id}
                index={childIndex}
              />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export const TodoItem = observer(TodoItemComponent)
