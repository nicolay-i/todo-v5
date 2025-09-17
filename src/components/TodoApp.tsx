'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiPlus } from 'react-icons/fi'
import { TodoItem } from './TodoItem'
import { DropZone } from './DropZone'
import { PinnedList } from './PinnedList'
import { useTodoStore } from '@/stores/TodoStoreContext'

const TodoAppComponent = () => {
  const store = useTodoStore()
  const [newTitle, setNewTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'pinned' | 'all'>('pinned')
  const [isAddingPinnedList, setIsAddingPinnedList] = useState(false)
  const [newPinnedListTitle, setNewPinnedListTitle] = useState('')

  useEffect(() => {
    void store.loadInitialState()
  }, [store])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(null, newTitle)
    setNewTitle('')
  }

  const handlePinnedListSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const trimmed = newPinnedListTitle.trim()
    if (!trimmed) return
    store.addPinnedList(trimmed)
    setNewPinnedListTitle('')
    setIsAddingPinnedList(false)
  }

  const cancelPinnedListCreation = () => {
    setNewPinnedListTitle('')
    setIsAddingPinnedList(false)
  }

  const pinnedLists = store.pinnedListsWithTodos
  const totalPinned = useMemo(
    () => pinnedLists.reduce((accumulator, list) => accumulator + list.todos.length, 0),
    [pinnedLists],
  )
  const isPinnedListTitleValid = newPinnedListTitle.trim().length > 0

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex-1 rounded-3xl bg-white/60 p-5 shadow-inner ring-1 ring-white/40">
          <div className="mb-6 flex justify-start">
            <div className="flex rounded-2xl bg-white/70 p-1 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveTab('pinned')}
                className={[
                  'rounded-xl px-4 py-2 transition focus-visible:outline-none',
                  activeTab === 'pinned'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                ].join(' ')}
              >
                Закрепленные
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={[
                  'rounded-xl px-4 py-2 transition focus-visible:outline-none',
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                ].join(' ')}
              >
                Список задач
              </button>
            </div>
          </div>

          {store.isLoading ? (
            <div className="flex flex-1 items-center justify-center py-20 text-sm text-slate-500">
              Загружаем задачи...
            </div>
          ) : store.error ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center text-sm text-rose-600">
              <p>{store.error}</p>
              <button
                type="button"
                onClick={() => store.loadInitialState()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                Повторить попытку
              </button>
            </div>
          ) : activeTab === 'pinned' ? (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-slate-600">Списки закрепленных задач</h2>
                {isAddingPinnedList ? (
                  <form
                    onSubmit={handlePinnedListSubmit}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:flex-row sm:items-center"
                  >
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
                      placeholder="Название нового списка"
                      value={newPinnedListTitle}
                      onChange={(event) => setNewPinnedListTitle(event.target.value)}
                    />
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="submit"
                        disabled={!isPinnedListTitleValid}
                        className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition ${
                          isPinnedListTitleValid
                            ? 'bg-slate-900 hover:bg-slate-800'
                            : 'cursor-not-allowed bg-slate-400'
                        }`}
                      >
                        Создать
                      </button>
                      <button
                        type="button"
                        onClick={cancelPinnedListCreation}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingPinnedList(true)}
                    className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-white"
                  >
                    <FiPlus />
                    Новый список
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {pinnedLists.map((list) => (
                  <PinnedList key={list.id} list={list} />
                ))}
              </div>

              {totalPinned === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
                  Закрепите важные задачи на вкладке «Список задач», чтобы быстро возвращаться к ним.
                </div>
              )}
            </>
          ) : (
            <>
              <form
                onSubmit={handleSubmit}
                className="mb-8 flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center"
              >
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
                  placeholder="Новая задача"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
                  aria-label="Добавить задачу"
                >
                  <FiPlus />
                  Добавить
                </button>
              </form>
              <div className="space-y-3">
                <DropZone parentId={null} depth={0} index={0} />
                {store.todos.map((todo, index) => (
                  <Fragment key={todo.id}>
                    <TodoItem todo={todo} depth={0} />
                    <DropZone parentId={null} depth={0} index={index + 1} />
                  </Fragment>
                ))}
              </div>

              {store.todos.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                  Начните с новой задачи — вы всегда сможете добавить вложенные подзадачи и перетащить элементы между уровнями.
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export const TodoApp = observer(TodoAppComponent)
