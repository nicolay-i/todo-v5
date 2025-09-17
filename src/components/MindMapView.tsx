import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEventHandler } from 'react'
import { observer } from 'mobx-react-lite'
import * as d3 from 'd3'
import {
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { useTodoStore } from '../stores/TodoStoreContext'
import type { TodoNode } from '../stores/TodoStore'

const ROOT_ID = '__mind_map_root__'
const NODE_WIDTH = 220
const NODE_HEIGHT = 96
const HORIZONTAL_GAP = 200
const VERTICAL_GAP = 110
const MAP_MARGIN = 160

type Direction = 'left' | 'right'

interface LayoutNode {
  id: string
  title: string
  completed: boolean
  parentId: string | null
  depth: number
  x: number
  y: number
  direction: Direction
}

interface LinkPath {
  id: string
  path: string
}

const assignDirection = (node: d3.HierarchyPointNode<TodoNode>, direction: Direction, map: Map<string, Direction>) => {
  map.set(node.data.id, direction)
  node.children?.forEach((child: d3.HierarchyPointNode<TodoNode>) => assignDirection(child, direction, map))
}

const filterTodos = (todos: TodoNode[], hideCompleted: boolean): TodoNode[] => {
  const result: TodoNode[] = []

  todos.forEach((todo) => {
    const filteredChildren = filterTodos(todo.children, hideCompleted)
    const allChildrenHidden = hideCompleted && todo.children.length > 0 && filteredChildren.length === 0
    const shouldHideNode = hideCompleted && (todo.completed || allChildrenHidden)

    if (!shouldHideNode) {
      result.push({
        ...todo,
        children: filteredChildren,
      })
    }
  })

  return result
}

const MindMapViewComponent = () => {
  const store = useTodoStore()
  const [hideCompleted, setHideCompleted] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [titleDraft, setTitleDraft] = useState('')
  const [newItemTitle, setNewItemTitle] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [activeDropId, setActiveDropId] = useState<string | null>(null)
  const [canDropToRoot, setCanDropToRoot] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const filteredTodos = useMemo(() => filterTodos(store.todos, hideCompleted), [store.todos, hideCompleted])

  const { layoutNodes, links, rootPosition, parentMap, size } = useMemo(() => {
    const layoutNodes: LayoutNode[] = []
    const links: LinkPath[] = []
    const parentMap = new Map<string, string | null>()

    if (filteredTodos.length === 0) {
      const height = 320
      const width = Math.max(containerWidth, 600)
      return {
        layoutNodes,
        links,
        parentMap,
        rootPosition: { x: width / 2, y: height / 2 },
        size: { width, height },
      }
    }

    const rootData = {
      id: ROOT_ID,
      title: 'Root',
      completed: false,
      pinned: false,
      children: filteredTodos,
    }

    const hierarchy = d3.hierarchy<TodoNode>(rootData, (node: TodoNode) => node.children)
    const treeLayout = d3.tree<TodoNode>().nodeSize([VERTICAL_GAP, 1]).separation(() => 1.4)
    const root = treeLayout(hierarchy)

    const directionMap = new Map<string, Direction>()

    root.children?.forEach((child: d3.HierarchyPointNode<TodoNode>, index: number) => {
      const direction: Direction = index % 2 === 0 ? 'right' : 'left'
      assignDirection(child, direction, directionMap)
    })

    let minHorizontal = Infinity
    let maxHorizontal = -Infinity
    let minVertical = Infinity
    let maxVertical = -Infinity

    root.each((node: d3.HierarchyPointNode<TodoNode>) => {
      if (node.data.id === ROOT_ID) return

      const parentId = node.parent?.data.id === ROOT_ID ? null : node.parent?.data.id ?? null
      parentMap.set(node.data.id, parentId)

      const direction = directionMap.get(node.data.id) ?? 'right'
      const depth = Math.max(0, node.depth - 1)
      const horizontal = depth * HORIZONTAL_GAP * (direction === 'right' ? 1 : -1)
      const vertical = node.x

      minHorizontal = Math.min(minHorizontal, horizontal)
      maxHorizontal = Math.max(maxHorizontal, horizontal)
      minVertical = Math.min(minVertical, vertical)
      maxVertical = Math.max(maxVertical, vertical)

      layoutNodes.push({
        id: node.data.id,
        title: node.data.title,
        completed: node.data.completed,
        parentId,
        depth,
        x: horizontal,
        y: vertical,
        direction,
      })
    })

    const rootHorizontal = 0
    const rootVertical = root.x

    minHorizontal = Math.min(minHorizontal, rootHorizontal)
    maxHorizontal = Math.max(maxHorizontal, rootHorizontal)
    minVertical = Math.min(minVertical, rootVertical)
    maxVertical = Math.max(maxVertical, rootVertical)

    const rawWidth = maxHorizontal - minHorizontal || NODE_WIDTH
    const rawHeight = maxVertical - minVertical || NODE_HEIGHT

    const width = Math.max(containerWidth, rawWidth + MAP_MARGIN * 2)
    const height = rawHeight + MAP_MARGIN * 2

    const horizontalOffset = (width - (maxHorizontal - minHorizontal)) / 2 - minHorizontal
    const verticalOffset = MAP_MARGIN - minVertical

    const positionedNodes = layoutNodes.map((node) => {
      const x = node.x + horizontalOffset
      const y = node.y + verticalOffset
      return {
        ...node,
        x,
        y,
      }
    })

    const nodesById = new Map(positionedNodes.map((node) => [node.id, node]))
    const rootPosition = {
      x: rootHorizontal + horizontalOffset,
      y: rootVertical + verticalOffset,
    }

    positionedNodes.forEach((node) => {
      const parentId = node.parentId
      const source = parentId ? nodesById.get(parentId) : rootPosition
      if (!source) return

      const sourcePoint = 'id' in source ? { x: source.x, y: source.y } : source
      const targetPoint = { x: node.x, y: node.y }

      const middleX = (sourcePoint.x + targetPoint.x) / 2
      const path = `M${sourcePoint.x},${sourcePoint.y} C${middleX},${sourcePoint.y} ${middleX},${targetPoint.y} ${targetPoint.x},${targetPoint.y}`
      links.push({ id: `${parentId ?? 'root'}-${node.id}`, path })
    })

    return {
      layoutNodes: positionedNodes,
      links,
      parentMap,
      rootPosition,
      size: { width, height },
    }
  }, [filteredTodos, containerWidth])

  useEffect(() => {
    if (!selectedId) return
    if (!layoutNodes.some((node) => node.id === selectedId)) {
      setSelectedId(null)
      setEditingId(null)
    }
  }, [selectedId, layoutNodes])

  useEffect(() => {
    if (!editingId) return
    const node = layoutNodes.find((item) => item.id === editingId)
    if (!node) {
      setEditingId(null)
      setTitleDraft('')
    }
  }, [editingId, layoutNodes])

  const startEditing = (id: string, title: string) => {
    setEditingId(id)
    setTitleDraft(title)
  }

  const commitTitle = () => {
    if (!editingId) return
    const trimmed = titleDraft.trim()
    if (!trimmed) return
    store.updateTitle(editingId, trimmed)
    setEditingId(null)
  }

  const handleToggleCompleted = (id: string) => {
    store.toggleTodo(id)
  }

  const handleDelete = (id: string) => {
    store.deleteTodo(id)
    if (selectedId === id) {
      setSelectedId(null)
    }
    if (editingId === id) {
      setEditingId(null)
    }
  }

  const resetNewItem = () => {
    setNewItemTitle('')
  }

  const handleCreateWithParent = (parentId: string | null) => {
    const trimmed = newItemTitle.trim()
    if (!trimmed) return
    store.addTodo(parentId, trimmed)
    resetNewItem()
  }

  const handleNewItemKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const parentId = selectedId ? parentMap.get(selectedId) ?? null : null
      handleCreateWithParent(parentId)
    } else if (event.key === 'Tab') {
      event.preventDefault()
      const targetId = selectedId ?? null
      handleCreateWithParent(targetId)
    }
  }

  const isNewItemValid = newItemTitle.trim().length > 0

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id)
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setActiveDropId(null)
    setCanDropToRoot(false)
  }

  const handleRootDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!draggedId) return
    if (!store.canDrop(draggedId, null)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setActiveDropId(null)
    setCanDropToRoot(true)
  }

  const handleRootDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!draggedId) return
    if (!store.canDrop(draggedId, null)) return
    store.moveTodoToParent(draggedId, null)
    handleDragEnd()
  }

  const dropHandlers = (id: string) => ({
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      if (!draggedId || draggedId === id) return
      if (!store.canDrop(draggedId, id)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setActiveDropId(id)
      setCanDropToRoot(false)
    },
    onDragLeave: () => {
      if (activeDropId === id) {
        setActiveDropId(null)
      }
    },
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (!draggedId || draggedId === id) return
      if (!store.canDrop(draggedId, id)) return
      store.moveTodoToParent(draggedId, id)
      handleDragEnd()
    },
  })

  const selectedParentId = selectedId ? parentMap.get(selectedId) ?? null : null

  return (
    <div className="flex h-full flex-col text-slate-600">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70">
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(event) => setHideCompleted(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />
          Скрывать выполненные пункты
        </label>

        <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
          <input
            value={newItemTitle}
            onChange={(event) => setNewItemTitle(event.target.value)}
            onKeyDown={handleNewItemKeyDown}
            placeholder={selectedId ? 'Новый пункт для mind map' : 'Новая задача верхнего уровня'}
            className="w-full min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleCreateWithParent(selectedParentId)}
              disabled={!isNewItemValid}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Enter — к родителю
            </button>
            <button
              type="button"
              onClick={() => handleCreateWithParent(selectedId ?? null)}
              className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!selectedId || !isNewItemValid}
            >
              Tab — как потомка
            </button>
            <button
              type="button"
              onClick={resetNewItem}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Очистить
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative mt-6 flex-1 overflow-auto rounded-3xl bg-white/80 p-6 shadow-inner ring-1 ring-slate-200/60"
        style={{ minHeight: `${Math.max(480, size.height)}px` }}
      >
        <svg
          width={size.width}
          height={size.height}
          className="absolute left-0 top-0 -z-10"
        >
          {links.map((link) => (
            <path key={link.id} d={link.path} className="fill-none stroke-slate-300" strokeWidth={2} />
          ))}
        </svg>

        {layoutNodes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Нет задач для отображения. Добавьте новую задачу или отключите фильтр скрытия выполненных.
          </div>
        ) : (
          <>
            {layoutNodes.map((node) => {
              const isSelected = node.id === selectedId
              const isEditing = node.id === editingId
              const isDropTarget = activeDropId === node.id

              return (
                <div
                  key={node.id}
                  className={[
                    'absolute w-[220px] cursor-grab select-none rounded-2xl border bg-white/95 p-3 text-sm shadow-md transition',
                    isSelected ? 'border-indigo-400 ring-2 ring-indigo-300' : 'border-slate-200 ring-1 ring-transparent',
                    isDropTarget ? 'border-emerald-400 ring-2 ring-emerald-300' : '',
                    isEditing ? 'cursor-auto' : '',
                  ].join(' ')}
                  style={{ transform: `translate(${node.x - NODE_WIDTH / 2}px, ${node.y - NODE_HEIGHT / 2}px)` }}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelectedId(node.id)
                  }}
                  draggable={!isEditing}
                  onDragStart={(event) => handleDragStart(event, node.id)}
                  onDragEnd={handleDragEnd}
                  {...dropHandlers(node.id)}
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleToggleCompleted(node.id)
                      }}
                      className="rounded-lg p-1 text-base text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label={node.completed ? 'Снять отметку о выполнении' : 'Отметить как выполненную'}
                    >
                      {node.completed ? <FiCheckCircle /> : <FiCircle />}
                    </button>
                    <div className="flex-1">
                      {isEditing ? (
                        <form
                          onSubmit={(event) => {
                            event.preventDefault()
                            commitTitle()
                          }}
                          className="flex flex-col gap-2"
                        >
                          <input
                            value={titleDraft}
                            onChange={(event) => setTitleDraft(event.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              type="submit"
                              className="rounded-md bg-emerald-500 p-1.5 text-white transition hover:bg-emerald-500/90"
                              aria-label="Сохранить"
                            >
                              <FiCheck />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setEditingId(null)
                              }}
                              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                              aria-label="Отменить"
                            >
                              <FiX />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className={`font-medium leading-snug ${node.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {node.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="mt-3 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          store.addTodo(node.id, 'Новая задача')
                        }}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Добавить подзадачу"
                      >
                        <FiPlus />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          startEditing(node.id, node.title)
                        }}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Редактировать"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(node.id)
                        }}
                        className="rounded-md p-1.5 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
                        aria-label="Удалить"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            <div
              className={[
                'absolute flex h-16 w-64 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 text-xs font-medium uppercase tracking-wide text-slate-400 transition',
                canDropToRoot ? 'border-emerald-400 text-emerald-500' : '',
              ].join(' ')}
              style={{ left: rootPosition.x, top: rootPosition.y }}
              onDragOver={handleRootDragOver}
              onDrop={handleRootDrop}
              onDragLeave={() => setCanDropToRoot(false)}
            >
              Перетащите сюда, чтобы сделать верхнего уровня
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const MindMapView = observer(MindMapViewComponent)
