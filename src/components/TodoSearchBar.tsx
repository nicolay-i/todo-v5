'use client'

import { observer } from 'mobx-react-lite'
import { FiCheck, FiFilter, FiSearch, FiX } from 'react-icons/fi'
import { useMemo } from 'react'
import { useDropdown } from '@/lib/hooks/useDropdown'
import { useTodoStore } from '@/stores/TodoStoreContext'

const dropdownGroupKey = 'tag-filter'

export const TodoSearchBar = observer(() => {
  const store = useTodoStore()
  const dropdown = useDropdown({
    hoverOpenDelay: 0,
    closeDelay: 150,
    animationDuration: 150,
    groupKey: dropdownGroupKey,
  })
  const tagPickerRef = dropdown.rootRef
  const tags = store.tags
  const selectedTagIds = store.searchTagIds
  const hasQuery = store.searchQuery.trim().length > 0

  const selectedTags = store.selectedSearchTags
  const triggerLabel = useMemo(() => {
    if (selectedTagIds.length === 0) return 'Теги'
    if (selectedTagIds.length === 1) return '1 тег'
    if (selectedTagIds.length < 5) return `${selectedTagIds.length} тега`
    return `${selectedTagIds.length} тегов`
  }, [selectedTagIds.length])

  return (
    <div className="mb-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={store.searchQuery}
            onChange={(event) => store.setSearchQuery(event.target.value)}
            placeholder="Поиск задач"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-10 text-sm text-slate-700 shadow-inner transition focus:border-slate-400 focus:outline-none"
          />
          {(hasQuery) && (
            <button
              type="button"
              onClick={() => store.clearSearchQuery()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none"
              aria-label="Очистить поиск"
            >
              <FiX />
            </button>
          )}
        </div>
        {tags.length > 0 && (
          <div ref={tagPickerRef} className="relative self-start sm:self-auto">
            <button
              type="button"
              {...dropdown.getTriggerProps()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-inner transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none"
              aria-label="Фильтр по тегам"
            >
              <FiFilter />
              <span>{triggerLabel}</span>
              {selectedTagIds.length > 0 && (
                <span className="flex h-5 min-w-[1.5rem] items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-semibold text-white">
                  {selectedTagIds.length}
                </span>
              )}
            </button>
            {dropdown.isMounted && (
              <div
                className={dropdown.getMenuClassName('absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-slate-200 bg-white p-2 shadow-lg')}
                {...dropdown.getMenuProps()}
              >
                <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Фильтр по тегам
                </div>
                <ul className="max-h-60 overflow-y-auto text-sm">
                  {tags.map((tag) => {
                    const selected = selectedTagIds.includes(tag.id)
                    return (
                      <li key={tag.id}>
                        <button
                          type="button"
                          onClick={() => store.toggleSearchTag(tag.id)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-slate-100"
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-sm border ${selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}
                          >
                            <FiCheck className="h-3 w-3" />
                          </span>
                          <span className={`flex-1 ${selected ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                            {tag.name}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {selectedTagIds.length > 0 && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => store.clearSearchTags()}
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-700 focus-visible:outline-none"
                    >
                      Сбросить
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {selectedTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => store.toggleSearchTag(tag.id)}
                className="rounded p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none"
                aria-label={`Убрать тег ${tag.name} из фильтра`}
              >
                <FiX />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
})
