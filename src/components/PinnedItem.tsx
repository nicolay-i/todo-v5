import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiCheck, FiCheckCircle, FiCircle, FiEdit2, FiStar, FiTrash2, FiX } from 'react-icons/fi'
import { type TodoNode } from '../stores/TodoStore'
import { useTodoStore } from '../stores/TodoStoreContext'

interface PinnedItemProps {
  todo: TodoNode
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const PinnedItemComponent = ({ todo }: PinnedItemProps) => {
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)

  useEffect(() => {
    setTitleDraft(todo.title)
  }, [todo.title])

  const isDragging = store.draggedPinnedId === todo.id

  const handleToggle = () => {
    store.toggleTodo(todo.id)
  }

  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.updateTitle(todo.id, titleDraft)
    setIsEditing(false)
  }

  const handleDelete = () => {
    store.deleteTodo(todo.id)
  }

  const handleUnpin = () => {
    store.unpinTodo(todo.id)
  }

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    store.setPinnedDragged(todo.id)
    event.dataTransfer.setData('text/plain', todo.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
    store.clearPinnedDragged()
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
    <div
      className={[
        'group rounded-xl bg-white/95 ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md',
        isDragging ? 'opacity-60 ring-2 ring-amber-300' : '',
      ].join(' ')}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={handleToggle}
          className={`${actionButtonStyles} -ml-1.5 text-xl text-slate-500`}
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
                onClick={handleUnpin}
                className={`${actionButtonStyles} text-amber-500 hover:text-amber-600`}
                aria-label="Открепить задачу"
              >
                <FiStar />
              </button>
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
  )
}

export const PinnedItem = observer(PinnedItemComponent)
