import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { observer } from 'mobx-react-lite'
import { useState, type CSSProperties } from 'react'
import { AddTodoForm } from './AddTodoForm'
import { MAX_DEPTH, type TodoItem, useTodoStore } from '../stores'

interface TodoListProps {
  items: TodoItem[]
  depth: number
  parentPath: string[]
}

function TodoListBase({ items, depth, parentPath }: TodoListProps) {
  if (items.length === 0) {
    return null
  }

  const containerStyles = depth > 1 ? 'ml-4 border-l border-slate-200 pl-4' : ''

  return (
    <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
      <ul className={`space-y-3 ${containerStyles}`}>
        {items.map((item) => (
          <TodoItemCard key={item.id} item={item} depth={depth} parentPath={parentPath} />
        ))}
      </ul>
    </SortableContext>
  )
}

interface TodoItemCardProps {
  item: TodoItem
  depth: number
  parentPath: string[]
}

function TodoItemCardBase({ item, depth, parentPath }: TodoItemCardProps) {
  const store = useTodoStore()
  const [isAddingChild, setIsAddingChild] = useState(false)
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const canAddChild = depth < MAX_DEPTH
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  }

  const completionClass = item.completed ? 'line-through text-slate-400' : 'text-slate-700'

  const handleAddChild = (title: string) => {
    store.addTodo([...parentPath, item.id], title)
    setIsAddingChild(false)
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow ${
        isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Переместить"
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          className="mt-1 inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h.01M12 7h.01M16 7h.01M8 12h.01M12 12h.01M16 12h.01M8 17h.01M12 17h.01M16 17h.01" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 items-start gap-2">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => store.toggleCompleted(item.id)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className={`break-words text-base font-medium ${completionClass}`}>{item.title}</span>
            </label>
            <div className="flex items-center gap-2">
              {canAddChild && (
                <button
                  type="button"
                  onClick={() => setIsAddingChild((value) => !value)}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className="text-lg leading-none">+</span>
                  Подзадача
                </button>
              )}
              <button
                type="button"
                onClick={() => store.removeTodo(item.id)}
                className="inline-flex items-center justify-center rounded-md border border-transparent px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                Удалить
              </button>
            </div>
          </div>
          {item.children.length > 0 && (
            <div className="mt-3">
              <TodoList items={item.children} depth={depth + 1} parentPath={[...parentPath, item.id]} />
            </div>
          )}
          {canAddChild && isAddingChild && (
            <div className="mt-3">
              <AddTodoForm
                onSubmit={handleAddChild}
                onCancel={() => setIsAddingChild(false)}
                autoFocus
                placeholder="Новая подзадача"
              />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

const TodoItemCard = observer(TodoItemCardBase)

export const TodoList = observer(TodoListBase)
