import { Fragment, useEffect, useMemo, useState } from 'react'
import type { DragEventHandler, FormEventHandler } from 'react'
import { observer } from 'mobx-react-lite'
import {
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { MAX_DEPTH, type TodoNode } from '../stores/TodoStore'
import { useTodoStore } from '../stores/TodoStoreContext'

interface MindMapViewProps {
  hideCompleted: boolean
}

interface MindMapNodeProps {
  todo: TodoNode
  depth: number
  hideCompleted: boolean
}

interface MindMapDropZoneProps {
  parentId: string | null
  index: number
  depth: number
  variant: 'between' | 'child'
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

function isNodeVisible(node: TodoNode, hideCompleted: boolean): boolean {
  if (!hideCompleted) return true
  if (node.completed) return false
  if (node.children.length === 0) return true
  return node.children.some((child) => isNodeVisible(child, hideCompleted))
}

function getVisibleChildren(node: TodoNode, hideCompleted: boolean): TodoNode[] {
  if (!hideCompleted) {
    return node.children
  }

  return node.children.filter((child) => isNodeVisible(child, hideCompleted))
}

const MindMapDropZoneComponent = ({ parentId, index, depth, variant }: MindMapDropZoneProps) => {
  const store = useTodoStore()
  const [isOver, setIsOver] = useState(false)

  if (depth > MAX_DEPTH + 1) {
    return null
  }

  const draggedId = store.draggedId
  const canAccept = draggedId !== null && store.canDrop(draggedId, parentId)
  const showPlaceholder = draggedId !== null && canAccept

  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isOver) {
      setIsOver(true)
    }
  }

  const handleDragLeave: DragEventHandler<HTMLDivElement> = () => {
    if (isOver) {
      setIsOver(false)
    }
  }

  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept || draggedId === null) return
    event.preventDefault()
    setIsOver(false)
    store.moveTodo(draggedId, parentId, index)
  }

  const sizeClass = showPlaceholder
    ? variant === 'between'
      ? 'h-16 w-5'
      : 'h-20 w-36'
    : 'h-0 w-0'

  return (
    <div className="flex items-center justify-center">
      <div
        className={[
          'border border-dashed transition-all duration-150 ease-out',
          sizeClass,
          variant === 'between' ? 'rounded-full' : 'rounded-xl',
          showPlaceholder ? 'opacity-100' : 'opacity-0',
          canAccept ? 'border-slate-300 bg-slate-200/60' : 'border-transparent bg-transparent',
          isOver && canAccept ? 'border-slate-400 bg-slate-200' : '',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-hidden
      />
    </div>
  )
}

const MindMapDropZone = observer(MindMapDropZoneComponent)

const MindMapNodeComponent = ({ todo, depth, hideCompleted }: MindMapNodeProps) => {
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)
  const [childTitle, setChildTitle] = useState('')

  useEffect(() => {
    setTitleDraft(todo.title)
  }, [todo.title])

  const canAddChild = depth < MAX_DEPTH
  const isDragging = store.draggedId === todo.id
  const visibleChildren = getVisibleChildren(todo, hideCompleted)
  const shouldRenderChildrenArea = visibleChildren.length > 0 || store.draggedId !== null

  const titleStyles = useMemo(
    () =>
      [
        'text-base font-semibold leading-tight transition-colors',
        todo.completed ? 'text-slate-400 line-through' : 'text-slate-700',
      ].join(' '),
    [todo.completed],
  )

  const handleToggle = () => {
    store.toggleTodo(todo.id)
  }

  const handleEditSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.updateTitle(todo.id, titleDraft)
    setIsEditing(false)
  }

  const handleAddChild: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(todo.id, childTitle)
    setChildTitle('')
    setIsAddingChild(false)
  }

  const handleDelete = () => {
    store.deleteTodo(todo.id)
  }

  const handleDragStart: DragEventHandler<HTMLDivElement> = (event) => {
    store.setDragged(todo.id)
    event.dataTransfer.setData('text/plain', todo.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd: DragEventHandler<HTMLDivElement> = () => {
    store.clearDragged()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={[
          'w-64 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:shadow-lg',
          isDragging ? 'opacity-60 ring-2 ring-slate-300' : '',
        ].join(' ')}
        draggable={!isEditing && !isAddingChild}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`${actionButtonStyles} -ml-1.5 mt-0.5 text-lg text-slate-500`}
            aria-label={todo.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {todo.completed ? <FiCheckCircle /> : <FiCircle />}
          </button>

          <div className="flex-1 space-y-3">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-2">
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
                <div className="flex items-center gap-1">
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
                    className={actionButtonStyles}
                    aria-label="Отменить редактирование"
                  >
                    <FiX />
                  </button>
                </div>
              </form>
            ) : (
              <p className={titleStyles}>{todo.title}</p>
            )}

            {canAddChild && isAddingChild && (
              <form onSubmit={handleAddChild} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                <input
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

          <div className="flex items-start gap-1">
            {!isEditing && (
              <>
                {canAddChild && (
                  <button
                    type="button"
                    onClick={() => setIsAddingChild((value) => !value)}
                    className={actionButtonStyles}
                    aria-label={isAddingChild ? 'Скрыть форму добавления подзадачи' : 'Добавить подзадачу'}
                  >
                    {isAddingChild ? <FiX /> : <FiPlus />}
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
      </div>

      {shouldRenderChildrenArea && (
        <div className="flex flex-col items-center">
          {visibleChildren.length > 0 && <div className="h-6 w-px bg-slate-300" />}
          <div className={`flex flex-wrap justify-center gap-6 ${visibleChildren.length > 0 ? 'mt-4' : 'mt-2'}`}>
            <MindMapDropZone
              parentId={todo.id}
              depth={depth + 1}
              index={0}
              variant={visibleChildren.length === 0 ? 'child' : 'between'}
            />
            {visibleChildren.map((child, index) => (
              <Fragment key={child.id}>
                <MindMapNode todo={child} depth={depth + 1} hideCompleted={hideCompleted} />
                <MindMapDropZone parentId={todo.id} depth={depth + 1} index={index + 1} variant="between" />
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MindMapNode = observer(MindMapNodeComponent)

const MindMapViewComponent = ({ hideCompleted }: MindMapViewProps) => {
  const store = useTodoStore()
  const visibleRoots = hideCompleted
    ? store.todos.filter((todo) => isNodeVisible(todo, hideCompleted))
    : store.todos
  const shouldRenderCanvas = visibleRoots.length > 0 || store.draggedId !== null
  const hasTodos = store.todos.length > 0

  return (
    <div className="space-y-6">
      {shouldRenderCanvas && (
        <div className="relative overflow-x-auto">
          <div className="min-w-full px-2 pb-6">
            <div className="flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-6">
                <MindMapDropZone
                  parentId={null}
                  depth={0}
                  index={0}
                  variant={visibleRoots.length === 0 ? 'child' : 'between'}
                />
                {visibleRoots.map((todo, index) => (
                  <Fragment key={todo.id}>
                    <MindMapNode todo={todo} depth={0} hideCompleted={hideCompleted} />
                    <MindMapDropZone parentId={null} depth={0} index={index + 1} variant="between" />
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {visibleRoots.length === 0 && store.draggedId === null && (
        <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
          {hideCompleted && hasTodos
            ? 'Все задачи скрыты фильтром — отключите скрытие, чтобы просмотреть карту.'
            : 'Постройте mind map, добавляя основные задачи и их подветки.'}
        </div>
      )}
    </div>
  )
}

export const MindMapView = observer(MindMapViewComponent)
