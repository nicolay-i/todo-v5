import { Fragment, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiCheck, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { TodoItem } from './TodoItem'
import { PinnedDropZone } from './PinnedDropZone'
import { type PinnedList, type TodoNode } from '../stores/TodoStore'
import { useTodoStore } from '../stores/TodoStoreContext'

interface PinnedListWithTodos extends PinnedList {
  todos: TodoNode[]
}

interface PinnedListColumnProps {
  list: PinnedListWithTodos
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const PinnedListColumnComponent = ({ list }: PinnedListColumnProps) => {
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(list.title)

  useEffect(() => {
    if (!isEditing) {
      setTitleDraft(list.title)
    }
  }, [isEditing, list.title])

  const isPinnedDragging = store.draggedId ? store.isPinned(store.draggedId) : false

  const handleRenameSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.renamePinnedList(list.id, titleDraft)
    setIsEditing(false)
  }

  const handleDeleteList = () => {
    store.removePinnedList(list.id)
  }

  const showEmptyMessage = list.todos.length === 0

  return (
    <div
      className={[
        'flex w-72 flex-col gap-4 rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 transition-all duration-200',
        isPinnedDragging ? 'ring-amber-200/70' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={handleRenameSubmit} className="flex items-center gap-2">
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setTitleDraft(list.title)
                    setIsEditing(false)
                  }
                }}
                placeholder="Название списка"
              />
              <div className="flex items-center gap-1">
                <button
                  type="submit"
                  className={`${actionButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`}
                  aria-label="Сохранить название списка"
                >
                  <FiCheck />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleDraft(list.title)
                    setIsEditing(false)
                  }}
                  className={actionButtonStyles}
                  aria-label="Отменить переименование"
                >
                  <FiX />
                </button>
              </div>
            </form>
          ) : (
            <h3 className="text-base font-semibold text-slate-700">{list.title}</h3>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={actionButtonStyles}
              aria-label="Переименовать список"
            >
              <FiEdit2 />
            </button>
            {!list.locked && (
              <button
                type="button"
                onClick={handleDeleteList}
                className={`${actionButtonStyles} text-rose-400 hover:text-rose-600`}
                aria-label="Удалить список"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3">
        <PinnedDropZone listId={list.id} index={0} isListEmpty={list.todos.length === 0} />

        {showEmptyMessage ? (
          <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/60 px-3 py-6 text-center text-sm text-slate-400">
            Перетащите сюда закреплённую задачу или закрепите новую во вкладке «Список задач».
          </div>
        ) : (
          list.todos.map((todo, index) => (
            <Fragment key={todo.id}>
              <TodoItem todo={todo} depth={0} allowChildren={false} />
              <PinnedDropZone listId={list.id} index={index + 1} />
            </Fragment>
          ))
        )}
      </div>
    </div>
  )
}

export const PinnedListColumn = observer(PinnedListColumnComponent)
