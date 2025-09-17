import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import TodoList from './components/TodoList'
import { TodoStore, TodoStoreContext } from './stores/TodoStore'

function App() {
  const store = useMemo(() => new TodoStore(), [])
  const [newTitle, setNewTitle] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isAdded = store.addTodo(newTitle)
    if (isAdded) {
      setNewTitle('')
    }
  }

  return (
    <TodoStoreContext.Provider value={store}>
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pb-12 pt-10 sm:px-8">
          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-500">
              Список дел
            </p>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Управляйте задачами с тремя уровнями вложенности
            </h1>
            <p className="max-w-2xl text-base text-slate-500">
              Добавляйте задачи, дробите их на подзадачи и сортируйте списки простым
              перетаскиванием. Каждая задача может иметь до трёх уровней вложенности.
            </p>
          </header>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <label htmlFor="new-todo" className="sr-only">
                Новая задача
              </label>
              <input
                id="new-todo"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Например, подготовить отчёт"
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-700 shadow-inner focus:border-primary-300"
              />
              <button
                type="submit"
                disabled={newTitle.trim().length === 0}
                className="rounded-2xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Добавить задачу
              </button>
            </form>

            {store.todos.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-slate-500">
                Создайте первую задачу, чтобы начать планирование.
              </div>
            ) : (
              <div className="mt-8">
                <TodoList items={store.todos} parentId={null} />
              </div>
            )}
          </section>
        </div>
      </div>
    </TodoStoreContext.Provider>
  )
}

export default App
