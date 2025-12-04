'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiCheck, FiEdit2, FiTrash2, FiX, FiChevronDown, FiChevronRight, FiStar, FiMoreVertical, FiClock, FiSearch } from 'react-icons/fi'
import type { PinnedListView } from '@/stores/TodoStore'
import { useTodoStore } from '@/stores/TodoStoreContext'
// мини-плейсхолдеры для сортировки больше не используются
import { TodoItem } from './TodoItem'
import { SearchTodoModal } from './SearchTodoModal'

interface PinnedListProps {
  list: PinnedListView
}

const headerButtonStyles =
  'rounded-lg p-1.5 text-slate-400 dark:text-slate-500 transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 focus-visible:outline-none'

const actionConfirmButtonStyles = `${headerButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`

const PinnedListComponent = ({ list }: PinnedListProps) => {
  const store = useTodoStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(list.title)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAddingTemporary, setIsAddingTemporary] = useState(false)
  const [temporaryTitle, setTemporaryTitle] = useState('')
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isSearchModalMounted, setIsSearchModalMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isPrimary = store.isPrimaryPinnedList(list.id)
  const todos = list.todos
  const isRenameValid = titleDraft.trim().length > 0
  const isCollapsed = store.isPinnedListCollapsed(list.id)
  const isActive = store.isActivePinnedList(list.id)

  useEffect(() => {
    setTitleDraft(list.title)
  }, [list.title])

  useEffect(() => {
    if (isAddingTemporary && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingTemporary])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

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

  const handleAddTemporary = async () => {
    const trimmed = temporaryTitle.trim()
    if (!trimmed) return
    await store.addTemporaryTodoToPinnedList(list.id, trimmed)
    setTemporaryTitle('')
    setIsAddingTemporary(false)
    setIsMenuOpen(false)
  }

  const handleCancelTemporary = () => {
    setTemporaryTitle('')
    setIsAddingTemporary(false)
    setIsMenuOpen(false)
  }

  const openSearchModal = () => {
    setIsSearchModalMounted(true)
    requestAnimationFrame(() => setIsSearchModalOpen(true))
  }

  const closeSearchModal = () => {
    setIsSearchModalOpen(false)
    window.setTimeout(() => setIsSearchModalMounted(false), 200)
  }

  return (
    <div className={["flex flex-col rounded-2xl bg-white/90 dark:bg-slate-800/90 p-4 shadow-sm ring-1", isActive ? 'ring-emerald-400 dark:ring-emerald-500' : 'ring-slate-200 dark:ring-slate-700'].join(' ')}>
      <div className="flex items-start gap-2">
        {isEditingTitle ? (
          <form onSubmit={handleRenameSubmit} className="flex flex-1 items-center gap-2">
            <input
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 shadow-sm focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none"
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
                className={`${isRenameValid
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
            <button
              type="button"
              onClick={() => store.togglePinnedListCollapse(list.id)}
              className="mr-2 rounded-md p-1 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 focus-visible:outline-none"
              aria-label={isCollapsed ? 'Развернуть слот' : 'Свернуть слот'}
              title={isCollapsed ? 'Развернуть' : 'Свернуть'}
            >
              {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
            </button>
            <h3 className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {list.title}
              <span className="ml-2 rounded bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{todos.length}</span>
            </h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => store.setActivePinnedList(list.id)}
                className={[headerButtonStyles, isActive ? 'text-emerald-600 hover:text-emerald-700' : ''].join(' ')}
                aria-label={isActive ? 'Активный слот' : 'Сделать активным'}
                title={isActive ? 'Активный слот' : 'Сделать активным'}
              >
                <FiStar />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTemporary(true)}
                className={headerButtonStyles}
                aria-label="Добавить временную задачу"
                title="Добавить временную задачу"
              >
                <FiClock />
              </button>
              <button
                type="button"
                onClick={openSearchModal}
                className={headerButtonStyles}
                aria-label="Поиск задач"
                title="Поиск задач"
              >
                <FiSearch />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={headerButtonStyles}
                  aria-label="Меню слота"
                  title="Меню слота"
                >
                  <FiMoreVertical />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingTitle(true)
                        setIsMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-t-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <FiEdit2 className="text-slate-400" />
                      <span>Переименовать слот</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void store.deletePinnedList(list.id)
                        setIsMenuOpen(false)
                      }}
                      disabled={isPrimary}
                      className={`flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-left text-sm ${
                        isPrimary
                          ? 'cursor-not-allowed opacity-40 text-slate-400'
                          : 'text-rose-600 hover:bg-slate-50'
                      }`}
                    >
                      <FiTrash2 className="text-slate-400" />
                      <span>Удалить слот</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <>
          {isAddingTemporary && (
            <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void handleAddTemporary()
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  className="flex-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 shadow-sm focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none"
                  placeholder="Название временной задачи"
                  value={temporaryTitle}
                  onChange={(e) => setTemporaryTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleCancelTemporary()
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!temporaryTitle.trim()}
                  className={`rounded-lg p-2 text-sm transition-colors ${
                    temporaryTitle.trim()
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  }`}
                  aria-label="Добавить временную задачу"
                >
                  <FiCheck />
                </button>
                <button
                  type="button"
                  onClick={handleCancelTemporary}
                  className="rounded-lg p-2 text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label="Отменить"
                >
                  <FiX />
                </button>
              </form>
            </div>
          )}
          <PinnedListContainer
            listId={list.id}
            todosCount={todos.length}
            emptyMessage={emptyStateMessage}
          >
            {todos.map((todo, index) => (
              <Fragment key={todo.id}>
                <TodoItem todo={todo} depth={0} parentId={null} index={index} pinnedListId={list.id} allowChildren={false} />
              </Fragment>
            ))}
          </PinnedListContainer>
        </>
      )}

      <SearchTodoModal
        pinnedListId={list.id}
        isOpen={isSearchModalOpen}
        isMounted={isSearchModalMounted}
        onClose={closeSearchModal}
      />
    </div>
  )
}

export const PinnedList = observer(PinnedListComponent)

interface PLCProps {
  listId: string
  todosCount: number
  emptyMessage: string
  children: React.ReactNode
}

const PinnedListContainer = observer(({ listId, todosCount, emptyMessage, children }: PLCProps) => {
  const store = useTodoStore()
  const draggedId = store.draggedId
  const canAccept = draggedId !== null && store.isPinned(draggedId)
  const [isOverEmpty, setIsOverEmpty] = useState(false)
  const isEmpty = todosCount === 0

  const handleEmptyOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept || !isEmpty) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isOverEmpty) {
      setIsOverEmpty(true)
    }
  }

  const handleEmptyLeave: React.DragEventHandler<HTMLDivElement> = () => {
    if (isOverEmpty) {
      setIsOverEmpty(false)
    }
  }

  const handleEmptyDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept || draggedId === null || !isEmpty) return
    event.preventDefault()
    setIsOverEmpty(false)
    void store.movePinnedTodo(draggedId, listId, 0)
    store.clearDragged()
  }

  const containerClasses = ['mt-4']
  if (!isEmpty) {
    containerClasses.push('space-y-3')
  }

  return (
    <div
      className={containerClasses.join(' ')}
      onDragOver={handleEmptyOver}
      onDragLeave={handleEmptyLeave}
      onDrop={handleEmptyDrop}
    >
      {isEmpty ? (
        <div
          className={[
            'flex min-h-[96px] items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center text-xs transition-colors',
            isOverEmpty && canAccept
              ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200'
              : 'border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
          ].join(' ')}
        >
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  )
})
