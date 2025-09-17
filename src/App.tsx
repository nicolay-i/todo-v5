import { Fragment, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiPlus } from 'react-icons/fi'
import { TodoItem } from './components/TodoItem'
import { DropZone } from './components/DropZone'
import { PinnedItem } from './components/PinnedItem'
import { PinnedDropZone } from './components/PinnedDropZone'
import { useTodoStore } from './stores/TodoStoreContext'

const AppComponent = () => {
  const store = useTodoStore()
  const [newTitle, setNewTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'pinned' | 'todos'>('pinned')
  const pinnedTodos = store.pinnedTodos

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(null, newTitle)
    setNewTitle('')
  }

  const sectionClassName = [
    'flex-1 rounded-3xl bg-white/60 p-5 shadow-inner ring-1 ring-white/40',
    activeTab === 'pinned' ? 'mt-6' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Задачи</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-800">Дерево задач</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Добавляйте задачи, группируйте их по уровням и перетаскивайте элементы, чтобы быстро управлять приоритетами. Максимальная глубина — три уровня.
          </p>
        </header>

        <div className="mb-6 inline-flex rounded-2xl bg-white/80 p-1 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('pinned')}
            className={[
              'rounded-xl px-4 py-2 transition',
              activeTab === 'pinned'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:text-slate-800',
            ].join(' ')}
            aria-pressed={activeTab === 'pinned'}
          >
            Закрепленные
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('todos')}
            className={[
              'rounded-xl px-4 py-2 transition',
              activeTab === 'todos'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:text-slate-800',
            ].join(' ')}
            aria-pressed={activeTab === 'todos'}
          >
            Список задач
          </button>
        </div>

        {activeTab === 'todos' && (
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
        )}

        <section className={sectionClassName}>
          {activeTab === 'pinned' ? (
            pinnedTodos.length > 0 ? (
              <div className="space-y-3">
                <PinnedDropZone index={0} />
                {pinnedTodos.map((todo, index) => (
                  <Fragment key={todo.id}>
                    <PinnedItem todo={todo} />
                    <PinnedDropZone index={index + 1} />
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="mt-2 rounded-2xl border border-dashed border-amber-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                Закрепите задачи на вкладке «Список задач», чтобы увидеть их здесь.
              </div>
            )
          ) : (
            <>
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
