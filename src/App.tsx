import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { observer } from 'mobx-react-lite'
import { AddTodoControl } from './components/AddTodoControl'
import { TodoList } from './components/TodoList'
import { useTodoStore } from './stores/TodoStoreContext'

const App = observer(() => {
  const store = useTodoStore()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeParentId = active.data.current?.parentId as string | undefined
    const overParentId = over.data.current?.parentId as string | undefined

    if (activeParentId !== overParentId) return

    store.reorder(activeParentId, String(active.id), String(over.id))
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Список задач</h1>
          <p className="mt-2 text-slate-600">
            Создавайте вложенные задачи до трёх уровней и меняйте порядок простым перетаскиванием.
          </p>
        </header>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Новая задача</h2>
            <p className="mt-1 text-sm text-slate-500">Введите название и нажмите «Добавить задачу».</p>
            <div className="mt-4">
              <AddTodoControl level={1} />
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {store.todos.length === 0 ? (
                <p className="text-sm text-slate-500">Пока нет задач. Добавьте первую, чтобы начать работу.</p>
              ) : (
                <TodoList items={store.todos} level={1} />
              )}
            </div>
          </DndContext>
        </div>
      </div>
    </div>
  )
})

export default App
