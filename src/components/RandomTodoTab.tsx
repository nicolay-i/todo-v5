'use client'

import { observer } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import { useEffect, useState, useRef } from 'react'
import { useTodoStore } from '@/stores/TodoStoreContext'
import { 
  FiEdit2, 
  FiPlus, 
  FiStar, 
  FiTag, 
  FiCheck, 
  FiX,
  FiTrash2
} from 'react-icons/fi'
import type { TodoNode } from '@/lib/types'

interface TodoItemInChainProps {
  todo: TodoNode
  isLeaf: boolean
  indent: number
  onUpdate: () => void
  onAddChild: (parentId: string, childTitle: string) => void
  onDelete: (todoId: string) => void
}

const TodoItemInChain = observer(({ todo, isLeaf, indent, onUpdate, onAddChild, onDelete }: TodoItemInChainProps) => {
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)
  const [aliasDraft, setAliasDraft] = useState(todo.alias ?? '')
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [childTitle, setChildTitle] = useState('')
  const [showTagMenu, setShowTagMenu] = useState(false)
  const tagMenuRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const childInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitleDraft(todo.title)
    setAliasDraft(todo.alias ?? '')
  }, [todo.title, todo.alias])

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [isEditing])

  useEffect(() => {
    if (isAddingChild && childInputRef.current) {
      childInputRef.current.focus()
    }
  }, [isAddingChild])

  // Закрытие меню тегов при клике вне
  useEffect(() => {
    if (!showTagMenu) return
    const handler = (e: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(e.target as Node)) {
        setShowTagMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showTagMenu])

  const handleSaveEdit = async () => {
    const trimmedTitle = titleDraft.trim()
    if (!trimmedTitle) return
    
    const changes: { title?: string; alias?: string | null } = {}
    if (trimmedTitle !== todo.title) {
      changes.title = trimmedTitle
    }
    const newAlias = aliasDraft.trim() || null
    if (newAlias !== todo.alias) {
      changes.alias = newAlias
    }
    
    if (Object.keys(changes).length > 0) {
      await store.updateTodoDetails(todo.id, changes)
      // Не вызываем onUpdate(), так как изменения уже оптимистично применены к randomChain
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setTitleDraft(todo.title)
    setAliasDraft(todo.alias ?? '')
    setIsEditing(false)
  }

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = childTitle.trim()
    if (!trimmed) return
    setChildTitle('')
    setIsAddingChild(false)
    // Вызываем коллбек для добавления и обновления цепочки
    onAddChild(todo.id, trimmed)
  }

  const handleTogglePinned = async () => {
    await store.togglePinned(todo.id)
    // Не перезагружаем цепочку - состояние обновится оптимистично
  }

  const handleToggleTag = async (tagId: string) => {
    const hasTag = (todo.tags ?? []).some((t) => t.id === tagId)
    if (hasTag) {
      await store.detachTag(todo.id, tagId)
    } else {
      await store.attachTag(todo.id, tagId)
    }
    onUpdate()
  }

  const handleDelete = () => {
    onDelete(todo.id)
  }

  const todoTagIds = new Set((todo.tags ?? []).map((t) => t.id))

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isLeaf
          ? 'bg-green-100 border-green-400'
          : todo.pinned
          ? 'bg-amber-50 border-amber-300'
          : 'bg-white border-slate-200'
      }`}
      style={{ marginLeft: `${indent}px` }}
    >
      <div className="p-3">
        {/* Основной контент */}
        {isEditing ? (
          <div className="space-y-2">
            <input
              ref={editInputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleSaveEdit()
                } else if (e.key === 'Escape') {
                  handleCancelEdit()
                }
              }}
              className="w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Название задачи"
            />
            <input
              type="text"
              value={aliasDraft}
              onChange={(e) => setAliasDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void handleSaveEdit()
                } else if (e.key === 'Escape') {
                  handleCancelEdit()
                }
              }}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-slate-500 focus:outline-none"
              placeholder="Алиас (необязательно)"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-xs text-white hover:bg-slate-800"
              >
                <FiCheck size={14} />
                Сохранить
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                <FiX size={14} />
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isLeaf ? 'font-semibold text-green-800' : 'text-slate-800'}`}>
                    {todo.title}
                  </span>
                  {todo.alias && (
                    <span className="text-xs text-slate-500 italic">
                      ({todo.alias})
                    </span>
                  )}
                </div>
                
                {/* Теги */}
                {todo.tags && todo.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {todo.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Кнопки действий */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="Редактировать"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => setIsAddingChild(true)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  title="Добавить потомка"
                >
                  <FiPlus size={14} />
                </button>
                <div className="relative" ref={tagMenuRef}>
                  <button
                    onClick={() => setShowTagMenu(!showTagMenu)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    title="Управление тегами"
                  >
                    <FiTag size={14} />
                  </button>
                  {showTagMenu && (
                    <div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                      <div className="max-h-60 overflow-y-auto p-2">
                        {store.tags.length === 0 ? (
                          <p className="px-2 py-1 text-xs text-slate-500">Нет доступных тегов</p>
                        ) : (
                          store.tags.map((tag) => {
                            const hasTag = todoTagIds.has(tag.id)
                            return (
                              <button
                                key={tag.id}
                                onClick={() => handleToggleTag(tag.id)}
                                className={`w-full rounded px-2 py-1 text-left text-xs transition-colors ${
                                  hasTag
                                    ? 'bg-slate-100 text-slate-900 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {hasTag && '✓ '}
                                {tag.name}
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleTogglePinned}
                  className={`rounded p-1 transition-colors ${
                    todo.pinned
                      ? 'text-amber-500 hover:bg-amber-50'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                  title={todo.pinned ? 'Открепить' : 'Закрепить'}
                >
                  <FiStar size={14} fill={todo.pinned ? 'currentColor' : 'none'} />
                </button>
                {/* Кнопка удаления только для листового элемента */}
                {isLeaf && (
                  <button
                    onClick={handleDelete}
                    className="rounded p-1 text-slate-400 hover:bg-red-100 hover:text-red-600"
                    title="Удалить"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Форма добавления потомка */}
      {isAddingChild && (
        <div className="border-t border-slate-200 bg-slate-50 p-3">
          <form onSubmit={handleAddChild} className="flex gap-2">
            <input
              ref={childInputRef}
              type="text"
              value={childTitle}
              onChange={(e) => setChildTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsAddingChild(false)
                  setChildTitle('')
                }
              }}
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Название новой подзадачи"
            />
            <button
              type="submit"
              className="rounded bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-800"
            >
              <FiCheck size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingChild(false)
                setChildTitle('')
              }}
              className="rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              <FiX size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
})

function RandomTodoTabComponent() {
  const store = useTodoStore()

  useEffect(() => {
    // Загружаем случайную цепочку при монтировании
    store.loadRandomChain()
  }, [])

  const handleLoadAnother = () => {
    store.loadRandomChain()
  }

  const handleUpdate = () => {
    // Перезагружаем цепочку после изменений
    store.loadRandomChain()
  }

  const handleAddChild = async (parentId: string, childTitle: string) => {
    // Используем специальный метод для расширения цепочки
    await store.extendRandomChainWithChild(parentId, childTitle)
  }

  const handleDelete = async (todoId: string) => {
    // Удаляем последний элемент цепочки
    await store.removeLastFromRandomChain(todoId)
  }

  if (store.randomChain.length === 0) {
    return (
      <div className="p-4">
        <p className="text-slate-500 text-center py-8">Нет незавершённых задач</p>
      </div>
    )
  }

  // Последний элемент в цепочке (листовой todo)
  const leafTodo = store.randomChain[store.randomChain.length - 1]

  return (
    <div className="pt-3">
      <div className="space-y-3">
        {store.randomChain.map((todo, index) => {
          const isLeaf = index === store.randomChain.length - 1
          const indent = index * 20

          return (
            <TodoItemInChain
              key={todo.id}
              todo={todo}
              isLeaf={isLeaf}
              indent={indent}
              onUpdate={handleUpdate}
              onAddChild={handleAddChild}
              onDelete={handleDelete}
            />
          )
        })}
      </div>

      {leafTodo && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2 text-sm">
            🎯 Текущая задача
          </h3>
          <p className="text-green-900 font-medium">{leafTodo.title}</p>
          {leafTodo.alias && (
            <p className="text-sm text-green-700 italic mt-1">
              Алиас: {leafTodo.alias}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export const RandomTodoTab = observer(RandomTodoTabComponent)
