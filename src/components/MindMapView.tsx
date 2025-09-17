import { useEffect, useMemo, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import * as d3 from 'd3'
import {
  FiArrowUpLeft,
  FiCheckSquare,
  FiCornerDownRight,
  FiEdit2,
  FiPlus,
  FiSquare,
  FiTrash2,
} from 'react-icons/fi'
import { useTodoStore } from '../stores/TodoStoreContext'
import type { TodoNode, TodoStore } from '../stores/TodoStore'

const ROOT_ID = '__mindmap_root__'
const NODE_VERTICAL_GAP = 90
const NODE_HORIZONTAL_GAP = 220
const NODE_CARD_WIDTH = 220
const NODE_CARD_HEIGHT = 86
const DROP_DISTANCE = 120

interface MindMapDatum {
  id: string
  title: string
  completed: boolean
  children: MindMapDatum[]
}

interface NodePosition {
  x: number
  y: number
}

interface BuildResult {
  datum: MindMapDatum
  fullyCompleted: boolean
  visible: boolean
}

type MindMapHierarchyNode = d3.HierarchyPointNode<MindMapDatum>
interface DisplayNode {
  node: MindMapHierarchyNode
  position: NodePosition
}

interface MindMapLink {
  id: string
  source: NodePosition
  target: NodePosition
}

const linkGenerator = d3
  .linkHorizontal<MindMapLink, NodePosition>()
  .x((point: NodePosition) => point.x)
  .y((point: NodePosition) => point.y)

export const MindMapView = observer(() => {
  const store = useTodoStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const dropTargetRef = useRef<string | null>(null)

  const [hideCompleted, setHideCompleted] = useState(false)
  const [positions, setPositions] = useState<Record<string, NodePosition>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [potentialParent, setPotentialParent] = useState<string | null>(null)

  const filteredData = useMemo(
    () => buildMindMapData(store.todos, hideCompleted),
    [store.todos, hideCompleted],
  )

  const hierarchyRoot = useMemo(() => {
    const rootData: MindMapDatum = {
      id: ROOT_ID,
      title: 'root',
      completed: false,
      children: filteredData,
    }

    return d3.hierarchy(rootData)
  }, [filteredData])

  const treeRoot = useMemo(() => {
    const tree = d3.tree<MindMapDatum>().nodeSize([NODE_VERTICAL_GAP, NODE_HORIZONTAL_GAP])
    return tree(hierarchyRoot)
  }, [hierarchyRoot])

  const nodes = useMemo<MindMapHierarchyNode[]>(
    () => treeRoot.descendants().filter((node) => node.data.id !== ROOT_ID),
    [treeRoot],
  )

  const defaultPositions = useMemo(() => {
    const map: Record<string, NodePosition> = {}
    nodes.forEach((node) => {
      map[node.data.id] = { x: node.y, y: node.x }
    })
    return map
  }, [nodes])

  const parentMap = useMemo(() => {
    const map = new Map<string, string | null>()
    nodes.forEach((node) => {
      const parentId = node.parent?.data.id
      map.set(node.data.id, parentId && parentId !== ROOT_ID ? parentId : null)
    })
    return map
  }, [nodes])

  const descendantsMap = useMemo(() => buildDescendantsMap(treeRoot), [treeRoot])

  const rootPosition = useMemo<NodePosition>(() => ({ x: treeRoot.y, y: treeRoot.x }), [treeRoot])

  useEffect(() => {
    setPositions((previous) => {
      let changed = false
      const next: Record<string, NodePosition> = {}

      nodes.forEach((node) => {
        const id = node.data.id
        if (previous[id]) {
          next[id] = previous[id]
        } else {
          next[id] = defaultPositions[id]
          changed = true
        }
      })

      Object.keys(previous).forEach((id) => {
        if (!next[id]) {
          changed = true
        }
      })

      return changed ? next : previous
    })
  }, [nodes, defaultPositions])

  const displayNodes = useMemo<DisplayNode[]>(() => {
    return nodes.map((node) => {
      const fallback = defaultPositions[node.data.id]
      return {
        node,
        position: positions[node.data.id] ?? fallback,
      }
    })
  }, [nodes, defaultPositions, positions])

  const allPositions = useMemo(() => {
    const values = displayNodes.map((item) => item.position)
    values.push(rootPosition)
    return values
  }, [displayNodes, rootPosition])

  const { offsetX, offsetY, width, height } = useMemo(() => {
    if (allPositions.length === 0) {
      const fallback = 600
      return { offsetX: 200, offsetY: 200, width: fallback, height: fallback }
    }

    const minX = Math.min(...allPositions.map((point) => point.x))
    const maxX = Math.max(...allPositions.map((point) => point.x))
    const minY = Math.min(...allPositions.map((point) => point.y))
    const maxY = Math.max(...allPositions.map((point) => point.y))
    const marginX = 160
    const marginY = 160

    return {
      offsetX: marginX - minX,
      offsetY: marginY - minY,
      width: maxX - minX + marginX * 2,
      height: maxY - minY + marginY * 2,
    }
  }, [allPositions])

  const links = useMemo<MindMapLink[]>(() => {
    return nodes
      .map((node) => {
        if (!node.parent) return null
        const target = positions[node.data.id] ?? defaultPositions[node.data.id]
        const parentId = node.parent.data.id
        const parentPosition =
          parentId === ROOT_ID
            ? rootPosition
            : positions[parentId] ?? defaultPositions[parentId]

        return {
          id: `${parentId}-${node.data.id}`,
          source: parentPosition,
          target,
        }
      })
      .filter((value): value is { id: string; source: NodePosition; target: NodePosition } => Boolean(value))
  }, [nodes, positions, defaultPositions, rootPosition])

  const startEditing = (id: string, initialTitle: string) => {
    setEditingId(id)
    setDraftTitle(initialTitle)
  }

  const commitEditing = (id: string) => {
    if (editingId !== id) return
    const trimmed = draftTitle.trim()
    if (trimmed) {
      store.updateTitle(id, trimmed)
    }
    setEditingId(null)
    setDraftTitle('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setDraftTitle('')
  }

  const addChild = (id: string) => {
    const newId = store.addTodo(id, 'Новая задача')
    if (!newId) return
    setEditingId(newId)
    setDraftTitle('')
  }

  const addSibling = (id: string) => {
    const parentId = parentMap.get(id) ?? null
    const newId = store.addTodo(parentId, 'Новая задача')
    if (!newId) return
    setEditingId(newId)
    setDraftTitle('')
  }

  const makeRoot = (id: string) => {
    if (!store.canDrop(id, null)) return
    const targetIndex = store.getChildren(null).length
    store.moveTodo(id, null, targetIndex)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>, id: string) => {
    if ((event.target as HTMLElement).closest('button, input, textarea')) return
    if (event.button !== 0) return
    if (editingId === id) return

    event.preventDefault()
    dropTargetRef.current = null

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const pointerX = event.clientX - rect.left
    const pointerY = event.clientY - rect.top
    const baseOffsetX = offsetX
    const baseOffsetY = offsetY
    const current = positions[id] ?? defaultPositions[id]
    const nodeX = current.x + baseOffsetX
    const nodeY = current.y + baseOffsetY
    const deltaX = pointerX - nodeX
    const deltaY = pointerY - nodeY

    setDraggingId(id)

    const handleMove = (moveEvent: PointerEvent) => {
      const localX = moveEvent.clientX - rect.left
      const localY = moveEvent.clientY - rect.top
      const translatedX = localX - deltaX
      const translatedY = localY - deltaY
      const nextPosition: NodePosition = {
        x: translatedX - baseOffsetX,
        y: translatedY - baseOffsetY,
      }

      setPositions((previous) => {
        const next = { ...previous, [id]: nextPosition }
        const candidate = findNearestParent(
          id,
          next,
          defaultPositions,
          rootPosition,
          nodes,
          descendantsMap,
          store,
          nextPosition,
        )
        dropTargetRef.current = candidate
        setPotentialParent(candidate)
        return next
      })
    }

    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
      setDraggingId(null)
      const targetId = dropTargetRef.current
      dropTargetRef.current = null
      setPotentialParent(null)

      if (!targetId) return

      const parentId = targetId === ROOT_ID ? null : targetId
      if (!store.canDrop(id, parentId)) return

      const targetChildren = store.getChildren(parentId)
      const targetIndex = targetChildren.length
      store.moveTodo(id, parentId, targetIndex)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)
  }

  const toggleCompletion = (id: string) => {
    store.toggleTodo(id)
  }

  const deleteNode = (id: string) => {
    if (editingId === id) {
      cancelEditing()
    }
    store.deleteTodo(id)
  }

  const emptyState = filteredData.length === 0

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-700">Mind map</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Дважды кликните по задаче, чтобы отредактировать название. Tab добавляет вложенную задачу, Enter — задачу на том же
            уровне.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHideCompleted((value) => !value)}
          className="self-start rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-white"
        >
          {hideCompleted ? 'Показать выполненные' : 'Скрыть выполненные'}
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto rounded-3xl border border-slate-200/60 bg-white/80 shadow-inner"
        style={{
          minHeight: emptyState ? 420 : height + 80,
          minWidth: emptyState ? undefined : width + 80,
        }}
      >
        <svg
          className="pointer-events-none absolute inset-0"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {links.map((link) => {
            const source = {
              x: link.source.x + offsetX,
              y: link.source.y + offsetY,
            }
            const target = {
              x: link.target.x + offsetX,
              y: link.target.y + offsetY,
            }
            const path = linkGenerator({ id: link.id, source, target })
            if (!path) return null
            return <path key={link.id} d={path} className="stroke-slate-300 fill-none" strokeWidth={1.5} />
          })}
        </svg>

        {emptyState ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-sm text-slate-500">
            На этой вкладке появится майнд-карта по вашим задачам. Добавляйте новые элементы в списке задач или прямо здесь.
          </div>
        ) : (
          <>
            <div
              className={`pointer-events-none absolute flex items-center justify-center rounded-full border border-dashed border-slate-400/70 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 transition ${
                potentialParent === ROOT_ID ? 'border-emerald-500 text-emerald-600' : ''
              }`}
              style={{
                left: rootPosition.x + offsetX - NODE_CARD_WIDTH / 2,
                top: rootPosition.y + offsetY - NODE_CARD_HEIGHT / 2,
                width: NODE_CARD_WIDTH,
                height: NODE_CARD_HEIGHT,
              }}
            >
              Корневой уровень
            </div>

            {displayNodes.map(({ node, position }) => {
              const id = node.data.id
              const left = position.x + offsetX - NODE_CARD_WIDTH / 2
              const top = position.y + offsetY - NODE_CARD_HEIGHT / 2
              const isEditing = editingId === id
              const isPotential = potentialParent === id

              return (
                <div
                  key={id}
                  className="absolute"
                  style={{
                    left,
                    top,
                    width: NODE_CARD_WIDTH,
                    height: NODE_CARD_HEIGHT,
                    zIndex: draggingId === id ? 30 : 1,
                  }}
                >
                  <MindMapNodeCard
                    title={node.data.title}
                    completed={node.data.completed}
                    isEditing={isEditing}
                    isDragging={draggingId === id}
                    isPotentialParent={isPotential}
                    draftTitle={isEditing ? draftTitle : node.data.title}
                    onPointerDown={(event) => handlePointerDown(event, id)}
                    onStartEditing={() => startEditing(id, node.data.title)}
                    onDraftChange={(value) => setDraftTitle(value)}
                    onCommit={() => commitEditing(id)}
                    onCancel={cancelEditing}
                    onAddChild={() => {
                      commitEditing(id)
                      addChild(id)
                    }}
                    onAddSibling={() => {
                      commitEditing(id)
                      addSibling(id)
                    }}
                    onMakeRoot={() => makeRoot(id)}
                    onToggleCompleted={() => toggleCompletion(id)}
                    onDelete={() => deleteNode(id)}
                  />
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
})

interface MindMapNodeCardProps {
  title: string
  completed: boolean
  isEditing: boolean
  isDragging: boolean
  isPotentialParent: boolean
  draftTitle: string
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  onStartEditing: () => void
  onDraftChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
  onAddChild: () => void
  onAddSibling: () => void
  onMakeRoot: () => void
  onToggleCompleted: () => void
  onDelete: () => void
}

const MindMapNodeCard = ({
  completed,
  draftTitle,
  isDragging,
  isEditing,
  isPotentialParent,
  onAddChild,
  onAddSibling,
  onCancel,
  onCommit,
  onDelete,
  onDraftChange,
  onMakeRoot,
  onPointerDown,
  onStartEditing,
  onToggleCompleted,
  title,
}: MindMapNodeCardProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isEditing])

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      onCommit()
      onAddChild()
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onCommit()
      onAddSibling()
    }
  }

  return (
    <div
      onPointerDown={onPointerDown}
      className={`flex h-full cursor-grab flex-col justify-between rounded-2xl border bg-white/95 p-3 text-sm shadow-lg transition ${
        completed ? 'opacity-80' : ''
      } ${isDragging ? 'cursor-grabbing ring-2 ring-slate-400/70' : ''} ${
        isPotentialParent ? 'ring-2 ring-emerald-500' : 'ring-1 ring-slate-200/70'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onToggleCompleted()
          }}
          className="mt-0.5 text-slate-500 transition hover:text-emerald-600"
          aria-label={completed ? 'Снять отметку о выполнении' : 'Отметить выполненной'}
        >
          {completed ? <FiCheckSquare /> : <FiSquare />}
        </button>
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              value={draftTitle}
              onChange={(event) => onDraftChange(event.target.value)}
              onBlur={onCommit}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-slate-300/70 bg-white px-2 py-1 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onStartEditing()
              }}
              onDoubleClick={(event) => {
                event.stopPropagation()
                onStartEditing()
              }}
              className="w-full text-left font-medium text-slate-700 transition hover:text-emerald-600"
            >
              {title}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onStartEditing()
            }}
            className="flex items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            <FiEdit2 />
            <span>Править</span>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onAddChild()
            }}
            className="rounded-lg px-2 py-1 transition hover:bg-emerald-50 hover:text-emerald-600"
            title="Добавить подзадачу (Tab)"
          >
            <FiCornerDownRight />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onAddSibling()
            }}
            className="rounded-lg px-2 py-1 transition hover:bg-emerald-50 hover:text-emerald-600"
            title="Добавить на том же уровне (Enter)"
          >
            <FiPlus />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onMakeRoot()
            }}
            className="rounded-lg px-2 py-1 transition hover:bg-emerald-50 hover:text-emerald-600"
            title="Переместить на верхний уровень"
          >
            <FiArrowUpLeft />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
            className="rounded-lg px-2 py-1 transition hover:bg-rose-50 hover:text-rose-600"
            title="Удалить"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  )
}

function buildMindMapData(nodes: TodoNode[], hideCompleted: boolean): MindMapDatum[] {
  return nodes
    .map((node) => mapTodoToDatum(node, hideCompleted))
    .filter((result) => result.visible)
    .map((result) => result.datum)
}

function mapTodoToDatum(node: TodoNode, hideCompleted: boolean): BuildResult {
  const childResults = node.children.map((child) => mapTodoToDatum(child, hideCompleted))

  const children = childResults.filter((child) => child.visible).map((child) => child.datum)
  const allChildrenCompleted =
    childResults.length > 0 && childResults.every((child) => child.fullyCompleted)
  const fullyCompleted = node.completed || allChildrenCompleted
  const visible = !(hideCompleted && fullyCompleted)

  return {
    datum: {
      id: node.id,
      title: node.title,
      completed: node.completed,
      children,
    },
    fullyCompleted,
    visible,
  }
}

function buildDescendantsMap(root: MindMapHierarchyNode): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()

  root.descendants().forEach((node) => {
    const id = node.data.id
    const set = new Set<string>()
    node.descendants().forEach((descendant) => {
      if (descendant === node) return
      set.add(descendant.data.id)
    })
    map.set(id, set)
  })

  return map
}

function findNearestParent(
  nodeId: string,
  positions: Record<string, NodePosition>,
  defaultPositions: Record<string, NodePosition>,
  rootPosition: NodePosition,
  nodes: d3.HierarchyPointNode<MindMapDatum>[],
  descendantsMap: Map<string, Set<string>>,
  store: TodoStore,
  currentPosition: NodePosition,
): string | null {
  const forbidden = descendantsMap.get(nodeId) ?? new Set<string>()
  let candidate: string | null = null
  let candidateDistance = Number.POSITIVE_INFINITY

  const consider = (id: string, position: NodePosition) => {
    if (id === nodeId) return
    if (forbidden.has(id)) return

    const dx = position.x - currentPosition.x
    const dy = position.y - currentPosition.y
    const distance = Math.hypot(dx, dy)

    if (distance >= DROP_DISTANCE) return
    if (distance >= candidateDistance) return

    const parentId = id === ROOT_ID ? null : id
    if (!store.canDrop(nodeId, parentId)) return

    candidate = id
    candidateDistance = distance
  }

  nodes.forEach((node) => {
    const id = node.data.id
    const position = positions[id] ?? defaultPositions[id]
    consider(id, position)
  })

  consider(ROOT_ID, rootPosition)

  return candidate
}

