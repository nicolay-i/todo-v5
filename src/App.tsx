import { Fragment, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiPlus } from 'react-icons/fi'
import { TodoItem } from './components/TodoItem'
import { DropZone } from './components/DropZone'
import { PinnedDropZone } from './components/PinnedDropZone'
import { useTodoStore } from './stores/TodoStoreContext'

type TabKey = 'pinned' | 'todos'

const AppComponent = () => {
  const store = useTodoStore()
  const [activeTab, setActiveTab] = useState<TabKey>('pinned')
  const [newTitle, setNewTitle] = useState('')
  const pinnedTodos = store.pinnedTodos

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(null, newTitle)
    setNewTitle('')
  }

  const tabs: Array<{ id: TabKey; label: string }> = [
    { id: 'pinned', label: 'Закрепленные' },
    { id: 'todos', label: 'Список задач' },
  ]

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Задачи</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-800">Дерево задач</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-500">
            Добавляйте задачи, группируйте их по уровням и перетаскивайте элементы, чтобы быстро управлять приоритетами.
            Максимальная глубина — три уровня. Закрепляйте важные задачи, чтобы они появлялись на главной вкладке.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition',
                  isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-white/70 text-slate-600 hover:bg-white/90',
                ].join(' ')}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            )
          })}
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

        <section className="flex-1 rounded-3xl bg-white/60 p-5 shadow-inner ring-1 ring-white/40">
          {activeTab === 'pinned' ? (
            pinnedTodos.length > 0 ? (
              <div className="space-y-3">
                <PinnedDropZone index={0} />
                {pinnedTodos.map((todo, index) => (
                  <Fragment key={todo.id}>
                    <TodoItem todo={todo} depth={0} allowChildren={false} />
                    <PinnedDropZone index={index + 1} />
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                Закрепите задачи на вкладке «Список задач», чтобы быстро переходить к ним с главного экрана.
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
