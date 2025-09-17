import type { CSSProperties } from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { MAX_DEPTH } from '../stores/TodoStore'
import { useTodoStore } from '../stores/TodoStoreContext'

interface MindMapDropZoneProps {
  parentId: string | null
  depth: number
  index: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap: Record<NonNullable<MindMapDropZoneProps['size']>, { width: number; height: number }> = {
  sm: { width: 56, height: 32 },
  md: { width: 80, height: 40 },
  lg: { width: 112, height: 48 },
}

const MindMapDropZoneComponent = ({ parentId, depth, index, size = 'md' }: MindMapDropZoneProps) => {
  const store = useTodoStore()
  const [isOver, setIsOver] = useState(false)

  if (depth > MAX_DEPTH) {
    return null
  }

  const draggedId = store.draggedId
  const canAccept = draggedId !== null && store.canDrop(draggedId, parentId)
  const shouldRender = draggedId !== null && depth <= MAX_DEPTH

  const baseSize = sizeMap[size]
  const style: CSSProperties = shouldRender
    ? {
        width: `${baseSize.width}px`,
        height: `${baseSize.height}px`,
        marginLeft: '12px',
        marginRight: '12px',
        pointerEvents: 'auto',
      }
    : {
        width: 0,
        height: 0,
        marginLeft: 0,
        marginRight: 0,
        pointerEvents: 'none',
      }

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept) {
      return
    }

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
    if (!canAccept || draggedId === null) {
      return
    }

    event.preventDefault()
    setIsOver(false)
    store.moveTodo(draggedId, parentId, index)
  }

  const ringClasses = [
    'flex h-full w-full items-center justify-center rounded-full border border-dashed transition-colors duration-150',
    canAccept ? 'border-emerald-400 bg-emerald-200/40' : 'border-slate-200 bg-white/70',
    isOver && canAccept ? 'border-emerald-500 bg-emerald-200/70' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className="flex items-center justify-center transition-all duration-150 ease-out"
      style={style}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-hidden
    >
      {shouldRender && (
        <div className={ringClasses}>
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
      )}
    </div>
  )
}

export const MindMapDropZone = observer(MindMapDropZoneComponent)
