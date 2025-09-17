import { useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { hierarchy, tree } from 'd3'
import {
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import type { HierarchyPointNode } from 'd3-hierarchy'
import { MAX_DEPTH, type TodoNode } from '../stores/TodoStore'
import { useTodoStore } from '../stores/TodoStoreContext'

const NODE_VERTICAL_GAP = 90
const NODE_HORIZONTAL_GAP = 220
const MAP_MARGIN = 160
const DROP_ZONE_OFFSET = 48

type Direction = -1 | 0 | 1

interface MindMapData {
  id: string
  title: string
  completed: boolean
  parentId: string | null
  index: number
  direction: Direction
  node: TodoNode | null
  children: MindMapData[]
}

const buildMindMapChildren = (
  todos: TodoNode[],
  parentId: string | null,
  hideCompleted: boolean,
  branchDirection: Direction,
): MindMapData[] => {
  const result: MindMapData[] = []
  let visibleTopLevelIndex = 0

  todos.forEach((todo, index) => {
    const direction: Direction =
      parentId === null
        ? (visibleTopLevelIndex % 2 === 0 ? 1 : -1)
        : branchDirection === 0
          ? 1
          : branchDirection

    const children = buildMindMapChildren(todo.children, todo.id, hideCompleted, direction)
    const shouldInclude = !hideCompleted || !todo.completed || children.length > 0
    if (!shouldInclude) {
      return
    }

    result.push({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      parentId,
      index,
      direction,
      node: todo,
      children,
    })

    if (parentId === null) {
      visibleTopLevelIndex += 1
    }
  })

  return result
}

const buildMindMapData = (todos: TodoNode[], hideCompleted: boolean): MindMapData => ({
  id: 'root',
  title: 'Карта задач',
  completed: false,
  parentId: null,
  index: -1,
  direction: 0,
  node: null,
  children: buildMindMapChildren(todos, null, hideCompleted, 0),
})

const useMindMapLayout = (data: MindMapData) => {
  const root = useMemo(() => hierarchy(data), [data])
  const layout = useMemo(() => tree<MindMapData>().nodeSize([NODE_VERTICAL_GAP, NODE_HORIZONTAL_GAP]), [])
  const layoutRoot = useMemo(() => layout(root), [layout, root])

  const nodes = layoutRoot.descendants()
  nodes.forEach((node) => {
    if (node.depth === 0) {
      node.y = 0
      return
    }

    const direction = node.data.direction === 0 ? 1 : node.data.direction
    node.y = node.depth * NODE_HORIZONTAL_GAP * direction
  })

  const xValues = nodes.map((node) => node.x)
  const yValues = nodes.map((node) => node.y)
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)

  const width = Math.max(320, maxY - minY + MAP_MARGIN * 2)
  const height = Math.max(320, maxX - minX + MAP_MARGIN * 2)
  const offsetX = MAP_MARGIN - minX
  const offsetY = MAP_MARGIN - minY

  return {
    nodes,
    links: layoutRoot.links(),
    dimensions: {
      width,
      height,
      offsetX,
      offsetY,
    },
  }
}

interface MindMapDropZoneProps {
  parentId: string | null
  index: number
  left: number
  top: number
}

const MindMapDropZoneComponent = ({ parentId, index, left, top }: MindMapDropZoneProps) => {
  const store = useTodoStore()
  const [isOver, setIsOver] = useState(false)
  const draggedId = store.draggedId

  const canAccept = draggedId !== null && store.canDrop(draggedId, parentId)
  const isVisible = draggedId !== null

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isOver) {
      setIsOver(true)
    }
  }

  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    if (isOver) {
      setIsOver(false)
    }
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept || draggedId === null) return
    event.preventDefault()
    setIsOver(false)
    store.moveTodo(draggedId, parentId, index)
  }

  return (
    <div
      className={[
        'pointer-events-none absolute -translate-x-1/2 rounded-full transition-all duration-150 ease-out',
        isVisible ? 'pointer-events-auto h-3 w-24 opacity-80' : 'h-0 w-0 opacity-0',
        canAccept ? 'bg-slate-300/80 ring-1 ring-slate-400/60' : 'bg-transparent',
        isOver && canAccept ? 'bg-slate-400 ring-slate-500' : '',
      ].join(' ')}
      style={{ left, top }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-hidden
    />
  )
}

const MindMapDropZone = observer(MindMapDropZoneComponent)

interface MindMapNodeCardProps {
  node: HierarchyPointNode<MindMapData>
  left: number
  top: number
  offsetForDropZones: number
}

const MindMapNodeCardComponent = ({ node, left, top, offsetForDropZones }: MindMapNodeCardProps) => {
  const store = useTodoStore()
  const todo = node.data.node as TodoNode

  const [isEditing, setIsEditing] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [titleDraft, setTitleDraft] = useState(todo.title)
  const [childTitle, setChildTitle] = useState('')
  const [isChildDropTarget, setIsChildDropTarget] = useState(false)

  useEffect(() => {
    setTitleDraft(todo.title)
  }, [todo.title])

  const draggedId = store.draggedId
  const storeDepth = Math.max(node.depth - 1, 0)
  const canAddChild = storeDepth < MAX_DEPTH
  const canDropChild =
    draggedId !== null &&
    draggedId !== todo.id &&
    canAddChild &&
    store.canDrop(draggedId, todo.id)
  const currentChildrenCount = todo.children.length

  const handleToggle = () => {
    store.toggleTodo(todo.id)
  }

  const handleDelete = () => {
    store.deleteTodo(todo.id)
  }

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (isEditing || isAddingChild) return
    store.setDragged(todo.id)
    event.dataTransfer.setData('text/plain', todo.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
    store.clearDragged()
    setIsChildDropTarget(false)
  }

  const handleDropOnNode: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canDropChild || draggedId === null) return
    event.preventDefault()
    setIsChildDropTarget(false)
    store.moveTodo(draggedId, todo.id, currentChildrenCount)
  }

  const handleDragOverNode: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canDropChild) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isChildDropTarget) {
      setIsChildDropTarget(true)
    }
  }

  const handleDragLeaveNode: React.DragEventHandler<HTMLDivElement> = () => {
    if (isChildDropTarget) {
      setIsChildDropTarget(false)
    }
  }

  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.updateTitle(todo.id, titleDraft)
    setIsEditing(false)
  }

  const handleAddChildSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(todo.id, childTitle)
    setChildTitle('')
    setIsAddingChild(false)
  }

  return (
    <div style={{ left, top }} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
      <MindMapDropZone parentId={node.data.parentId} index={node.data.index} left={left} top={top - offsetForDropZones} />
      <div
        className={[
          'w-56 rounded-2xl border bg-white/95 shadow-lg ring-1 ring-slate-200 transition-all duration-200',
          todo.completed ? 'opacity-80' : 'opacity-100',
          isChildDropTarget ? 'ring-2 ring-emerald-400 shadow-emerald-100' : '',
        ].join(' ')}
        draggable={!isEditing && !isAddingChild}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOverNode}
        onDragLeave={handleDragLeaveNode}
        onDrop={handleDropOnNode}
      >
        <div className="flex items-start gap-2 px-4 py-3">
          <button
            type="button"
            onClick={handleToggle}
            className="rounded-lg p-1.5 text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none"
            aria-label={todo.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {todo.completed ? <FiCheckCircle /> : <FiCircle />}
          </button>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
                  value={titleDraft}
                  autoFocus
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setTitleDraft(todo.title)
                      setIsEditing(false)
                    }
                  }}
                />
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-500 p-1.5 text-white transition hover:bg-emerald-500/90"
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
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Отменить редактирование"
                  >
                    <FiX />
                  </button>
                </div>
              </form>
            ) : (
              <p className={['text-sm font-medium leading-snug', todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'].join(' ')}>
                {todo.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2">
          <div className="flex items-center gap-1">
            {canAddChild && (
              <button
                type="button"
                onClick={() => setIsAddingChild((value) => !value)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none"
                aria-label={isAddingChild ? 'Скрыть форму добавления подзадачи' : 'Добавить подзадачу'}
              >
                <FiPlus />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none"
              aria-label="Редактировать задачу"
            >
              <FiEdit2 />
            </button>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-100 hover:text-rose-500 focus-visible:outline-none"
            aria-label="Удалить задачу"
          >
            <FiTrash2 />
          </button>
        </div>

        {isAddingChild && canAddChild && (
          <form onSubmit={handleAddChildSubmit} className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
              placeholder="Новая подзадача"
              value={childTitle}
              autoFocus
              onChange={(event) => setChildTitle(event.target.value)}
            />
            <div className="flex items-center gap-1">
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 p-1.5 text-white transition hover:bg-emerald-500/90"
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
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Отменить добавление подзадачи"
              >
                <FiX />
              </button>
            </div>
          </form>
        )}
      </div>
      <MindMapDropZone
        parentId={node.data.parentId}
        index={node.data.index + 1}
        left={left}
        top={top + offsetForDropZones}
      />
    </div>
  )
}

const MindMapNodeCard = observer(MindMapNodeCardComponent)

const MindMapViewComponent = () => {
  const store = useTodoStore()
  const [hideCompleted, setHideCompleted] = useState(false)
  const [isAddingRootChild, setIsAddingRootChild] = useState(false)
  const [rootChildTitle, setRootChildTitle] = useState('')

  const data = buildMindMapData(store.todos, hideCompleted)
  const { nodes, links, dimensions } = useMindMapLayout(data)
  const [rootNode, ...otherNodes] = nodes

  const draggedId = store.draggedId
  const canDropToRoot = draggedId !== null && store.canDrop(draggedId, null)

  const handleRootDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canDropToRoot || draggedId === null) return
    event.preventDefault()
    store.moveTodo(draggedId, null, store.todos.length)
  }

  const handleRootDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canDropToRoot) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleRootChildSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(null, rootChildTitle)
    setRootChildTitle('')
    setIsAddingRootChild(false)
  }

  const toggleHideCompleted = () => {
    setHideCompleted((value) => !value)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-700">Mind map</h2>
          <p className="text-sm text-slate-500">Визуализируйте дерево задач и управляйте иерархией через перетаскивание.</p>
        </div>
        <button
          type="button"
          onClick={toggleHideCompleted}
          className={[
            'rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none',
            hideCompleted
              ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-500/90'
              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100',
          ].join(' ')}
        >
          {hideCompleted ? 'Показывать выполненные' : 'Скрыть выполненные'}
        </button>
      </div>

      <div
        className="relative flex-1 overflow-auto rounded-3xl border border-slate-200/70 bg-slate-50/70"
        style={{ minHeight: 480 }}
      >
        <div style={{ width: dimensions.width, height: dimensions.height }} className="relative">
          <svg width={dimensions.width} height={dimensions.height} className="absolute inset-0">
            <g>
              {links.map((link, index) => {
                const sourceX = link.source.x + dimensions.offsetX
                const sourceY = link.source.y + dimensions.offsetY
                const targetX = link.target.x + dimensions.offsetX
                const targetY = link.target.y + dimensions.offsetY
                const midY = (sourceY + targetY) / 2

                return (
                  <path
                    key={`${link.source.data.id}-${link.target.data.id}-${index}`}
                    d={`M${sourceY},${sourceX} C ${midY},${sourceX} ${midY},${targetX} ${targetY},${targetX}`}
                    fill="none"
                    stroke="rgba(100,116,139,0.35)"
                    strokeWidth={2}
                  />
                )
              })}
            </g>
          </svg>

          {rootNode && (
            <div
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{
                left: rootNode.y + dimensions.offsetY,
                top: rootNode.x + dimensions.offsetX,
              }}
              onDragOver={handleRootDragOver}
              onDrop={handleRootDrop}
            >
              <MindMapDropZone parentId={null} index={0} left={rootNode.y + dimensions.offsetY} top={rootNode.x + dimensions.offsetX - DROP_ZONE_OFFSET} />
              <div
                className={[
                  'w-64 rounded-3xl bg-slate-900 p-5 text-white shadow-xl ring-1 ring-slate-900/20 transition',
                  canDropToRoot ? 'ring-2 ring-emerald-400' : '',
                ].join(' ')}
              >
                <h3 className="text-lg font-semibold">Корневой список</h3>
                <p className="mt-1 text-sm text-slate-200/80">
                  Перетащите задачу, чтобы сделать её корневой, или создайте новую верхнеуровневую задачу.
                </p>

                {isAddingRootChild ? (
                  <form onSubmit={handleRootChildSubmit} className="mt-3 flex gap-2">
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none"
                      placeholder="Новая задача"
                      value={rootChildTitle}
                      autoFocus
                      onChange={(event) => setRootChildTitle(event.target.value)}
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-500 p-2 text-white transition hover:bg-emerald-500/90"
                      aria-label="Добавить задачу"
                    >
                      <FiCheck />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRootChildTitle('')
                        setIsAddingRootChild(false)
                      }}
                      className="rounded-lg bg-white/10 p-2 text-slate-200 transition hover:bg-white/20"
                      aria-label="Отменить добавление задачи"
                    >
                      <FiX />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingRootChild(true)}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/25"
                  >
                    <FiPlus /> Добавить задачу
                  </button>
                )}
              </div>
              <MindMapDropZone
                parentId={null}
                index={store.todos.length}
                left={rootNode.y + dimensions.offsetY}
                top={rootNode.x + dimensions.offsetX + DROP_ZONE_OFFSET}
              />
            </div>
          )}

          {otherNodes.map((node) => (
            <MindMapNodeCard
              key={node.data.id}
              node={node}
              left={node.y + dimensions.offsetY}
              top={node.x + dimensions.offsetX}
              offsetForDropZones={DROP_ZONE_OFFSET}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const MindMapView = observer(MindMapViewComponent)
