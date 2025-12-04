'use client'

import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTagStore } from '@/stores/TagStoreContext'

interface AddTodoModalProps {
  isOpen: boolean
  isMounted: boolean
  newTitle: string
  selectedTagIds: string[]
  onTitleChange: (title: string) => void
  onTagsChange: (tagIds: string[]) => void
  onAdd: () => void
  onClose: () => void
}

export const AddTodoModal = observer(
  ({ isOpen, isMounted, newTitle, selectedTagIds, onTitleChange, onTagsChange, onAdd, onClose }: AddTodoModalProps) => {
    const tagStore = useTagStore()

    useEffect(() => {
      if (!isOpen) return
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
          onAdd()
        }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onAdd, onClose])

    if (!isMounted) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className={`absolute inset-0 transition-opacity duration-200 ease-out ${
            isOpen ? 'opacity-100' : 'opacity-0'
          } bg-black/30`}
          onClick={onClose}
        />
        <div
          className={`relative z-10 w-full max-w-lg transform rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all duration-200 ease-out ${
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'
          }`}
        >
          <h3 className="text-base font-semibold text-slate-700">Новая задача</h3>
          <div className="mt-3">
            <input
              autoFocus
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              placeholder="Введите название задачи"
              value={newTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAdd()
                }
              }}
            />
          </div>
          {/* Tag selector */}
          {tagStore.tags.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">Теги</div>
              <div className="flex flex-wrap gap-2">
                {tagStore.tags
                  .filter((t) => !t.isSystem || (t.name !== 'Временный'))
                  .map((t) => {
                    const selected = selectedTagIds.includes(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          onTagsChange(
                            selected ? selectedTagIds.filter((id) => id !== t.id) : [...selectedTagIds, t.id],
                          )
                        }}
                        className={[
                          'rounded-xl border px-2 py-1 text-xs transition',
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                        ].join(' ')}
                      >
                        {t.name}
                      </button>
                    )
                  })}
              </div>
              {selectedTagIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => onTagsChange([])}
                  className="mt-2 text-xs text-slate-500 underline underline-offset-4 hover:text-slate-700"
                >
                  Сбросить теги
                </button>
              )}
            </div>
          )}
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={onAdd}
              disabled={newTitle.trim().length === 0}
              className={`rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm transition ${
                newTitle.trim().length > 0 ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              Добавить
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Подсказка: Enter — добавить, Esc — закрыть, Ctrl/Cmd+Enter — добавить.
          </p>
        </div>
      </div>
    )
  },
)

AddTodoModal.displayName = 'AddTodoModal'
