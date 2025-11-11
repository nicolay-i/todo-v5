'use client'

import type { FormEventHandler } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiPlus } from 'react-icons/fi'
import { useTodoStore } from '@/stores/TodoStoreContext'
import type { VisibilityMode } from '@/stores/TodoStore'
import { PinnedList } from '@/components/PinnedList'
import { PinnedTextView } from '@/components/PinnedTextView'

const filterOptions: { value: VisibilityMode; label: string }[] = [
  { value: 'activeOnly', label: 'Только активные' },
  { value: 'today', label: 'Активные сегодня' },
  { value: 'oneDay', label: 'За день' },
  { value: 'twoDays', label: 'За два дня' },
  { value: 'week', label: 'За неделю' },
]

function FilterSelect({ value, onChange }: { value: VisibilityMode; onChange: (v: VisibilityMode) => void }) {
  return (
    <select
      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value as VisibilityMode)}
    >
      {filterOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export const PinnedTab = observer(() => {
  const store = useTodoStore()
  const [isAddingPinnedList, setIsAddingPinnedList] = useState(false)
  const [isTextViewOpen, setIsTextViewOpen] = useState(false)
  const [newPinnedListTitle, setNewPinnedListTitle] = useState('')
  const pinnedListInputRef = useRef<HTMLInputElement>(null)

  const handlePinnedListSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const trimmed = newPinnedListTitle.trim()
    if (!trimmed) return
    await store.addPinnedList(trimmed)
    setNewPinnedListTitle('')
    setIsAddingPinnedList(false)
  }

  const cancelPinnedListCreation = () => {
    setNewPinnedListTitle('')
    setIsAddingPinnedList(false)
  }

  const pinnedLists = store.pinnedListsWithTodos
  const totalPinned = useMemo(
    () => pinnedLists.reduce((accumulator, list) => accumulator + list.todos.length, 0),
    [pinnedLists],
  )
  const isPinnedListTitleValid = newPinnedListTitle.trim().length > 0

  useEffect(() => {
    if (isAddingPinnedList && pinnedListInputRef.current) {
      pinnedListInputRef.current.focus()
    }
  }, [isAddingPinnedList])

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-600">Слоты на день</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <FilterSelect value={store.pinnedFilterMode} onChange={(v) => store.setPinnedFilterMode(v)} />
          </div>
        </div>
        {isAddingPinnedList ? (
          <form
            onSubmit={handlePinnedListSubmit}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:flex-row sm:items-center"
          >
            <input
              ref={pinnedListInputRef}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              placeholder="Название нового слота"
              value={newPinnedListTitle}
              onChange={(event) => setNewPinnedListTitle(event.target.value)}
            />
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="submit"
                disabled={!isPinnedListTitleValid}
                className={`rounded-lg px-3 py-2 text-sm font-medium text-white transition ${
                  isPinnedListTitleValid ? 'bg-slate-900 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-400'
                }`}
              >
                Создать
              </button>
              <button
                type="button"
                onClick={cancelPinnedListCreation}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
              >
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTextViewOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-white"
            >
              {isTextViewOpen ? 'Скрыть' : 'Текстом'}
            </button>

            <button
              type="button"
              onClick={() => setIsAddingPinnedList(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-white"
            >
              <FiPlus />
              Новый слот
            </button>
          </div>
        )}
      </div>

      {isTextViewOpen && (
        <div className="mb-6">
          <PinnedTextView lists={pinnedLists} />
        </div>
      )}

      <div className="space-y-4">
        {pinnedLists.map((list) => (
          <PinnedList key={list.id} list={list} />
        ))}
      </div>

      {totalPinned === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500">
          Слот для задач сейчас пустой
        </div>
      )}
    </>
  )
})

PinnedTab.displayName = 'PinnedTab'

export default PinnedTab
