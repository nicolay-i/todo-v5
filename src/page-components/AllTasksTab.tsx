'use client'

import { observer } from 'mobx-react-lite'
import { useTodoStore } from '@/stores/TodoStoreContext'
import { TodoSearchBar } from '@/components/TodoSearchBar'
import { TodoTreeView } from '@/components/TodoTreeView'
import type { VisibilityMode } from '@/stores/TodoStore'

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

export const AllTasksTab = observer(() => {
  const store = useTodoStore()

  return (
    <>
      <TodoSearchBar />
      <div className="mb-3 flex items-center justify-between gap-3 pl-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={store.highlightFirstAtMaxDepth}
            onChange={() => store.toggleHighlightFirstAtMaxDepth()}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
          />
          <span>Выделение первого todo</span>
        </label>
        <FilterSelect value={store.listFilterMode} onChange={(v) => store.setListFilterMode(v)} />
      </div>
      <TodoTreeView
        showEmptyPlaceholder={store.todos.length === 0}
        emptyPlaceholderText="Начните с новой задачи — вы всегда сможете добавить вложенные подзадачи и перетащить элементы между уровнями."
        enableDragDrop={true}
      />
    </>
  )
})

AllTasksTab.displayName = 'AllTasksTab'

export default AllTasksTab