import { type FormEvent, useState } from 'react'

type AddTodoFormProps = {
  onSubmit: (title: string) => void
  placeholder?: string
  autoFocus?: boolean
  submitLabel?: string
  onCancel?: () => void
  className?: string
}

export function AddTodoForm({
  onSubmit,
  placeholder = 'Новая задача',
  autoFocus,
  submitLabel = 'Добавить',
  onCancel,
  className,
}: AddTodoFormProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          autoFocus={autoFocus}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            {submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={() => {
                setValue('')
                onCancel()
              }}
              className="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              Отмена
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
