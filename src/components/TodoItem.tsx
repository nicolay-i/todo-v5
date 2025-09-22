'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiPlus,
  FiTag,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { MAX_DEPTH } from '@/lib/constants'
import { useDropdown } from '@/lib/hooks/useDropdown'
import type { TodoNode } from '@/lib/types'
import { useTodoStore } from '@/stores/TodoStoreContext'
// мини-плейсхолдеры для сортировки больше не используются

interface TodoItemProps {
  todo: TodoNode
  depth: number
  // для вычисления целевого индекса при сортировке среди сиблингов
  parentId: string | null
  index: number
  // если передан pinnedListId, сортировка идет внутри закрепленного списка
  pinnedListId?: string
  allowChildren?: boolean
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const TodoItemComponent = ({ todo, depth, parentId, index, pinnedListId, allowChildren = true }: TodoItemProps) => {
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)
  const [childTitle, setChildTitle] = useState('')
  const [isOverInside, setIsOverInside] = useState(false)
  const [overPosition, setOverPosition] = useState<null | 'above' | 'below' | 'inside'>(null)
  const childInputRef = useRef<HTMLInputElement>(null)
  // Выпадающий список тегов: управляeм через общий хук
  const tagDropdown = useDropdown({
    openOnHover: false,
    closeDelay: 1000,
    animationDuration: 200,
    groupKey: 'tag-picker',
  })
  // Многострочное редактирование: вычисляем строки один раз при входе в режим
  const [editRows, setEditRows] = useState(1)
  const editWrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)

  // Общая функция измерения требуемого количества строк.
  const recalcRows = () => {
    const wrapEl = editWrapRef.current
    const measureEl = measureRef.current
    if (!wrapEl || !measureEl) return

    const width = wrapEl.clientWidth
    if (width <= 0) return

    measureEl.style.width = `${width}px`
    measureEl.textContent = titleDraft || ''

    const style = window.getComputedStyle(measureEl)
    const lineHeightPx = parseFloat(style.lineHeight || '20')
    const totalHeight = measureEl.scrollHeight
    let rows = lineHeightPx > 0 ? Math.ceil(totalHeight / lineHeightPx) : 1
    if (!Number.isFinite(rows) || rows <= 0) rows = 1
    rows = Math.min(rows, 12)
    setEditRows(rows)
  }

  const canAddChild = allowChildren && depth < MAX_DEPTH
  const isDragging = store.draggedId === todo.id
  const isCollapsed = store.isCollapsed(todo.id)
  const draggedId = store.draggedId
  const canDropInside =
    allowChildren && depth < MAX_DEPTH && draggedId !== null && store.canDrop(draggedId, todo.id)
  const canReorderInTree = draggedId !== null && store.canDrop(draggedId, parentId)
  const isPinnedContext = Boolean(pinnedListId)
  const canReorderInPinned = draggedId !== null && isPinnedContext && store.isPinned(draggedId!)

  useEffect(() => {
    setTitleDraft(todo.title)
  }, [todo.title])

  // При входе в режим редактирования определяем число строк на основе ширины поля и текущего текста
  useEffect(() => {
    if (!isEditing) return
    // сбрасываем на 1 строку, затем вычисляем фактическое количество
    setEditRows(1)
    const raf = requestAnimationFrame(() => {
  recalcRows()
    })
    return () => cancelAnimationFrame(raf)
    // ВАЖНО: зависит только от входа в режим, а не от текста
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  useEffect(() => {
    if (isAddingChild && childInputRef.current) {
      childInputRef.current.focus()
    }
  }, [isAddingChild])

  // Привязываем ref корня выпадушки для клика-вне
  const tagPickerRef = tagDropdown.rootRef

  const handleToggle = () => {
    void store.toggleTodo(todo.id)
  }

  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    await store.updateTitle(todo.id, titleDraft)
    setIsEditing(false)
  }

  const handleAddChild: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    await store.addTodo(todo.id, childTitle)
    setChildTitle('')
    setIsAddingChild(false)
  }

  const handleDelete = () => {
    void store.deleteTodo(todo.id)
  }

  const handleTogglePinned = () => {
    void store.togglePinned(todo.id)
  }

  const availableTags = store.tags
  const todoTagIds = new Set((todo.tags ?? []).map((t) => t.id))

  const handleToggleCollapsed = () => {
    // Разрешаем сворачивать только если потенциально есть дети (или уже есть), иначе кнопка не показывается
    store.toggleCollapse(todo.id)
  }

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    store.setDragged(todo.id)
    event.dataTransfer.setData('text/plain', todo.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
    store.clearDragged()
  }

  // Drop на карточку: верх/низ для сортировки, центр — перенос в потомки
  const handleCardDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    const mayAccept = canDropInside || canReorderInTree || canReorderInPinned
    if (!mayAccept) return
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
    const y = event.clientY - rect.top
    const ratio = rect.height > 0 ? y / rect.height : 0.5

    // решаем, в какую зону попали
    let nextPos: 'above' | 'below' | 'inside'
    if (canDropInside && ratio > 0.33 && ratio < 0.67) {
      nextPos = 'inside'
    } else {
      nextPos = ratio < 0.5 ? 'above' : 'below'
    }

    // если доступна только одна из механик — корректируем nextPos
    if (!canDropInside && nextPos === 'inside') {
      nextPos = ratio < 0.5 ? 'above' : 'below'
    }
    if (!(canReorderInTree || canReorderInPinned) && (nextPos === 'above' || nextPos === 'below')) {
      nextPos = 'inside'
    }

    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setOverPosition(nextPos)
    setIsOverInside(nextPos === 'inside')
  }

  const handleCardDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    if (isOverInside) setIsOverInside(false)
    if (overPosition) setOverPosition(null)
  }

  const handleCardDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (draggedId === null) return
    const pos = overPosition
    setIsOverInside(false)
    setOverPosition(null)
    event.preventDefault()

    if (pos === 'inside' && canDropInside) {
      // append to children
      void store.moveTodo(draggedId, todo.id, todo.children.length)
      return
    }

    // сортировка среди сиблингов (дерево)
    if ((pos === 'above' || pos === 'below') && canReorderInTree && !isPinnedContext) {
      const targetIndex = pos === 'above' ? index : index + 1
      void store.moveTodo(draggedId, parentId, targetIndex)
      return
    }

    // сортировка в закрепленном списке
    if ((pos === 'above' || pos === 'below') && canReorderInPinned && pinnedListId) {
      const targetIndex = pos === 'above' ? index : index + 1
      void store.movePinnedTodo(draggedId, pinnedListId, targetIndex)
    }
  }

  const titleStyles = useMemo(
    () =>
      [
        'font-medium leading-snug transition-colors',
        todo.completed ? 'text-slate-400 line-through' : 'text-slate-700',
      ].join(' '),
    [todo.completed],
  )

  return (
    <div className="space-y-1">
      <div
        className={[
          'group/todo rounded-xl bg-white/95 ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md',
          isDragging ? 'opacity-60 ring-2 ring-slate-300' : '',
          isOverInside && canDropInside ? 'ring-2 ring-emerald-400/80 bg-emerald-50/50' : '',
          overPosition === 'above' ? 'shadow-[inset_0_2px_0_0_rgba(16,185,129,0.7)]' : '',
          overPosition === 'below' ? 'shadow-[inset_0_-2px_0_0_rgba(16,185,129,0.7)]' : '',
        ].join(' ')}
        draggable={!isEditing && !isAddingChild}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleCardDragOver}
        onDragLeave={handleCardDragLeave}
        onDrop={handleCardDrop}
      >
        <div className="flex items-center gap-3 px-4 py-2">
          {/* Toggle collapse button for nodes that can have children */}
          {allowChildren && (
            <button
              type="button"
              onClick={handleToggleCollapsed}
              className={`${actionButtonStyles} -ml-1.5 text-lg ${todo.children.length > 0 ? 'text-slate-500' : 'text-slate-300 cursor-default'}`}
              aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
              disabled={todo.children.length === 0}
            >
              {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
            </button>
          )}
          <button
            type="button"
            onClick={handleToggle}
            className={`${actionButtonStyles} text-xl text-slate-500`}
            aria-label={todo.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {todo.completed ? <FiCheckCircle /> : <FiCircle />}
          </button>

          {/* Заголовок и теги в одной строке: теги перед текстом, чтобы перенос был под тегами */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div ref={editWrapRef} className="w-full">
                  <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-snug text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none resize-none"
                    autoFocus
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    onBlur={recalcRows}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        setTitleDraft(todo.title)
                        setIsEditing(false)
                      }
                    }}
                    placeholder="Название задачи"
                    rows={editRows}
                  />
                </div>
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    type="submit"
                    className={`${actionButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`}
                    aria-label="Сохранить название"
                  >
                    <FiCheck />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTitleDraft(todo.title)
                      setIsEditing(false)
                    }}
                    className={`${actionButtonStyles} hover:bg-slate-200`}
                    aria-label="Отменить редактирование"
                  >
                    <FiX />
                  </button>
                </div>

                {/* Невидимый измеритель для расчёта количества строк */}
                <div
                  ref={measureRef}
                  aria-hidden
                  className="pointer-events-none absolute -z-10 whitespace-pre-wrap break-words rounded-lg border border-transparent px-3 py-2 text-sm leading-snug"
                  style={{ visibility: 'hidden' }}
                />
              </form>
            ) : (
              <div className="flex flex-wrap items-start gap-2">
                <p className={`${titleStyles} text-sm`}>
                  {(todo.tags ?? []).map((tag) => (<>
                    <span
                      key={tag.id}
                      className="group/tag inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => store.detachTag(todo.id, tag.id)}
                        className="hidden h-4 w-4 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 group-hover/tag:flex focus-visible:flex"
                        aria-label="Удалить тег"
                      >
                        <FiX />
                      </button>
                    </span>
                    &nbsp;
                    </>
                  ))}

                  {todo.tags?.length ? <>&nbsp;</> : null}

                  {todo.title}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleTogglePinned}
                  className={[
                    actionButtonStyles,
                    todo.pinned ? 'text-amber-500 hover:text-amber-500' : '',
                  ].join(' ')}
                  aria-label={todo.pinned ? 'Открепить задачу' : 'Закрепить задачу'}
                  aria-pressed={todo.pinned}
                >
                  <FiStar className={todo.pinned ? 'text-amber-500' : undefined} />
                </button>
                {canAddChild && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingChild((value) => !value)
                    }}
                    className={actionButtonStyles}
                    aria-label={isAddingChild ? 'Скрыть форму добавления подзадачи' : 'Добавить подзадачу'}
                  >
                    <FiPlus />
                  </button>
                )}
                {/* Кнопка тегов с выпадающим списком */}
                {availableTags.length > 0 && (
                  <div ref={tagPickerRef} className="relative">
                    <button
                      type="button"
                      {...tagDropdown.getTriggerProps()}
                      className={actionButtonStyles}
                      aria-label="Выбрать теги"
                      aria-expanded={tagDropdown.isOpen}
                    >
                      <FiTag />
                    </button>
                    {tagDropdown.isMounted && (
                      <div
                        className={tagDropdown.getMenuClassName('absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg border border-slate-200 bg-white p-2 shadow-lg')}
                        {...tagDropdown.getMenuProps()}
                      >
                        <div className="mb-2 px-1 text-xs font-medium text-slate-500">Теги</div>
                        <ul className="max-h-56 overflow-auto">
                          {availableTags.map((t) => {
                            const selected = todoTagIds.has(t.id)
                            return (
                              <li key={t.id}>
                                <button
                                  type="button"
                                  role="menuitemcheckbox"
                                  aria-checked={selected}
                                  onClick={() => {
                                    if (selected) {
                                      void store.detachTag(todo.id, t.id)
                                    } else {
                                      void store.attachTag(todo.id, t.id)
                                    }
                                  }}
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                                >
                                  <span className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border ${selected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}>
                                    <FiCheck className="h-3 w-3" />
                                  </span>
                                  <span className={`flex-1 ${selected ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{t.name}</span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={actionButtonStyles}
                  aria-label="Редактировать задачу"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className={`${actionButtonStyles} text-rose-400 hover:text-rose-600`}
                  aria-label="Удалить задачу"
                >
                  <FiTrash2 />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Removed bottom tags row; tags are now inline above */}

        {canAddChild && isAddingChild && !isCollapsed && (
          <form onSubmit={handleAddChild} className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <input
              ref={childInputRef}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              value={childTitle}
              onChange={(event) => setChildTitle(event.target.value)}
              placeholder="Новая подзадача"
            />
            <div className="flex items-center gap-1">
              <button
                type="submit"
                className={`${actionButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`}
                aria-label="Добавить подзадачу"
              >
                <FiCheck />
              </button>
              <button
                type="button"
                onClick={() => {
                  setChildTitle('')
                  setIsAddingChild(false)
                }}
                className={actionButtonStyles}
                aria-label="Отменить добавление подзадачи"
              >
                <FiX />
              </button>
            </div>
          </form>
        )}
      </div>

      {canAddChild && !isCollapsed && (
        <div className="space-y-2 border-l border-slate-200/70 pl-6">
          {todo.children.map((child, childIndex) => (
            <Fragment key={child.id}>
              <TodoItem todo={child} depth={depth + 1} parentId={todo.id} index={childIndex} />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export const TodoItem = observer(TodoItemComponent)
