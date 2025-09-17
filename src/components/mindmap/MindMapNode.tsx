import { Fragment, useEffect, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiEdit2,
  FiPlus,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { MAX_DEPTH } from '../../stores/TodoStore'
import { useTodoStore } from '../../stores/TodoStoreContext'
import { MindMapDropZone } from './MindMapDropZone'
import type { MindMapBranch } from './tree'

interface MindMapNodeProps {
  branch: MindMapBranch
  depth: number
}

const actionButtonStyles =
  'rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none'

const MindMapNodeComponent = ({ branch, depth }: MindMapNodeProps) => {
  const { node, children } = branch
  const store = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [titleDraft, setTitleDraft] = useState(node.title)
  const [childTitle, setChildTitle] = useState('')

  const canAddChild = depth < MAX_DEPTH
  const isDragging = store.draggedId === node.id
  const hasVisibleChildren = children.length > 0
  const showChildrenArea = hasVisibleChildren || (canAddChild && store.draggedId !== null)

  useEffect(() => {
    setTitleDraft(node.title)
  }, [node.title])

  const handleToggle = () => {
    store.toggleTodo(node.id)
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

  const handleTogglePinned = () => {
    store.togglePinned(node.id)
  }

  const handleDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (isEditing || isAddingChild) return
    store.setDragged(node.id)
    event.dataTransfer.setData('text/plain', node.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd: React.DragEventHandler<HTMLDivElement> = () => {
    store.clearDragged()
  }

  const titleStyles = useMemo(
    () =>
      [
        'text-base font-medium leading-snug transition-colors',
        node.completed ? 'text-slate-400 line-through' : 'text-slate-700',
      ].join(' '),
    [node.completed],
  )

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={[
          'group relative flex min-w-[220px] max-w-xs flex-col rounded-2xl border border-slate-200 bg-white/95 p-4 text-left shadow-sm ring-1 ring-white/70 transition-all duration-200',
          isDragging ? 'opacity-60 ring-2 ring-indigo-200' : 'hover:shadow-md',
        ].join(' ')}
        draggable={!isEditing && !isAddingChild}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`${actionButtonStyles} -ml-1.5 text-xl text-slate-500`}
            aria-label={node.completed ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          >
            {node.completed ? <FiCheckCircle /> : <FiCircle />}
          </button>

          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-slate-400 focus:outline-none"
                  autoFocus
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setTitleDraft(node.title)
                      setIsEditing(false)
                    }
                  }}
                  placeholder="Название задачи"
                />
                <div className="flex items-center gap-1">
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
                    className={`${actionButtonStyles} hover:bg-slate-200`}
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
                <button
                  type="button"
                  onClick={handleTogglePinned}
                  className={[
                    actionButtonStyles,
                    node.pinned ? 'text-amber-500 hover:text-amber-500' : '',
                  ].join(' ')}
                  aria-label={node.pinned ? 'Открепить задачу' : 'Закрепить задачу'}
                  aria-pressed={node.pinned}
                >
                  <FiStar className={node.pinned ? 'text-amber-500' : undefined} />
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
          <form onSubmit={handleAddChild} className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <input
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

      {showChildrenArea && (
        <div className="flex flex-col items-center">
          <div className="h-6 w-px bg-slate-300" />
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            <MindMapDropZone parentId={node.id} depth={depth + 1} index={0} />
            {children.map((childBranch, childIndex) => (
              <Fragment key={childBranch.node.id}>
                <MindMapNode branch={childBranch} depth={depth + 1} />
                <MindMapDropZone parentId={node.id} depth={depth + 1} index={childIndex + 1} />
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const MindMapNode = observer(MindMapNodeComponent)
