import { useState } from 'react'
import type { DragEvent } from 'react'
import { observer } from 'mobx-react-lite'
import { hierarchy, tree } from 'd3-hierarchy'
import type { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy'
import {
  FiCheckSquare,
  FiEdit2,
  FiPlus,
  FiSquare,
  FiTrash2,
} from 'react-icons/fi'
import { useTodoStore } from '../stores/TodoStoreContext'
import type { TodoNode } from '../stores/TodoStore'

const NODE_WIDTH = 220
const NODE_HEIGHT = 72
const HORIZONTAL_STEP = 160
const VERTICAL_STEP = 36
const BRANCH_SPACING = 48
const CENTER_NODE_ID = 'mindmap-root'

type DropPreview = {
  id: string
  type: 'before' | 'after' | 'child'
}

type MindMapDataNode = {
  id: string
  title: string
  completed: boolean
  children: MindMapDataNode[]
}

type LayoutNode = {
  id: string
  data: MindMapDataNode | null
  x: number
  y: number
  depth: number
  parentId: string | null
  isCenter?: boolean
}

type LayoutLink = {
  sourceId: string
  targetId: string
}

function buildMindMapNode(node: TodoNode, hideCompleted: boolean): MindMapDataNode | null {
  const children: MindMapDataNode[] = []

  for (const child of node.children) {
    const mapped = buildMindMapNode(child, hideCompleted)
    if (mapped) {
      children.push(mapped)
    }
  }

  const shouldHide =
    hideCompleted &&
    ((node.completed && children.length === 0) ||
      (!node.completed && node.children.length > 0 && children.length === 0))

  if (shouldHide) {
    return null
  }

  return {
    id: node.id,
    title: node.title,
    completed: node.completed,
    children,
  }
}

function buildMindMapData(todos: TodoNode[], hideCompleted: boolean): MindMapDataNode[] {
  const result: MindMapDataNode[] = []
  for (const todo of todos) {
    const mapped = buildMindMapNode(todo, hideCompleted)
    if (mapped) {
      result.push(mapped)
    }
  }
  return result
}

function createLayout(nodes: MindMapDataNode[]): { nodes: LayoutNode[]; links: LayoutLink[] } {
  const layoutNodes: LayoutNode[] = []
  const links: LayoutLink[] = []

  const centerNode: LayoutNode = {
    id: CENTER_NODE_ID,
    data: null,
    x: 0,
    y: 0,
    depth: 0,
    parentId: null,
    isCenter: true,
  }

  layoutNodes.push(centerNode)

  let rightOffset = 0
  let leftOffset = 0

  nodes.forEach((branch, index) => {
    const direction = index % 2 === 0 ? 1 : -1
    const branchHierarchy = hierarchy<MindMapDataNode>(branch, (child) => child.children)
    const branchTree = tree<MindMapDataNode>().nodeSize([NODE_HEIGHT + VERTICAL_STEP, HORIZONTAL_STEP])
    const treeRoot = branchTree(branchHierarchy)

    const descendants: HierarchyPointNode<MindMapDataNode>[] = treeRoot.descendants()
    const minX = Math.min(...descendants.map((node) => node.x))
    const maxX = Math.max(...descendants.map((node) => node.x))
    const branchHeight = maxX - minX

    const verticalShift = (direction === 1 ? rightOffset : leftOffset) - minX

    descendants.forEach((descendant) => {
      const layoutNode: LayoutNode = {
        id: descendant.data.id,
        data: descendant.data,
        depth: descendant.depth + 1,
        parentId: descendant.parent ? descendant.parent.data.id : CENTER_NODE_ID,
        x: descendant.x + verticalShift,
        y: direction * (descendant.depth + 1) * (NODE_WIDTH + HORIZONTAL_STEP * 0.5),
      }

      layoutNodes.push(layoutNode)
    })

    treeRoot.links().forEach((link: HierarchyPointLink<MindMapDataNode>) => {
      links.push({ sourceId: link.source.data.id, targetId: link.target.data.id })
    })

    links.push({ sourceId: CENTER_NODE_ID, targetId: branch.id })

    if (direction === 1) {
      rightOffset += branchHeight + NODE_HEIGHT + BRANCH_SPACING
    } else {
      leftOffset += branchHeight + NODE_HEIGHT + BRANCH_SPACING
    }
  })

  return { nodes: layoutNodes, links }
}

function getDropType(event: DragEvent<HTMLElement>): DropPreview['type'] {
  const element = event.currentTarget as HTMLElement
  const rect = element.getBoundingClientRect()
  const relativeY = event.clientY - rect.top

  if (relativeY < rect.height * 0.3) {
    return 'before'
  }

  if (relativeY > rect.height * 0.7) {
    return 'after'
  }

  return 'child'
}

export const MindMapView = observer(() => {
  const store = useTodoStore()
  const [hideCompleted, setHideCompleted] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null)

  const rawTodos = store.todos
  const mindMapData = buildMindMapData(rawTodos, hideCompleted)
  const { nodes, links } = createLayout(mindMapData)

  const positionMap = new Map<string, LayoutNode>()
  nodes.forEach((node) => {
    positionMap.set(node.id, node)
  })

  const xs = nodes.map((node) => node.x)
  const ys = nodes.map((node) => node.y)

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const padding = 120
  const width = Math.max(600, maxY - minY + NODE_WIDTH + padding)
  const height = Math.max(400, maxX - minX + NODE_HEIGHT + padding)
  const offsetX = padding / 2 - minY
  const offsetY = padding / 2 - minX

  const handleAddRoot = () => {
    const title = window.prompt('Название новой задачи')
    if (!title) return
    store.addTodo(null, title)
  }

  const handleAddChild = (id: string) => {
    const title = window.prompt('Название подзадачи')
    if (!title) return
    store.addTodo(id, title)
  }

  const handleRename = (node: MindMapDataNode) => {
    const title = window.prompt('Изменить название', node.title)
    if (!title) return
    store.updateTitle(node.id, title)
  }

  const handleToggleComplete = (id: string) => {
    store.toggleTodo(id)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить задачу вместе с подпунктами?')) return
    store.deleteTodo(id)
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.stopPropagation()
    event.dataTransfer.setData('text/plain', id)
    event.dataTransfer.effectAllowed = 'move'
    setDraggingId(id)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDropPreview(null)
  }

  const handleDragOverNode = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'

    if (id === CENTER_NODE_ID) {
      setDropPreview({ id, type: 'child' })
      return
    }

    const type = getDropType(event)
    setDropPreview({ id, type })
  }

  const handleDropOnNode = (event: DragEvent<HTMLDivElement>, id: string) => {
    event.preventDefault()
    event.stopPropagation()
    setDropPreview(null)

    const draggedId = event.dataTransfer.getData('text/plain')
    if (!draggedId || draggedId === id) return

    if (id === CENTER_NODE_ID) {
      store.moveTodo(draggedId, null, store.todos.length)
      return
    }

    const targetInfo = store.getTodoInfo(id)
    if (!targetInfo) return

    const type = dropPreview?.id === id ? dropPreview.type : getDropType(event)

    if (type === 'child') {
      store.moveTodo(draggedId, id, targetInfo.node.children.length)
      return
    }

    const parentId = targetInfo.parent ? targetInfo.parent.id : null
    const index = type === 'before' ? targetInfo.index : targetInfo.index + 1
    store.moveTodo(draggedId, parentId, index)
  }

  const hasVisibleTodos = mindMapData.length > 0

  const renderNodeContent = (layoutNode: LayoutNode) => {
    if (layoutNode.isCenter) {
      return (
        <div
          className="flex h-full flex-col items-center justify-center gap-3 text-sm"
          onDragOver={(event) => handleDragOverNode(event, CENTER_NODE_ID)}
          onDrop={(event) => handleDropOnNode(event, CENTER_NODE_ID)}
        >
          <div className="rounded-full bg-slate-900 px-5 py-2 text-white shadow-lg">Mind map</div>
          <button
            type="button"
            onClick={handleAddRoot}
            className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-600"
          >
            <FiPlus /> Добавить задачу
          </button>
        </div>
      )
    }

    if (!layoutNode.data) return null

    const { data } = layoutNode
    const isDragging = draggingId === data.id
    const isDropTarget = dropPreview?.id === data.id

    const dropHighlightClass = !isDropTarget
      ? ''
      : dropPreview?.type === 'child'
        ? 'ring-2 ring-emerald-400'
        : 'ring-2 ring-amber-400'

    return (
      <div
        draggable
        onDragStart={(event) => handleDragStart(event, data.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(event) => handleDragOverNode(event, data.id)}
        onDrop={(event) => handleDropOnNode(event, data.id)}
        className={`flex h-full flex-col justify-between rounded-2xl bg-white/95 p-4 text-sm shadow-lg ring-1 ring-slate-200 transition ${
          isDragging ? 'opacity-60' : ''
        } ${dropHighlightClass}`}
      >
        <div className="font-medium text-slate-700">
          <p className={data.completed ? 'text-slate-400 line-through' : undefined}>{data.title}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => handleToggleComplete(data.id)}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1.5 font-medium text-slate-600 transition hover:bg-slate-200"
          >
            {data.completed ? <FiCheckSquare /> : <FiSquare />} {data.completed ? 'Снять отметку' : 'Выполнено'}
          </button>
          <button
            type="button"
            onClick={() => handleAddChild(data.id)}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1.5 font-medium text-emerald-600 transition hover:bg-emerald-200"
          >
            <FiPlus /> Подпункт
          </button>
          <button
            type="button"
            onClick={() => handleRename(data)}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1.5 font-medium text-indigo-600 transition hover:bg-indigo-200"
          >
            <FiEdit2 /> Переименовать
          </button>
          <button
            type="button"
            onClick={() => handleDelete(data.id)}
            className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1.5 font-medium text-rose-600 transition hover:bg-rose-200"
          >
            <FiTrash2 /> Удалить
          </button>
        </div>
      </div>
    )
  }

  const renderedLinks = links
    .map((link) => {
      const source = positionMap.get(link.sourceId)
      const target = positionMap.get(link.targetId)
      if (!source || !target) return null

      const sx = source.y + offsetX
      const sy = source.x + offsetY
      const tx = target.y + offsetX
      const ty = target.x + offsetY
      const mx = (sx + tx) / 2

      return <path key={`${link.sourceId}-${link.targetId}`} d={`M${sx},${sy}C${mx},${sy} ${mx},${ty} ${tx},${ty}`} className="stroke-slate-300" fill="none" strokeWidth={2} />
    })
    .filter(Boolean)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(event) => setHideCompleted(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          Скрывать выполненные подпункты
        </label>
      </div>

      <div className="relative flex-1 overflow-auto rounded-3xl bg-gradient-to-br from-white/90 via-white to-slate-50 p-6 ring-1 ring-slate-200">
        <svg width={width} height={height} className="block" style={{ minWidth: '100%', minHeight: '480px' }}>
          <g>{renderedLinks}</g>
          {nodes.map((node) => {
            const x = node.y + offsetX - NODE_WIDTH / 2
            const y = node.x + offsetY - NODE_HEIGHT / 2

            return (
              <foreignObject key={node.id} x={x} y={y} width={NODE_WIDTH} height={NODE_HEIGHT}>
                {renderNodeContent(node)}
              </foreignObject>
            )
          })}
        </svg>

        {!hasVisibleTodos && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Добавьте задачи, чтобы увидеть их на карте.
          </div>
        )}
      </div>
    </div>
  )
})
