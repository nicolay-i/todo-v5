import { Fragment, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiCheck, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { TodoItem } from './TodoItem'
import { PinnedDropZone } from './PinnedDropZone'
import { useTodoStore } from '../stores/TodoStoreContext'
import type { TodoNode } from '../stores/TodoStore'

interface PinnedListProps {
  id: string
  title: string
  todos: TodoNode[]
  isFirst: boolean
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const PinnedListComponent = ({ id, title, todos, isFirst }: PinnedListProps) => {
  const store = useTodoStore()
  const [isRenaming, setIsRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState(title)

  useEffect(() => {
    setTitleDraft(title)
  }, [title])

  const handleRenameSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.renamePinnedList(id, titleDraft)
    setIsRenaming(false)
  }

  const handleDelete = () => {
    store.removePinnedList(id)
  }

  return (
    <div className="flex w-72 flex-col rounded-3xl bg-white/90 p-4 shadow-inner ring-1 ring-slate-200/80">
      <div className="mb-3 flex items-center gap-2">
        {isRenaming ? (
          <form onSubmit={handleRenameSubmit} className="flex flex-1 items-center gap-2">
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setTitleDraft(title)
                  setIsRenaming(false)
                }
              }}
              autoFocus
            />
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
                setTitleDraft(title)
                setIsRenaming(false)
              }}
              className={`${actionButtonStyles} hover:bg-slate-200`}
              aria-label="Отменить переименование"
            >
              <FiX />
            </button>
          </form>
        ) : (
          <>
            <h3 className="flex-1 text-base font-semibold text-slate-700">{title}</h3>
            <button
              type="button"
              onClick={() => setIsRenaming(true)}
              className={actionButtonStyles}
              aria-label="Переименовать список"
            >
              <FiEdit2 />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={`${actionButtonStyles} ${isFirst ? 'cursor-not-allowed opacity-40' : 'text-rose-400 hover:text-rose-600'}`}
              aria-label={isFirst ? 'Нельзя удалить основной список' : 'Удалить список'}
              disabled={isFirst}
            >
              <FiTrash2 />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 space-y-3">
        <PinnedDropZone listId={id} index={0} />
        {todos.map((todo, index) => (
          <Fragment key={todo.id}>
            <TodoItem todo={todo} depth={0} allowChildren={false} />
            <PinnedDropZone listId={id} index={index + 1} />
          </Fragment>
        ))}
        {todos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-amber-200/60 bg-amber-50/60 px-4 py-6 text-center text-xs text-amber-700">
            Перетащите закреплённые задачи или добавьте их из списка задач.
          </div>
        )}
      </div>
    </div>
  )
}

export const PinnedList = observer(PinnedListComponent)
