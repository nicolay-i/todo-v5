import { DndContext, PointerSensor, type DragEndEvent, useSensor, useSensors } from '@dnd-kit/core'
import { observer } from 'mobx-react-lite'
import { AddTodoForm } from './components/AddTodoForm'
import { TodoList } from './components/TodoTree'
import { TodoStoreProvider, useTodoStore } from './stores'

const TodoAppView = observer(() => {
  const store = useTodoStore()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const activePath = store.findPath(activeId)
    const overPath = store.findPath(overId)
    if (!activePath || !overPath) return

    const activeParentPath = activePath.slice(0, -1)
    const overParentPath = overPath.slice(0, -1)
    if (activeParentPath.length !== overParentPath.length) return
    const sameParent = activeParentPath.every((value, index) => value === overParentPath[index])
    if (!sameParent) return

    store.reorder(activeParentPath, activeId, overId)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Список задач</h1>
        <p className="text-sm text-slate-500 sm:text-base">
          Создавайте вложенные задачи (до трёх уровней) и сортируйте их простым перетаскиванием.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Новая задача верхнего уровня</h2>
        <p className="mt-1 text-sm text-slate-500">
          Эта форма создаёт задачи первого уровня. Подзадачи можно добавлять внутри каждой карточки.
        </p>
        <div className="mt-4">
          <AddTodoForm
            onSubmit={(title) => store.addTodo([], title)}
            placeholder="Например, подготовить презентацию"
            submitLabel="Добавить задачу"
          />
        </div>
      </section>

      <section>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {store.todos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
              Список пуст. Добавьте задачу, чтобы начать планирование.
            </div>
          ) : (
            <TodoList items={store.todos} depth={1} parentPath={[]} />
          )}
        </DndContext>
      </section>
    </div>
  )
})

const App = () => (
  <TodoStoreProvider>
    <TodoAppView />
  </TodoStoreProvider>
)

export default App
