import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { AddTodoInput } from './components/AddTodoInput'
import { TodoTree } from './components/TodoTree'
import { todoStore } from './stores/TodoStore'

const App = observer(() => {
  const [draggedId, setDraggedId] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-800">Задачи</h1>
          <p className="text-sm text-slate-500">
            Перетаскивайте карточки, чтобы менять порядок или уровень вложенности. Вложенность ограничена
            тремя уровнями.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
          <div className="space-y-6">
            <AddTodoInput placeholder="Добавить задачу" onAdd={(title) => todoStore.addTodo(null, title)} />

            {todoStore.todos.length > 0 ? (
              <TodoTree
                todos={todoStore.todos}
                parentId={null}
                depth={1}
                store={todoStore}
                draggedId={draggedId}
                setDraggedId={setDraggedId}
              />
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 py-16 text-sm text-slate-400">
                Добавьте первую задачу, чтобы начать.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
})

export default App
