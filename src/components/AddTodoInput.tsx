import { useState } from 'react'
import type { FormEvent } from 'react'
import { FiPlus } from 'react-icons/fi'

interface AddTodoInputProps {
  placeholder?: string
  onAdd: (title: string) => void
}

export const AddTodoInput = ({ placeholder, onAdd }: AddTodoInputProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur transition focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100"
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Добавить задачу"
        className="rounded-full bg-sky-500 p-2 text-white shadow-sm transition hover:bg-sky-600 focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
      >
        <FiPlus className="h-5 w-5" />
      </button>
    </form>
  )
}
