import { Fragment, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiCheck, FiEdit2, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { PinnedDropZone } from './PinnedDropZone'
import { TodoItem } from './TodoItem'
import { useTodoStore } from '../stores/TodoStoreContext'
import type { PinnedList, TodoNode } from '../stores/TodoStore'

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

interface PinnedListCardProps {
  list: PinnedList
  todos: TodoNode[]
  canDelete: boolean
}

const PinnedListCardComponent = ({ list, todos, canDelete }: PinnedListCardProps) => {
  const store = useTodoStore()
  const [isRenaming, setIsRenaming] = useState(false)
  const [titleDraft, setTitleDraft] = useState(list.title)

  useEffect(() => {
    setTitleDraft(list.title)
  }, [list.title])

  const isEmpty = todos.length === 0

  const handleRename: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.renamePinnedList(list.id, titleDraft)
    setIsRenaming(false)
  }

  return (
    <div className="rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-2 border-b border-slate-200/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex flex-1 items-center gap-2">
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              autoFocus
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setTitleDraft(list.title)
                  setIsRenaming(false)
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
                  setIsRenaming(false)
                }}
                className={actionButtonStyles}
                aria-label="Отменить переименование списка"
              >
                <FiX />
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-1 items-center justify-between gap-2">
            <p className="text-base font-semibold text-slate-700">{list.title}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsRenaming(true)}
                className={actionButtonStyles}
                aria-label="Переименовать список"
              >
                <FiEdit2 />
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => store.deletePinnedList(list.id)}
                  className={`${actionButtonStyles} text-rose-400 hover:text-rose-600`}
                  aria-label="Удалить список"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 px-4 py-4">
        <PinnedDropZone listId={list.id} index={0} />
        {todos.map((todo, index) => (
          <Fragment key={todo.id}>
            <TodoItem todo={todo} depth={0} allowChildren={false} />
            <PinnedDropZone listId={list.id} index={index + 1} />
          </Fragment>
        ))}

        {isEmpty && (
          <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-3 py-4 text-center text-xs font-medium text-amber-600">
            Список пуст — перетащите сюда закрепленную задачу.
          </p>
        )}
      </div>
    </div>
  )
}

const PinnedListCard = observer(PinnedListCardComponent)

const PinnedListsComponent = () => {
  const store = useTodoStore()
  const [isAddingList, setIsAddingList] = useState(false)
  const [listTitle, setListTitle] = useState('')

  const groups = store.pinnedListsWithTodos
  const hasPinnedTodos = groups.some((group) => group.todos.length > 0)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addPinnedList(listTitle)
    setListTitle('')
    setIsAddingList(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Списки закрепленных задач</h2>
        {isAddingList ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className="w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              autoFocus
              value={listTitle}
              onChange={(event) => setListTitle(event.target.value)}
              placeholder="Название списка"
            />
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                type="submit"
                className={`${actionButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`}
                aria-label="Создать список"
              >
                <FiCheck />
              </button>
              <button
                type="button"
                onClick={() => {
                  setListTitle('')
                  setIsAddingList(false)
                }}
                className={actionButtonStyles}
                aria-label="Отменить создание списка"
              >
                <FiX />
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingList(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <FiPlus /> Добавить список
          </button>
        )}
      </div>

      {!hasPinnedTodos && (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
          Закрепите важные задачи и распределите их по спискам, чтобы быстро находить нужные элементы.
        </div>
      )}

      <div className="space-y-4">
        {groups.map(({ list, todos }) => (
          <PinnedListCard key={list.id} list={list} todos={todos} canDelete={store.canDeletePinnedList(list.id)} />
        ))}
      </div>
    </div>
  )
}

export const PinnedLists = observer(PinnedListsComponent)
