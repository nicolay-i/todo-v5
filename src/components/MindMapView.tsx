import { Fragment, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { MAX_DEPTH, type TodoNode } from '../stores/TodoStore'
import { useTodoStore } from '../stores/TodoStoreContext'

interface MindMapBranch {
  node: TodoNode
  originalIndex: number
  children: MindMapBranch[]
}

interface MindMapNodeProps {
  branch: MindMapBranch
  depth: number
}

interface MindMapDropZoneProps {
  parentId: string | null
  depth: number
  index: number
  orientation?: 'horizontal' | 'vertical'
}

const buildMindMapBranches = (nodes: TodoNode[], hideCompleted: boolean): MindMapBranch[] => {
  const result: MindMapBranch[] = []

  nodes.forEach((node, index) => {
    const children = buildMindMapBranches(node.children, hideCompleted)
    const hasVisibleChildren = children.length > 0
    const allChildrenHidden = hideCompleted && node.children.length > 0 && !hasVisibleChildren
    const shouldHide = hideCompleted && (node.completed || allChildrenHidden)

    if (shouldHide) {
      return
    }

    result.push({
      node,
      originalIndex: index,
      children,
    })
  })

  return result
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const MindMapDropZoneComponent = ({
  parentId,
  depth,
  index,
  orientation = 'horizontal',
}: MindMapDropZoneProps) => {
  const store = useTodoStore()
  const [isOver, setIsOver] = useState(false)

  if (depth > MAX_DEPTH) return null

  const draggedId = store.draggedId
  const canAccept = draggedId !== null && store.canDrop(draggedId, parentId)
  const showPlaceholder = draggedId !== null && depth <= MAX_DEPTH

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

  const dimensionClass =
    orientation === 'horizontal' ? 'h-16 w-3 sm:h-20 sm:w-3' : 'h-3 w-16 sm:h-3 sm:w-20'
  const paddingClass = orientation === 'horizontal' ? 'px-1' : 'py-1'

  return (
    <div className={`flex items-center justify-center ${paddingClass}`}>
      <div
        className={[
          'rounded-full border border-dashed transition-all duration-150 ease-out',
          dimensionClass,
          showPlaceholder ? 'opacity-100' : 'opacity-0',
          canAccept ? 'border-slate-300 bg-slate-200/60' : 'border-transparent bg-transparent',
          isOver && canAccept ? 'border-slate-400 bg-slate-300' : '',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-hidden
      />
    </div>
  )
}

const MindMapNodeComponent = ({ branch, depth }: MindMapNodeProps) => {
  const store = useTodoStore()
  const { node, children } = branch

  const [isEditing, setIsEditing] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [titleDraft, setTitleDraft] = useState(node.title)
  const [childTitle, setChildTitle] = useState('')
  const [isChildTarget, setIsChildTarget] = useState(false)

  const canAddChild = depth < MAX_DEPTH
  const isDragging = store.draggedId === node.id
  const canAcceptChild = canAddChild && store.draggedId ? store.canDrop(store.draggedId, node.id) : false

  const titleStyles = useMemo(
    () =>
      [
        'text-sm font-medium leading-snug transition-colors',
        node.completed ? 'text-slate-400 line-through' : 'text-slate-700',
        'text-center',
      ].join(' '),
    [node.completed],
  )

  const handleToggle = () => {
    store.toggleTodo(node.id)
  }

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    store.setDragged(node.id)
    event.dataTransfer.setData('text/plain', node.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
    store.clearDragged()
    setIsChildTarget(false)
  }

  const handleNodeDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAcceptChild) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isChildTarget) {
      setIsChildTarget(true)
    }
  }

  const handleNodeDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    if (isChildTarget) {
      setIsChildTarget(false)
    }
  }

  const handleNodeDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAcceptChild || !store.draggedId) return
    event.preventDefault()
    store.moveTodo(store.draggedId, node.id, node.children.length)
    setIsChildTarget(false)
  }

  const handleEditSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.updateTitle(node.id, titleDraft)
    setIsEditing(false)
  }

  const handleAddChild: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    store.addTodo(node.id, childTitle)
    setChildTitle('')
    setIsAddingChild(false)
  }

  const handleDelete = () => {
    store.deleteTodo(node.id)
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          'group relative w-56 rounded-2xl bg-white/95 px-4 py-3 text-slate-700 shadow ring-1 ring-slate-200 transition-all duration-200',
          isDragging ? 'opacity-60 ring-2 ring-slate-300' : '',
          isChildTarget ? 'ring-2 ring-slate-400 shadow-md' : '',
        ].join(' ')}
        draggable={!isEditing && !isAddingChild}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleNodeDragOver}
        onDragLeave={handleNodeDragLeave}
        onDrop={handleNodeDrop}
      >
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className={`${actionButtonStyles} text-lg text-slate-500`}
            aria-label={node.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {node.completed ? <FiCheckCircle /> : <FiCircle />}
          </button>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-2">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                  autoFocus
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setTitleDraft(node.title)
                      setIsEditing(false)
                    }
                  }}
                  placeholder="Название"
                />
                <div className="flex justify-center gap-1">
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
                      setTitleDraft(node.title)
                      setIsEditing(false)
                    }}
                    className={actionButtonStyles}
                    aria-label="Отменить редактирование"
                  >
                    <FiX />
                  </button>
                </div>
              </form>
            ) : (
              <p className={titleStyles}>{node.title}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                {canAddChild && (
                  <button
                    type="button"
                    onClick={() => setIsAddingChild((value) => !value)}
                    className={actionButtonStyles}
                    aria-label={isAddingChild ? 'Скрыть форму добавления подзадачи' : 'Добавить подзадачу'}
                  >
                    <FiPlus />
                  </button>
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

        {canAddChild && isAddingChild && (
          <form onSubmit={handleAddChild} className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-2">
            <input
              className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
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

      {children.length > 0 ? (
        <div className="relative mt-6 flex flex-wrap justify-center gap-6">
          <span className="pointer-events-none absolute left-1/2 top-[-24px] h-6 w-px -translate-x-1/2 bg-slate-300" aria-hidden />
          {children.map((childBranch, childIndex) => (
            <Fragment key={childBranch.node.id}>
              <MindMapDropZone
                parentId={node.id}
                depth={depth + 1}
                index={childBranch.originalIndex}
                orientation="horizontal"
              />
              <div className="relative flex flex-col items-center">
                <span className="pointer-events-none mb-4 h-6 w-px bg-slate-300" aria-hidden />
                <MindMapNode branch={childBranch} depth={depth + 1} />
              </div>
              {childIndex === children.length - 1 && (
                <MindMapDropZone
                  parentId={node.id}
                  depth={depth + 1}
                  index={childBranch.originalIndex + 1}
                  orientation="horizontal"
                />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <MindMapDropZone parentId={node.id} depth={depth + 1} index={0} orientation="horizontal" />
        </div>
      )}
    </div>
  )
}

const MindMapNode = observer(MindMapNodeComponent)

const MindMapDropZone = observer(MindMapDropZoneComponent)

const MindMapViewComponent = () => {
  const store = useTodoStore()
  const [hideCompleted, setHideCompleted] = useState(false)

  const branches = buildMindMapBranches(store.todos, hideCompleted)

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            checked={hideCompleted}
            onChange={(event) => setHideCompleted(event.target.checked)}
          />
          Скрывать выполненные ветки
        </label>
      </div>

      <div className="relative flex-1 overflow-auto">
        {branches.length > 0 ? (
          <div className="mx-auto min-h-[24rem] max-w-full pb-10">
            <div className="flex flex-wrap justify-center gap-6">
              {branches.map((branch, index) => (
                <Fragment key={branch.node.id}>
                  <MindMapDropZone
                    parentId={null}
                    depth={0}
                    index={branch.originalIndex}
                    orientation="horizontal"
                  />
                  <MindMapNode branch={branch} depth={0} />
                  {index === branches.length - 1 && (
                    <MindMapDropZone
                      parentId={null}
                      depth={0}
                      index={branch.originalIndex + 1}
                      orientation="horizontal"
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-10 text-center text-sm text-slate-500">
            Все задачи, подходящие под условия фильтра, скрыты. Добавьте новую задачу или отключите фильтр, чтобы увидеть дерево.
          </div>
        )}
      </div>
    </div>
  )
}

export const MindMapView = observer(MindMapViewComponent)
