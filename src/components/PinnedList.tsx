'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiCheck, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import type { PinnedListView } from '@/stores/TodoStore'
import { useTodoStore } from '@/stores/TodoStoreContext'
import { TodoItem } from './TodoItem'

interface PinnedListProps {
  list: PinnedListView
}

const headerButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const actionConfirmButtonStyles = `${headerButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`

const PinnedListComponent = ({ list }: PinnedListProps) => {
  const store = useTodoStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(list.title)

  const isPrimary = store.isPrimaryPinnedList(list.id)
  const todos = list.todos
  const isRenameValid = titleDraft.trim().length > 0

  useEffect(() => {
    setTitleDraft(list.title)
  }, [list.title])

  const emptyStateMessage = useMemo(() => {
    if (isPrimary) {
      return 'Слот для задач сейчас пустой'
    }
    return 'Слот для задач сейчас пустой'
  }, [isPrimary])

  const handleRenameSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const trimmed = titleDraft.trim()
    if (!trimmed) return
    await store.renamePinnedList(list.id, trimmed)
    setIsEditingTitle(false)
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start gap-2">
        {isEditingTitle ? (
          <form onSubmit={handleRenameSubmit} className="flex flex-1 items-center gap-2">
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
              autoFocus
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setTitleDraft(list.title)
                  setIsEditingTitle(false)
                }
              }}
              placeholder="Название слота"
            />
            <div className="flex items-center gap-1">
              <button
                type="submit"
                disabled={!isRenameValid}
                className={`${
                  isRenameValid
                    ? actionConfirmButtonStyles
                    : `${actionConfirmButtonStyles} cursor-not-allowed opacity-60`
                }`}
                aria-label="Сохранить название слота"
              >
                <FiCheck />
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleDraft(list.title)
                  setIsEditingTitle(false)
                }}
                className={headerButtonStyles}
                aria-label="Отменить переименование"
              >
                <FiX />
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="flex-1 text-sm font-semibold text-slate-700">{list.title}</h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className={headerButtonStyles}
                aria-label="Переименовать слот"
              >
                <FiEdit2 />
              </button>
              <button
                type="button"
                onClick={() => {
                  void store.deletePinnedList(list.id)
                }}
                className={`${headerButtonStyles} ${
                  isPrimary ? 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-slate-400' : 'text-rose-400 hover:text-rose-600'
                }`}
                aria-label={isPrimary ? 'Первый слот нельзя удалить' : 'Удалить слот'}
                disabled={isPrimary}
              >
                <FiTrash2 />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {todos.map((todo, index) => (
          <Fragment key={todo.id}>
            <TodoItem
              todo={todo}
              depth={0}
              allowChildren={false}
              parentId={null}
              index={index}
              pinnedListId={list.id}
            />
          </Fragment>
        ))}
      </div>

      {todos.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-6 text-center text-xs text-amber-600">
          {emptyStateMessage}
        </div>
      )}
    </div>
  )
}

export const PinnedList = observer(PinnedListComponent)
