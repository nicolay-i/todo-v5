import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import type { DragEvent, ReactNode } from 'react'
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { MAX_DEPTH } from '../stores/TodoStore'
import type { Todo, TodoStore } from '../stores/TodoStore'
import { DropZone } from './DropZone'

interface TodoTreeProps {
  todos: Todo[]
  parentId: string | null
  depth: number
  store: TodoStore
  draggedId: string | null
  setDraggedId: (id: string | null) => void
}

function TodoTreeComponent({ todos, parentId, depth, store, draggedId, setDraggedId }: TodoTreeProps) {
  const handleDropComplete = () => setDraggedId(null)

  return (
    <div className="space-y-2">
      <DropZone
        parentId={parentId}
        index={0}
        draggedId={draggedId}
        store={store}
        onDropComplete={handleDropComplete}
      />
      {todos.map((todo, index) => {
        const childBranch =
          todo.children.length > 0 ||
          (draggedId ? store.canDrop(draggedId, todo.id) && depth < MAX_DEPTH : false)
            ? (
                <div className="ml-4 border-l border-slate-200/70 pl-5">
                  <TodoTree
                    todos={todo.children}
                    parentId={todo.id}
                    depth={depth + 1}
                    store={store}
                    draggedId={draggedId}
                    setDraggedId={setDraggedId}
                  />
                </div>
              )
            : null

        return (
          <div key={todo.id} className="space-y-2">
            <TodoCard
              todo={todo}
              depth={depth}
              store={store}
              draggedId={draggedId}
              setDraggedId={setDraggedId}
              childBranch={childBranch}
            />
            <DropZone
              parentId={parentId}
              index={index + 1}
              draggedId={draggedId}
              store={store}
              onDropComplete={handleDropComplete}
            />
          </div>
        )
      })}
    </div>
  )
}

export const TodoTree = observer(TodoTreeComponent)

interface TodoCardProps {
  todo: Todo
  depth: number
  store: TodoStore
  draggedId: string | null
  setDraggedId: (id: string | null) => void
  childBranch: ReactNode
}

const TodoCard = observer(({ todo, depth, store, draggedId, setDraggedId, childBranch }: TodoCardProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [childTitle, setChildTitle] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    if (!isEditing) {
      setDraft(todo.title)
    }
  }, [todo.title, isEditing])

  useEffect(() => {
    if (!draggedId) {
      setIsDragOver(false)
    }
  }, [draggedId])

  const canAddChild = depth < MAX_DEPTH
  const canDropAsChild = useMemo(
    () => (draggedId ? store.canDrop(draggedId, todo.id) : false),
    [draggedId, store, todo.id],
  )

  const handleToggle = () => {
    store.toggleTodo(todo.id)
  }

  const handleEditSubmit = () => {
    store.updateTodo(todo.id, draft)
    setIsEditing(false)
  }

  const handleChildSubmit = () => {
    store.addTodo(todo.id, childTitle)
    setChildTitle('')
    setIsAddingChild(false)
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (isEditing || isAddingChild) {
      event.preventDefault()
      return
    }
    setDraggedId(todo.id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', todo.id)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setIsDragOver(false)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canDropAsChild) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isDragOver) setIsDragOver(true)
  }

  const handleDragLeave = () => {
    if (isDragOver) setIsDragOver(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!draggedId || !canDropAsChild) return
    event.preventDefault()
    event.stopPropagation()
    store.moveTodo(draggedId, todo.id, todo.children.length)
    setDraggedId(null)
    setIsDragOver(false)
  }

  const actionButtonClasses =
    'rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-sky-300'

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm transition ${
        todo.completed ? 'opacity-80' : ''
      } ${isDragOver ? 'ring-2 ring-sky-200' : ''}`}
      draggable={!isEditing && !isAddingChild}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
        />
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoFocus
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={handleEditSubmit}
                className={`${actionButtonClasses} bg-sky-500 text-white hover:bg-sky-600 hover:text-white`}
                aria-label="Сохранить"
                title="Сохранить"
              >
                <FiCheck className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setDraft(todo.title)
                }}
                className={actionButtonClasses}
                aria-label="Отменить"
                title="Отменить"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <p
              className={`text-sm font-medium ${
                todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'
              }`}
            >
              {todo.title}
            </p>
          )}

          <div className="flex gap-2 text-xs text-slate-400">
            <span>Уровень {depth}</span>
            {todo.children.length > 0 && <span>{todo.children.length} подзадач</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {canAddChild && (
            <button
              type="button"
              onClick={() => {
                setIsAddingChild((prev) => !prev)
                setChildTitle('')
              }}
              className={actionButtonClasses}
              aria-label="Добавить подзадачу"
              title="Добавить подзадачу"
            >
              <FiPlus className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsEditing(true)
              setDraft(todo.title)
            }}
            className={actionButtonClasses}
            aria-label="Редактировать"
            title="Редактировать"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => store.removeTodo(todo.id)}
            className={`${actionButtonClasses} text-rose-500 hover:bg-rose-50 hover:text-rose-600`}
            aria-label="Удалить"
            title="Удалить"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isAddingChild && canAddChild && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <input
            value={childTitle}
            onChange={(event) => setChildTitle(event.target.value)}
            autoFocus
            placeholder="Название подзадачи"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={handleChildSubmit}
            className={`${actionButtonClasses} bg-sky-500 text-white hover:bg-sky-600 hover:text-white`}
            aria-label="Добавить"
            title="Добавить"
          >
            <FiCheck className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingChild(false)
              setChildTitle('')
            }}
            className={actionButtonClasses}
            aria-label="Закрыть"
            title="Закрыть"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {childBranch && <div className="mt-4 space-y-2">{childBranch}</div>}
    </div>
  )
})

