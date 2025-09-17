import { Fragment, useState } from 'react'
import type { DragEvent, FormEvent } from 'react'
import { observer } from 'mobx-react-lite'
import { MAX_TODO_DEPTH, useTodoStore } from '../stores/TodoStore'
import type { TodoItem } from '../stores/TodoStore'

interface TodoListProps {
  items: TodoItem[]
  parentId: string | null
}

interface DragPayload {
  parentId: string | null
  index: number
}

const DropZone = ({
  index,
  onDrop,
  onDragOver,
  onDragLeave,
  isActive,
}: {
  index: number
  onDrop: (index: number, event: DragEvent<HTMLDivElement>) => void
  onDragOver: (index: number, event: DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  isActive: boolean
}) => (
  <div
    className={`h-3 -my-1 rounded-full border border-dashed border-transparent transition-colors duration-150 ${isActive ? 'border-primary-300 bg-primary-100' : 'bg-transparent'}`}
    onDragOver={(event) => {
      event.preventDefault()
      onDragOver(index, event)
    }}
    onDragLeave={() => {
      onDragLeave()
    }}
    onDrop={(event) => {
      event.preventDefault()
      onDrop(index, event)
    }}
  />
)

const TodoItemCard = observer(({ item }: { item: TodoItem }) => {
  const store = useTodoStore()
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [childTitle, setChildTitle] = useState('')

  const canAddChild = item.depth < MAX_TODO_DEPTH

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const success = store.addTodo(childTitle, item.id)
    if (success) {
      setChildTitle('')
      setIsAddingChild(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-colors duration-150">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <label className="flex flex-1 cursor-pointer items-start gap-3 text-left">
          <input
            aria-label={`Отметить задачу "${item.title}" как выполненную`}
            checked={item.completed}
            className="mt-1 size-5 rounded border-slate-300 text-primary-500 transition-colors focus:ring-2 focus:ring-primary-400"
            onChange={() => store.toggleTodo(item.id)}
            type="checkbox"
          />
          <span
            className={`text-base font-medium leading-relaxed ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}
          >
            {item.title}
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {canAddChild && (
            <button
              type="button"
              onClick={() => setIsAddingChild((prev) => !prev)}
              className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-100"
            >
              {isAddingChild ? 'Отменить' : 'Добавить подзадачу'}
            </button>
          )}
          <button
            type="button"
            onClick={() => store.removeTodo(item.id)}
            className="rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
      {isAddingChild && canAddChild && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <input
            autoFocus
            value={childTitle}
            onChange={(event) => setChildTitle(event.target.value)}
            placeholder="Введите название подзадачи"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-primary-300"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-primary-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => {
                setChildTitle('')
                setIsAddingChild(false)
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-100"
            >
              Отмена
            </button>
          </div>
        </form>
      )}
      {item.children.length > 0 && (
        <div className="mt-4 border-l-2 border-dashed border-slate-200 pl-4 sm:pl-6">
          <TodoList items={item.children} parentId={item.id} />
        </div>
      )}
    </div>
  )
})

const TodoListBase = ({ items, parentId }: TodoListProps) => {
  const store = useTodoStore()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [activeDropIndex, setActiveDropIndex] = useState<number | null>(null)

  const parsePayload = (data: string): DragPayload | null => {
    try {
      const raw = JSON.parse(data) as DragPayload
      if (typeof raw.index !== 'number' || Number.isNaN(raw.index)) {
        return null
      }
      return {
        index: Math.max(0, Math.trunc(raw.index)),
        parentId: raw.parentId ?? null,
      }
    } catch {
      return null
    }
  }

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    item: TodoItem,
    index: number,
  ) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({ parentId, index }),
    )
    setDraggingId(item.id)
  }

const handleDrop = (dropIndex: number, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const payload = parsePayload(event.dataTransfer.getData('application/json'))
    setActiveDropIndex(null)
    setDraggingId(null)

    if (!payload || payload.parentId !== parentId) {
      return
    }

    const targetIndex = dropIndex > payload.index ? dropIndex - 1 : dropIndex
    if (targetIndex === payload.index) {
      return
    }

    store.reorder(parentId, payload.index, dropIndex)
  }

  const handleDragOverZone = (index: number, event: DragEvent<HTMLDivElement>) => {
    const payload = parsePayload(event.dataTransfer.getData('application/json'))
    if (!payload || payload.parentId !== parentId) {
      setActiveDropIndex(null)
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setActiveDropIndex(index)
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <DropZone
            index={index}
            isActive={activeDropIndex === index}
            onDragLeave={() => setActiveDropIndex(null)}
            onDragOver={handleDragOverZone}
            onDrop={handleDrop}
          />
          <div
            draggable
            onDragStart={(event) => handleDragStart(event, item, index)}
            onDragEnd={() => {
              setDraggingId(null)
              setActiveDropIndex(null)
            }}
            className={`${draggingId === item.id ? 'opacity-60' : 'opacity-100'} cursor-grab active:cursor-grabbing`}
          >
            <TodoItemCard item={item} />
          </div>
        </Fragment>
      ))}
      <DropZone
        index={items.length}
        isActive={activeDropIndex === items.length}
        onDragLeave={() => setActiveDropIndex(null)}
        onDragOver={handleDragOverZone}
        onDrop={handleDrop}
      />
    </div>
  )
}

export const TodoList = observer(TodoListBase)

export default TodoList
