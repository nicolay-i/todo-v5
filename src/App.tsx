import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { AddTodoForm } from './components/AddTodoForm'
import { TodoList } from './components/TodoList'
import { todoStore } from './stores/TodoStore'

const App = observer(() => {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type !== 'todo') return
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (activeData?.type !== 'todo' || overData?.type !== 'todo') {
      return
    }

    const activeParentId = activeData.parentId ?? null
    const overParentId = overData.parentId ?? null

    if (activeParentId !== overParentId) {
      return
    }

    todoStore.reorder(activeParentId, active.id as string, over.id as string)
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <div className="mx-auto w-full max-w-4xl px-4 pt-12">
        <header className="mb-10 space-y-4 text-center">
          <h1 className="text-3xl font-bold text-slate-100">Иерархический To-Do</h1>
          <p className="text-sm text-slate-400 sm:text-base">
            Создавайте задачи и подзадачи до трёх уровней, сортируйте их простым перетаскиванием.
          </p>
        </header>

        <section className="mb-12 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">Добавить задачу</h2>
          <AddTodoForm onSubmit={(title) => todoStore.addTodo(null, title)} />
        </section>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          {todoStore.todos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center text-slate-400">
              Добавьте первую задачу, чтобы начать.
            </div>
          ) : (
            <TodoList todos={todoStore.todos} parentId={null} depth={1} />
          )}

          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-slate-100 shadow-xl">
                {todoStore.getById(activeId)?.title}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
})

export default App
