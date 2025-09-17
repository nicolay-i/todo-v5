import { useState } from 'react'
import type { FormEvent } from 'react'
import { observer } from 'mobx-react-lite'
import { useTodoStore } from '../stores/TodoStoreContext'

interface AddTodoControlProps {
  parentId?: string
  level: number
}

export const AddTodoControl = observer(({ parentId, level }: AddTodoControlProps) => {
  const store = useTodoStore()
  const [title, setTitle] = useState('')
  const [expanded, setExpanded] = useState(level === 1)

  const canAdd = store.canAddChild(parentId)
  if (!canAdd) {
    return null
  }

  const label = level === 1 ? 'Добавить задачу' : 'Добавить подзадачу'
  const placeholder = level === 1 ? 'Новая задача' : 'Новая подзадача'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return

    store.addTodo(title, parentId)
    setTitle('')
    if (level > 1) {
      setExpanded(false)
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        + {label}
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {label}
        </button>
        {level > 1 && (
          <button
            type="button"
            onClick={() => {
              setExpanded(false)
              setTitle('')
            }}
            className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  )
})
