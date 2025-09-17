import { type CSSProperties, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AddTodoForm } from './AddTodoForm'
import { TodoList } from './TodoList'
import { MAX_DEPTH, todoStore } from '../stores/TodoStore'
import type { TodoItem as TodoModel } from '../stores/TodoStore'

type TodoItemProps = {
  todo: TodoModel
  parentId: string | null
  depth: number
}

export const TodoItem = observer(({ todo, parentId, depth }: TodoItemProps) => {
  const [showChildForm, setShowChildForm] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
    data: { type: 'todo', parentId, depth },
  })

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : undefined,
  }

  const canAddChild = depth < MAX_DEPTH

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-slate-700 bg-slate-900/60 p-4 shadow-sm transition ${
        isDragging ? 'ring-2 ring-sky-500 shadow-lg' : 'hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 rounded-md border border-slate-700 bg-slate-900 p-2 text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          aria-label="Переместить задачу"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M7 4h10M3 10h14M7 16h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex-1 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <label className="flex flex-1 items-start gap-3 text-sm sm:text-base">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => todoStore.toggleTodo(todo.id)}
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-400"
              />
              <span
                className={`pt-0.5 ${
                  todo.completed ? 'text-slate-400 line-through decoration-slate-500' : 'text-slate-100'
                }`}
              >
                {todo.title}
              </span>
            </label>
            <div className="flex gap-2">
              {canAddChild && (
                <button
                  type="button"
                  onClick={() => setShowChildForm((value) => !value)}
                  className="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
                >
                  {showChildForm ? 'Скрыть' : 'Подзадача'}
                </button>
              )}
              <button
                type="button"
                onClick={() => todoStore.removeTodo(todo.id)}
                className="rounded-md border border-red-500/60 px-3 py-2 text-sm font-medium text-red-300 transition hover:border-red-400 hover:text-red-200"
              >
                Удалить
              </button>
            </div>
          </div>

          {showChildForm && canAddChild && (
            <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
              <AddTodoForm
                onSubmit={(title) => todoStore.addTodo(todo.id, title)}
                onCancel={() => setShowChildForm(false)}
                placeholder="Подзадача"
                submitLabel="Добавить"
                autoFocus
              />
            </div>
          )}

          {todo.children.length > 0 && (
            <div className="border-l border-slate-800 pl-5">
              <TodoList todos={todo.children} parentId={todo.id} depth={depth + 1} />
            </div>
          )}
        </div>
      </div>
    </li>
  )
})
