import { Fragment, useEffect, useState } from 'react'
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
import { MindMapDropZone } from './MindMapDropZone'
import { MAX_DEPTH, type TodoNode } from '../stores/TodoStore'
import { useTodoStore } from '../stores/TodoStoreContext'
import { isTodoSubtreeComplete } from '../utils/todoTree'

interface MindMapNodeProps {
  todo: TodoNode
  depth: number
  hideCompleted: boolean
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const MindMapNodeComponent = ({ todo, depth, hideCompleted }: MindMapNodeProps) => {
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)
  const [childTitle, setChildTitle] = useState('')

  const canAddChild = depth < MAX_DEPTH
  const isDragging = store.draggedId === todo.id
  const visibleChildren = hideCompleted
    ? todo.children.filter((child) => !isTodoSubtreeComplete(child))
    : todo.children
  const showChildrenArea = canAddChild && (visibleChildren.length > 0 || store.draggedId !== null)

  useEffect(() => {
    setTitleDraft(todo.title)
  }, [todo.title])

  const handleToggle = () => {
    store.toggleTodo(todo.id)
  }

  const handleDelete = () => {
    store.deleteTodo(todo.id)
  }

  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.updateTitle(todo.id, titleDraft)
    setIsEditing(false)
  }

  const handleAddChild: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(todo.id, childTitle)
    setChildTitle('')
    setIsAddingChild(false)
  }

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    store.setDragged(todo.id)
    event.dataTransfer.setData('text/plain', todo.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
    store.clearDragged()
  }

  const titleClasses = [
    'text-sm font-semibold leading-snug transition-colors',
    todo.completed ? 'text-slate-400 line-through' : 'text-slate-700',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="mx-3 my-3 flex flex-col items-center">
      {depth > 0 && <div className="mb-2 h-5 w-0.5 rounded-full bg-slate-300" aria-hidden />}
      <div
        className={[
          'group relative w-64 max-w-xs rounded-2xl bg-white/95 px-5 py-4 text-left shadow ring-1 ring-slate-200 transition-all duration-200',
          isDragging ? 'opacity-60 ring-2 ring-slate-300' : 'hover:shadow-lg',
        ].join(' ')}
        draggable={!isEditing && !isAddingChild}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`${actionButtonStyles} -ml-1.5 text-lg`}
            aria-label={todo.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {todo.completed ? <FiCheckCircle /> : <FiCircle />}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
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
                <div className="flex items-center gap-1 self-end">
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
              <p className={titleClasses}>{todo.title}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                {canAddChild && (
                  <button
                    type="button"
                    onClick={() => setIsAddingChild((value) => !value)}
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

        {canAddChild && isAddingChild && (
          <form onSubmit={handleAddChild} className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50/90 px-3 py-2">
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

      {showChildrenArea && (
        <div className="relative mt-6 flex w-full flex-col items-center">
          {visibleChildren.length > 0 && (
            <div className="pointer-events-none absolute top-0 left-1/2 h-5 w-0.5 -translate-x-1/2 bg-slate-300" aria-hidden />
          )}
          <div className="flex flex-wrap justify-center pt-5">
            <MindMapDropZone parentId={todo.id} depth={depth + 1} index={0} size="sm" />
            {visibleChildren.map((child, index) => (
              <Fragment key={child.id}>
                <MindMapNode todo={child} depth={depth + 1} hideCompleted={hideCompleted} />
                <MindMapDropZone parentId={todo.id} depth={depth + 1} index={index + 1} size="sm" />
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const MindMapNode = observer(MindMapNodeComponent)
