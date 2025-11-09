'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { focusEdgeTodo, focusTodoByOffset } from '@/lib/dom/todoFocus'
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
  enableDragDrop?: boolean
  forceExpanded?: boolean
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const TodoItemComponent = ({ todo, depth, parentId, index, pinnedListId, allowChildren = true, enableDragDrop = true, forceExpanded = false }: TodoItemProps) => {
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)
  const [aliasDraft, setAliasDraft] = useState(todo.alias ?? '')
  const [childTitle, setChildTitle] = useState('')
  const [isOverInside, setIsOverInside] = useState(false)
  const [overPosition, setOverPosition] = useState<null | 'above' | 'below' | 'inside'>(null)
  const childInputRef = useRef<HTMLInputElement>(null)
  const focusRef = useRef<HTMLDivElement>(null)
  // Выпадающий список тегов: управляeм через общий хук
  const tagDropdown = useDropdown({ closeDelay: 300, animationDuration: 200, groupKey: 'tag-picker', openOnHover: false })
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

  const navScope: 'list' | 'pinned' = pinnedListId ? 'pinned' : 'list'
  const canAddChild = allowChildren && depth < MAX_DEPTH
  const isDragging = store.draggedId === todo.id
  const searchActive = store.isSearchActive
  const isCollapsed = forceExpanded ? false : (searchActive ? false : store.isCollapsed(todo.id))
  const draggedId = store.draggedId
  const canDropInside =
    allowChildren && depth < MAX_DEPTH && draggedId !== null && store.canDrop(draggedId, todo.id)
  const canReorderInTree = draggedId !== null && store.canDrop(draggedId, parentId)
  const isPinnedContext = Boolean(pinnedListId)
  const canReorderInPinned = draggedId !== null && isPinnedContext && store.isPinned(draggedId!)
  // Проверяем, является ли задача первым ребенком узла на максимальной глубине
  const isFirstChildAtMaxDepth = !isPinnedContext && store.highlightFirstAtMaxDepth && store.isFirstChildAtMaxDepth(todo.id)

  useEffect(() => {
    setTitleDraft(todo.title)
  }, [todo.title])

  useEffect(() => {
    setAliasDraft(todo.alias ?? '')
  }, [todo.alias])

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

  const wasEditingRef = useRef(false)
  useEffect(() => {
    if (wasEditingRef.current && !isEditing && focusRef.current) {
      focusRef.current.focus()
    }
    wasEditingRef.current = isEditing
  }, [isEditing])
  const wasAddingChildRef = useRef(false)
  useEffect(() => {
    if (wasAddingChildRef.current && !isAddingChild && focusRef.current) {
      focusRef.current.focus()
    }
    wasAddingChildRef.current = isAddingChild
  }, [isAddingChild])

  // Фокус менеджмент для меню тегов
  useEffect(() => {
    if (!tagDropdown.isOpen) {
      const active = document.activeElement
      if (focusRef.current && tagDropdown.menuRef.current?.contains(active)) {
        focusRef.current.focus()
      }
      return
    }
    const menu = tagDropdown.menuRef.current
    if (!menu) return
    const firstButton = menu.querySelector<HTMLButtonElement>('[data-tag-option="true"]')
    firstButton?.focus()
  }, [tagDropdown.isOpen, tagDropdown.menuRef])

  const handleToggle = useCallback(() => {
    void store.toggleTodo(todo.id)
  }, [store, todo.id])

  const cancelEditing = useCallback(() => {
    setTitleDraft(todo.title)
    setAliasDraft(todo.alias ?? '')
    setIsEditing(false)
  }, [todo.alias, todo.title])

  // --- Фильтрация тегов и вычислимые значения ниже нужны commitEdit, поэтому объявим commitEdit после них ---

  const handleAddChild: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const trimmed = childTitle.trim()
    if (!trimmed) return
    await store.addTodo(todo.id, trimmed)
    setChildTitle('')
    setIsAddingChild(false)
  }

  const handleDelete = useCallback(() => {
    void store.deleteTodo(todo.id)
  }, [store, todo.id])

  const handleTogglePinned = () => {
    void store.togglePinned(todo.id)
  }

  // Фильтруем видимые теги по системным правилам
  const availableTags = store.tags.filter((t) => {
    if (t.name === 'Проект') {
      // скрыть, если у предков уже есть 'Проект'
      const hasProjectAncestor = (function checkParent(parentId: string | null): boolean {
        if (!parentId) return false
        const info = store.findTodo(parentId as string)
        if (!info) return false
        if ((info.node.tags ?? []).some(tag => tag.name === 'Проект')) return true
        return checkParent(info.parent ? info.parent.id : info.node.parentId ?? null)
      })(parentId)
      return !hasProjectAncestor
    }
    if (t.name === 'Раздел') {
      // показывать только если у предков есть 'Проект'
      const hasProjectAncestor = (function checkParent(parentId: string | null): boolean {
        if (!parentId) return false
        const info = store.findTodo(parentId as string)
        if (!info) return false
        if ((info.node.tags ?? []).some(tag => tag.name === 'Проект')) return true
        return checkParent(info.parent ? info.parent.id : info.node.parentId ?? null)
      })(parentId)
      return hasProjectAncestor
    }
    return true
  })
  const todoTagIds = useMemo(() => new Set((todo.tags ?? []).map((t) => t.id)), [todo.tags])
  const canEditAlias = useMemo(
    () => (todo.tags ?? []).some((tag) => tag.name === 'Проект' || tag.name === 'Раздел'),
    [todo.tags],
  )
  const aliasBadge = store.getNearestAlias(todo.id)
  const aliasInputId = `todo-alias-${todo.id}`
  const hasVisualTags = Boolean(aliasBadge) || (todo.tags?.length ?? 0) > 0

  // Автосохранение с дебаунсингом при изменении текста
  useEffect(() => {
    if (!isEditing) return
    
    const trimmed = titleDraft.trim()
    // Не сохраняем если текст не изменился или пустой
    if (trimmed === todo.title || !trimmed) return

    const timer = setTimeout(() => {
      const details: { title: string; alias?: string | null } = { title: trimmed }
      if (canEditAlias) {
        const aliasTrimmed = aliasDraft.trim()
        details.alias = aliasTrimmed ? aliasTrimmed : null
      }
      void store.updateTodoDetails(todo.id, details)
    }, 500) // дебаунс 500мс

    return () => clearTimeout(timer)
  }, [titleDraft, aliasDraft, isEditing, todo.title, todo.id, canEditAlias, store])

  const commitEdit = useCallback(async () => {
    const trimmed = titleDraft.trim()
    const aliasTrimmed = aliasDraft.trim()
    if (!trimmed) {
      cancelEditing()
      return
    }
    const details: { title: string; alias?: string | null } = { title: trimmed }
    if (canEditAlias) {
      details.alias = aliasTrimmed ? aliasTrimmed : null
    }
    await store.updateTodoDetails(todo.id, details)
    setIsEditing(false)
  }, [aliasDraft, cancelEditing, canEditAlias, store, titleDraft, todo.id])

  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    void commitEdit()
  }

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

  const menuProps = tagDropdown.getMenuProps()

  const handleCardKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (!focusRef.current) return

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        focusTodoByOffset(focusRef.current, 1)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        focusTodoByOffset(focusRef.current, -1)
        return
      }
      case 'Home': {
        event.preventDefault()
        focusEdgeTodo(navScope, false)
        return
      }
      case 'End': {
        event.preventDefault()
        focusEdgeTodo(navScope, true)
        return
      }
      case 'ArrowLeft': {
        if (todo.children.length > 0 && !isCollapsed) {
          event.preventDefault()
          store.setCollapsed(todo.id, true)
        }
        return
      }
      case 'ArrowRight': {
        if (todo.children.length > 0 && isCollapsed) {
          event.preventDefault()
          store.setCollapsed(todo.id, false)
        }
        return
      }
      case ' ': {
        event.preventDefault()
        handleToggle()
        return
      }
      case 'Delete':
      case 'Backspace': {
        event.preventDefault()
        handleDelete()
        return
      }
      default:
    }

    const key = event.key.toLowerCase()
    if (key === 'e') {
      event.preventDefault()
      setIsEditing(true)
      return
    }
    if (key === 'a') {
      event.preventDefault()
      if (!canAddChild) return
      setIsAddingChild((prev) => {
        const next = !prev
        if (!next) {
          setChildTitle('')
          return next
        }
        requestAnimationFrame(() => {
          childInputRef.current?.focus()
        })
        return next
      })
      return
    }
    if (key === 't') {
      event.preventDefault()
      if (event.shiftKey) {
        const availableToAttach = availableTags.filter((tag) => !todoTagIds.has(tag.id))
        if (availableToAttach.length > 0) {
          void store.attachTag(todo.id, availableToAttach[0].id)
        } else if (todo.tags?.length) {
          const lastTag = todo.tags[todo.tags.length - 1]
          void store.detachTag(todo.id, lastTag.id)
        }
        return
      }
      if (tagDropdown.isOpen) {
        tagDropdown.close()
        focusRef.current?.focus()
      } else if (availableTags.length > 0) {
        tagDropdown.open()
      }
    }
  }, [availableTags, canAddChild, handleDelete, handleToggle, isCollapsed, navScope, store, tagDropdown, todo.children.length, todo.id, todo.tags, todoTagIds])

  const handleTagMenuKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!tagDropdown.isOpen) return
    const menu = tagDropdown.menuRef.current
    if (!menu) return
    const buttons = Array.from(menu.querySelectorAll<HTMLButtonElement>('[data-tag-option="true"]'))
    if (event.key === 'Escape') {
      event.preventDefault()
      tagDropdown.close()
      focusRef.current?.focus()
      return
    }
    if (buttons.length === 0) return

    const activeElement = document.activeElement as HTMLElement | null
    const currentIndex = activeElement ? buttons.findIndex((button) => button === activeElement) : -1

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0
      buttons[nextIndex].focus()
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1
      buttons[prevIndex].focus()
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      buttons[0].focus()
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      buttons[buttons.length - 1].focus()
      return
    }
    if (event.code.startsWith('Digit')) {
      const digit = Number.parseInt(event.code.replace('Digit', ''), 10)
      if (Number.isNaN(digit) || digit <= 0) return
      const index = digit - 1
      if (index >= buttons.length) return
      event.preventDefault()
      buttons[index].click()
      buttons[index].focus()
    }
  }, [tagDropdown])

  return (
    <div className="space-y-1">
      <div
        className={[
          'group/todo rounded-xl bg-white/95 ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md',
          isDragging ? 'opacity-60 ring-2 ring-slate-300' : '',
          isOverInside && canDropInside ? 'ring-2 ring-emerald-400/80 bg-emerald-50/50' : '',
          overPosition === 'above' ? 'shadow-[inset_0_2px_0_0_rgba(16,185,129,0.7)]' : '',
          overPosition === 'below' ? 'shadow-[inset_0_-2px_0_0_rgba(16,185,129,0.7)]' : '',
          isFirstChildAtMaxDepth ? 'is-first' : '',
          todo.id.startsWith('temp_') ? 'opacity-50' : '',
        ].join(' ')}
        draggable={enableDragDrop && !isEditing && !isAddingChild}
        onDragStart={enableDragDrop ? handleDragStart : undefined}
        onDragEnd={enableDragDrop ? handleDragEnd : undefined}
        onDragOver={enableDragDrop ? handleCardDragOver : undefined}
        onDragLeave={enableDragDrop ? handleCardDragLeave : undefined}
        onDrop={enableDragDrop ? handleCardDrop : undefined}
        ref={focusRef}
        tabIndex={-1}
        role="listitem"
        data-todo-focusable="true"
        data-focus-scope={navScope}
        data-todo-id={todo.id}
        onKeyDown={handleCardKeyDown}
      >
        <div className="todo-card-row flex items-center gap-3 px-4 py-2">
          {/* Toggle collapse button for nodes that can have children */}
          {allowChildren && (
            <button
              type="button"
              onClick={handleToggleCollapsed}
              className={[
                actionButtonStyles,
                '-ml-1.5 text-lg',
                todo.children.length > 0 && !searchActive && !forceExpanded
                  ? 'text-slate-500'
                  : 'text-slate-300 cursor-default',
                  'btn-collapse'
              ].join(' ')}
              aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
              disabled={todo.children.length === 0 || searchActive || forceExpanded}
            >
              {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
            </button>
          )}
          <button
            type="button"
            onClick={handleToggle}
            className={`${actionButtonStyles} text-xl text-slate-500 btn-toggle`}
            aria-label={todo.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {todo.completed ? <FiCheckCircle /> : <FiCircle />}
          </button>

          {/* Заголовок и теги в одной строке: теги перед текстом, чтобы перенос был под тегами */}
          <div className="flex-1 todo-main">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start form-title">
                <div ref={editWrapRef} className="w-full">
                  <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-snug text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none resize-none"
                    autoFocus
                    value={titleDraft}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    onBlur={recalcRows}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        cancelEditing()
                        return
                      }
                      if (event.key === 'Enter' && !event.shiftKey) {
                        const isMultiline = titleDraft.includes('\n') || editRows > 1
                        if (event.ctrlKey || event.metaKey || !isMultiline) {
                          event.preventDefault()
                          void commitEdit()
                        }
                      }
                    }}
                    placeholder="Название задачи"
                    rows={editRows}
                  />
                </div>
                {canEditAlias && (
                  <div className="w-full sm:w-64">
                    <input
                      id={aliasInputId}
                      type="text"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-snug text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                      value={aliasDraft}
                      onChange={(event) => setAliasDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          cancelEditing()
                        }
                      }}
                      placeholder="Алиас для дочерних задач"
                    />
                  </div>
                )}
                <div className="flex items-center gap-1 self-end sm:self-auto mt-1">
                  <button
                    type="submit"
                    className={`${actionButtonStyles} bg-emerald-500 text-white hover:bg-emerald-500/90`}
                    aria-label="Сохранить название"
                  >
                    <FiCheck />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
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
               <div className="flex flex-wrap items-start gap-2 tags-span" onDoubleClick={() => setIsEditing(true)}>
                 <p className={`${titleStyles} text-sm`}>
                  {aliasBadge ? (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {aliasBadge.alias}
                      </span>
                      &nbsp;
                    </>
                  ) : null}

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

                  {hasVisualTags ? <>&nbsp;</> : null}

                  <HighlightedText text={todo.title} ranges={store.getSearchHighlight(todo.id)} />
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 btn-pin">
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
                  <div ref={tagPickerRef} className="relative btn-add-tags">
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
                        ref={tagDropdown.menuRef}
                        className={tagDropdown.getMenuClassName('absolute right-0 z-20 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg')}
                        onMouseEnter={menuProps.onMouseEnter}
                        onMouseLeave={menuProps.onMouseLeave}
                        onKeyDown={handleTagMenuKeyDown}
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
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus:bg-slate-100"
                                  data-tag-option="true"
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
                  className={`${actionButtonStyles} text-rose-400 hover:text-rose-600 btn-remove-tags`}
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
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  setChildTitle('')
                  setIsAddingChild(false)
                }
                if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                  event.preventDefault()
                  event.currentTarget.form?.requestSubmit()
                }
              }}
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
              <TodoItem todo={child} depth={depth + 1} parentId={todo.id} index={childIndex} enableDragDrop={enableDragDrop} forceExpanded={forceExpanded} />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export const TodoItem = observer(TodoItemComponent)

interface HighlightedTextProps {
  text: string
  ranges: ReadonlyArray<[number, number]> | null
}

const HighlightedText = ({ text, ranges }: HighlightedTextProps) => {
  const segments = useMemo(() => {
    if (!ranges || ranges.length === 0) return [text]
    const sorted = [...ranges]
      .map(([start, end]) => [Math.max(0, start), Math.max(start, end)] as [number, number])
      .sort((a, b) => a[0] - b[0])

    const parts: (string | JSX.Element)[] = []
    let cursor = 0

    sorted.forEach(([start, end], index) => {
      const safeStart = Math.min(start, text.length)
      const safeEnd = Math.min(end + 1, text.length)
      if (safeStart > cursor) {
        parts.push(text.slice(cursor, safeStart))
      }
      const slice = text.slice(safeStart, safeEnd)
      if (slice) {
        parts.push(
          <mark
            key={`match-${index}`}
            className="rounded bg-amber-200 px-0.5 text-slate-900"
          >
            {slice}
          </mark>,
        )
      }
      cursor = safeEnd
    })

    if (cursor < text.length) {
      parts.push(text.slice(cursor))
    }

    return parts
  }, [ranges, text])

  return <>{segments}</>
}
