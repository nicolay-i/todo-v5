'use client'

import type { ChangeEventHandler, FormEventHandler } from 'react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiPlus } from 'react-icons/fi'
import type { TodoState } from '@/lib/types'
import { TodoStore } from '@/stores/TodoStore'
import { TodoStoreProvider, useTodoStore } from '@/stores/TodoStoreContext'
// мини-плейсхолдеры для сортировки больше не используются
import { PinnedList } from './PinnedList'
import { TodoItem } from './TodoItem'

interface TodoAppProps {
  initialState: TodoState
}

const TodoAppContent = () => {
  const store = useTodoStore()
  const [newTitle, setNewTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'pinned' | 'all' | 'settings'>('pinned')
  const [isAddingPinnedList, setIsAddingPinnedList] = useState(false)
  const [newPinnedListTitle, setNewPinnedListTitle] = useState('')
  const pinnedListInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const trimmed = newTitle.trim()
    if (!trimmed) return
    await store.addTodo(null, trimmed)
    setNewTitle('')
  }

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

  const tabs: { key: 'pinned' | 'all' | 'settings'; label: string }[] = useMemo(
    () => [
      { key: 'pinned', label: 'Слоты' },
      { key: 'all', label: 'Список задач' },
      { key: 'settings', label: 'Настройки' },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex-1 rounded-3xl bg-white/60 p-5 shadow-inner ring-1 ring-white/40">
          <div className="mb-6 flex justify-start">
            <div className="flex rounded-2xl bg-white/70 p-1 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200/70">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    'rounded-xl px-4 py-2 transition focus-visible:outline-none',
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'pinned' ? (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-slate-600">Слоты на день</h2>
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
                          isPinnedListTitleValid
                            ? 'bg-slate-900 hover:bg-slate-800'
                            : 'cursor-not-allowed bg-slate-400'
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
                  <button
                    type="button"
                    onClick={() => setIsAddingPinnedList(true)}
                    className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-400 hover:bg-white"
                  >
                    <FiPlus />
                    Новый слот
                  </button>
                )}
              </div>

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
          ) : activeTab === 'all' ? (
            <>
              <form
                onSubmit={handleSubmit}
                className="mb-8 flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center"
              >
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
                  placeholder="Новая задача"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
                  aria-label="Добавить задачу"
                >
                  <FiPlus />
                  Добавить
                </button>
              </form>
              <ListContainer />

              {store.todos.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                  Начните с новой задачи — вы всегда сможете добавить вложенные подзадачи и перетащить элементы между уровнями.
                </div>
              )}
            </>
          ) : (
            <SettingsTab />
          )}
        </section>
      </div>
    </div>
  )
}

const ObservedContent = observer(TodoAppContent)

export const TodoApp = ({ initialState }: TodoAppProps) => {
  const [store] = useState(() => new TodoStore(initialState))

  return (
    <TodoStoreProvider store={store}>
      <ObservedContent />
    </TodoStoreProvider>
  )
}

// Контейнер списка верхнего уровня: без мини-плейсхолдеров.
const ListContainer = observer(() => {
  const store = useTodoStore()
  const draggedId = store.draggedId
  const canAcceptRoot = draggedId !== null && store.canDrop(draggedId, null)

  const handleEmptyDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAcceptRoot || store.todos.length > 0) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleEmptyDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAcceptRoot || draggedId === null || store.todos.length > 0) return
    event.preventDefault()
    void store.moveTodo(draggedId, null, 0)
    store.clearDragged()
  }

  return (
    <div
      className="space-y-3"
      onDragOver={handleEmptyDragOver}
      onDrop={handleEmptyDrop}
    >
      {store.todos.map((todo, index) => (
        <Fragment key={todo.id}>
          <TodoItem todo={todo} depth={0} parentId={null} index={index} />
        </Fragment>
      ))}
    </div>
  )
})

const SettingsTab = () => {
  const store = useTodoStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [newTag, setNewTag] = useState('')
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingTagName, setEditingTagName] = useState('')

  const handleExport = async () => {
    setStatus(null)
    setIsExporting(true)
    try {
      const response = await fetch('/api/state', { cache: 'no-store' })
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
      {/* Tags management */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700">Теги</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            const trimmed = newTag.trim()
            if (!trimmed) return
            await store.addTag(trimmed)
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
          {store.tags.map((tag) => (
            <li key={tag.id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
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
                      await store.renameTag(tag.id, editingTagName)
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
                    onClick={() => store.deleteTag(tag.id)}
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                    aria-label="Удалить тег"
                  >
                    Удалить
                  </button>
                </>
              )}
            </li>
          ))}
          {store.tags.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-4 text-center text-sm text-slate-500">Тегов пока нет</li>
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
}
