import { Fragment, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiPlus } from 'react-icons/fi'
import { TodoItem } from './components/TodoItem'
import { DropZone } from './components/DropZone'
import { PinnedListColumn } from './components/PinnedListColumn'
import { useTodoStore } from './stores/TodoStoreContext'

const AppComponent = () => {
  const store = useTodoStore()
  const [newTitle, setNewTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'pinned' | 'all'>('pinned')
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState('')

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(null, newTitle)
    setNewTitle('')
  }

  const pinnedLists = store.pinnedListsView

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        {/* <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Задачи</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-800">Дерево задач</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Добавляйте задачи, группируйте их по уровням и перетаскивайте элементы, чтобы быстро управлять приоритетами. Максимальная глубина — три уровня.
          </p>
        </header> */}

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

          {activeTab === 'pinned' ? (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Создавайте отдельные списки для закреплённых задач и перетаскивайте элементы между ними.
                </p>
                {isCreatingList ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      const trimmed = newListTitle.trim()
                      const fallbackTitle = `Список ${pinnedLists.length + 1}`
                      store.addPinnedList(trimmed || fallbackTitle)
                      setNewListTitle('')
                      setIsCreatingList(false)
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
                      value={newListTitle}
                      onChange={(event) => setNewListTitle(event.target.value)}
                      placeholder="Название списка"
                      autoFocus
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          setNewListTitle('')
                          setIsCreatingList(false)
                        }
                      }}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500/90"
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewListTitle('')
                          setIsCreatingList(false)
                        }}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCreatingList(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <FiPlus />
                    Новый список
                  </button>
                )}
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {pinnedLists.map((list) => (
                  <PinnedListColumn key={list.id} list={list} />
                ))}
              </div>
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

export const App = observer(AppComponent)
