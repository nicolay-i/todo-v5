'use client'

import { Fragment, useMemo, useRef, useState, type ChangeEventHandler } from 'react'
import { observer } from 'mobx-react-lite'
import { FiPlus } from 'react-icons/fi'
import type { TodoState } from '@/lib/types'
import { TodoStore } from '@/stores/TodoStore'
import { TodoStoreProvider, useTodoStore } from '@/stores/TodoStoreContext'
import { DropZone } from './DropZone'
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
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [settingsAlert, setSettingsAlert] = useState<
    | {
        type: 'success' | 'error'
        text: string
      }
    | null
  >(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const trimmed = newTitle.trim()
    if (!trimmed) return
    await store.addTodo(null, trimmed)
    setNewTitle('')
  }

  const handlePinnedListSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
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

  const handleExport = async () => {
    try {
      setSettingsAlert(null)
      setIsExporting(true)
      const response = await fetch('/api/settings/export')
      if (!response.ok) {
        throw new Error('Не удалось экспортировать данные')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `todo-export-${timestamp}.json`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
      setSettingsAlert({ type: 'success', text: 'Данные успешно экспортированы в JSON-файл' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка при экспорте данных'
      setSettingsAlert({ type: 'error', text: message })
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setSettingsAlert(null)
    setIsImporting(true)
    try {
      const text = await file.text()
      const payload = JSON.parse(text) as unknown
      const response = await fetch('/api/settings/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = 'Не удалось импортировать данные'
        try {
          const data = (await response.json()) as { error?: string }
          if (data?.error) {
            message = data.error
          }
        } catch (jsonError) {
          console.error('Failed to parse import error payload', jsonError)
        }
        throw new Error(message)
      }

      await store.refresh()
      setSettingsAlert({ type: 'success', text: `Импорт из файла «${file.name}» выполнен успешно` })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка при импорте данных'
      setSettingsAlert({ type: 'error', text: message })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-canvas-light text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="flex-1 rounded-3xl bg-white/60 p-5 shadow-inner ring-1 ring-white/40">
          <div className="mb-6 flex justify-start">
            <div className="flex rounded-2xl bg-white/70 p-1 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveTab('pinned')}
                className={[
                  'rounded-xl px-4 py-2 transition focus-visible:outline-none',
                  activeTab === 'pinned'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                ].join(' ')}
              >
                Закрепленные
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={[
                  'rounded-xl px-4 py-2 transition focus-visible:outline-none',
                  activeTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                ].join(' ')}
              >
                Список задач
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={[
                  'rounded-xl px-4 py-2 transition focus-visible:outline-none',
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
                ].join(' ')}
              >
                Настройки
              </button>
            </div>
          </div>

          {activeTab === 'pinned' ? (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-slate-600">Списки закрепленных задач</h2>
                {isAddingPinnedList ? (
                  <form
                    onSubmit={handlePinnedListSubmit}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:flex-row sm:items-center"
                  >
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
                      placeholder="Название нового списка"
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
                    Новый список
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
                  Закрепите важные задачи на вкладке «Список задач», чтобы быстро возвращаться к ним.
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
              <div className="space-y-3">
                <DropZone parentId={null} depth={0} index={0} />
                {store.todos.map((todo, index) => (
                  <Fragment key={todo.id}>
                    <TodoItem todo={todo} depth={0} />
                    <DropZone parentId={null} depth={0} index={index + 1} />
                  </Fragment>
                ))}
              </div>

              {store.todos.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
                  Начните с новой задачи — вы всегда сможете добавить вложенные подзадачи и перетащить элементы между уровнями.
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-4">
                <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-600">Экспорт данных</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Сохраните текущий список задач и закрепленных элементов в файл JSON.
                  </p>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className={`mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                      isExporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {isExporting ? 'Экспорт...' : 'Скачать JSON'}
                  </button>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-600">Импорт данных</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Загрузите ранее сохраненный JSON-файл, чтобы заменить текущие данные.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/json"
                      className="hidden"
                      onChange={handleImport}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition ${
                        isImporting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {isImporting ? 'Импорт...' : 'Выбрать файл'}
                    </button>
                    <span className="text-sm text-slate-500">
                      Импорт заменит существующие задачи и списки закреплений.
                    </span>
                  </div>
                </section>

                {settingsAlert && (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      settingsAlert.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {settingsAlert.text}
                  </div>
                )}
              </div>
            </>
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
