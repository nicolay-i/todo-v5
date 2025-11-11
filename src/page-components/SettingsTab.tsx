'use client'

import type { ChangeEventHandler } from 'react'
import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import Image from 'next/image'
import type { SessionUser } from '@/lib/auth/session'
import type { TodoState } from '@/lib/types'
import { useTodoStore } from '@/stores/TodoStoreContext'
import { useTagStore } from '@/stores/TagStoreContext'

interface SettingsTabProps {
  user: SessionUser
  onLogout: () => Promise<void> | void
}

export const SettingsTab = observer(({ user, onLogout }: SettingsTabProps) => {
  const store = useTodoStore()
  const tagStore = useTagStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [newTag, setNewTag] = useState('')
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingTagName, setEditingTagName] = useState('')
  const [draggedTagId, setDraggedTagId] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const profileName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    (user.username ? `@${user.username}` : 'Пользователь Telegram')
  const showUsername = user.username && profileName !== `@${user.username}`

  const handleExport = async () => {
    setStatus(null)
    setIsExporting(true)
    try {
      const response = await fetch('/api/state', { cache: 'no-store' })
      if (response.status === 401) {
        window.location.href = '/'
        return
      }
      if (!response.ok) {
        throw new Error('Failed to export state')
      }
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      link.download = `todo-data-${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setStatus({ type: 'success', message: 'Данные успешно экспортированы.' })
    } catch (error) {
      console.error('Failed to export state', error)
      setStatus({ type: 'error', message: 'Не удалось экспортировать данные.' })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setStatus(null)
    setIsImporting(true)

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const response = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })

      if (response.status === 401) {
        window.location.href = '/'
        return
      }

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const state = (await response.json()) as TodoState
      store.setState(state)
      setStatus({ type: 'success', message: 'Данные успешно импортированы.' })
    } catch (error) {
      console.error('Failed to import state', error)
      setStatus({ type: 'error', message: 'Не удалось импортировать данные. Проверьте файл и попробуйте снова.' })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700">Профиль</h3>
        <div className="mt-3 flex items-center gap-3">
          {user.photoUrl ? (
            <Image
              src={user.photoUrl}
              alt={profileName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover shadow-inner"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
              {profileName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <div className="text-sm font-medium text-slate-700">{profileName}</div>
            {showUsername && <div className="text-xs text-slate-500">@{user.username}</div>}
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            setIsLoggingOut(true)
            try {
              await onLogout()
            } finally {
              setIsLoggingOut(false)
            }
          }}
          disabled={isLoggingOut}
          className={`mt-4 inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
            isLoggingOut ? 'cursor-wait bg-slate-400' : 'bg-rose-500 hover:bg-rose-600'
          }`}
        >
          {isLoggingOut ? 'Выходим...' : 'Выйти из аккаунта'}
        </button>
      </div>

      {/* Tags management */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700">Теги</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const trimmed = newTag.trim()
            if (!trimmed) return
            await tagStore.addTag(trimmed)
            setNewTag('')
          }}
          className="mt-3 flex gap-2"
        >
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
            placeholder="Новый тег"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Добавить
          </button>
        </form>

        <ul className="mt-4 space-y-2">
          {tagStore.tags.map((tag) => (
            <li
              key={tag.id}
              className={`flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 ${
                draggedTagId === tag.id ? 'opacity-50' : ''
              }`}
              draggable
              onDragStart={(e) => {
                setDraggedTagId(tag.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragEnd={() => setDraggedTagId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (draggedTagId && draggedTagId !== tag.id) {
                  const draggedIndex = tagStore.tags.findIndex((t) => t.id === draggedTagId)
                  const targetIndex = tagStore.tags.findIndex((t) => t.id === tag.id)
                  const newOrder = [...tagStore.tags]
                  const [removed] = newOrder.splice(draggedIndex, 1)
                  newOrder.splice(targetIndex, 0, removed)
                  const tagIds = newOrder.map((t) => t.id)
                  void tagStore.reorderTags(tagIds)
                }
                setDraggedTagId(null)
              }}
            >
              {editingTagId === tag.id ? (
                <>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
                    value={editingTagName}
                    onChange={(e) => setEditingTagName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await tagStore.renameTag(tag.id, editingTagName)
                      setEditingTagId(null)
                      setEditingTagName('')
                    }}
                    className="rounded-lg bg-emerald-500 p-2 text-white hover:bg-emerald-500/90"
                    aria-label="Сохранить тег"
                  >
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTagId(null)
                      setEditingTagName('')
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Отменить редактирование"
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-slate-700">{tag.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTagId(tag.id)
                      setEditingTagName(tag.name)
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Редактировать тег"
                  >
                    Редактировать
                  </button>
                  <button
                    type="button"
                    onClick={() => tagStore.deleteTag(tag.id)}
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                    aria-label="Удалить тег"
                  >
                    Удалить
                  </button>
                </>
              )}
            </li>
          ))}
          {tagStore.tags.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-center text-sm text-slate-500">
              Тегов пока нет
            </li>
          )}
        </ul>
      </div>

      {status && (
        <div
          className={[
            'rounded-2xl border px-4 py-3 text-sm shadow-inner',
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700',
          ].join(' ')}
        >
          {status.message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700">Экспорт данных</h3>
        <p className="mt-2 text-sm text-slate-500">
          Скачайте текущий список задач и закрепленных списков в формате JSON.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={`mt-4 inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
            isExporting ? 'cursor-not-allowed bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {isExporting ? 'Подготовка...' : 'Скачать JSON'}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700">Импорт данных</h3>
        <p className="mt-2 text-sm text-slate-500">
          Выберите файл JSON, созданный в этом приложении, чтобы заменить текущие данные.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className={`mt-4 inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
            isImporting ? 'cursor-not-allowed bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          {isImporting ? 'Импорт...' : 'Выбрать файл'}
        </button>
        <p className="mt-3 text-xs text-slate-400">
          Импорт заменит существующие задачи и списки. Перед продолжением сохраните резервную копию.
        </p>
      </div>
    </div>
  )
})

SettingsTab.displayName = 'SettingsTab'

export default SettingsTab
