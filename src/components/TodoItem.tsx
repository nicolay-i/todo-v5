import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { observer } from 'mobx-react-lite'
import type { TodoNode } from '../stores/TodoStore'
import { useTodoStore } from '../stores/TodoStoreContext'
import type { PropsWithChildren } from 'react'

interface TodoItemProps extends PropsWithChildren {
  todo: TodoNode
  parentId?: string
}

export const TodoItem = observer(({ todo, parentId, children }: TodoItemProps) => {
  const store = useTodoStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: { parentId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li ref={setNodeRef} style={style} className="space-y-3">
      <div
        className={`flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition ${
          isDragging ? 'ring-2 ring-slate-300' : ''
        }`}
        {...attributes}
      >
        <button
          className="mt-1 cursor-grab text-slate-400 hover:text-slate-600"
          type="button"
          aria-label="Переместить задачу"
          {...listeners}
        >
          ⋮⋮
        </button>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => store.toggleTodo(todo.id)}
          className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
        />
        <div className="flex flex-1 flex-col gap-2">
          <input
            value={todo.title}
            onChange={(event) => store.updateTitle(todo.id, event.target.value)}
            className={`w-full rounded-md border border-transparent bg-transparent text-base font-medium text-slate-900 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 ${
              todo.completed ? 'line-through text-slate-400' : ''
            }`}
          />
          {children}
        </div>
        <button
          type="button"
          onClick={() => store.removeTodo(todo.id)}
          className="mt-1 text-sm font-medium text-rose-500 transition hover:text-rose-600"
        >
          Удалить
        </button>
      </div>
    </li>
  )
})
