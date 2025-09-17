import { useState } from 'react'
import type { DragEventHandler } from 'react'
import { observer } from 'mobx-react-lite'
import { MAX_DEPTH } from '../../stores/TodoStore'
import { useTodoStore } from '../../stores/TodoStoreContext'

interface MindMapDropZoneProps {
  parentId: string | null
  depth: number
  index: number
}

const MindMapDropZoneComponent = ({ parentId, depth, index }: MindMapDropZoneProps) => {
  const store = useTodoStore()
  const [isOver, setIsOver] = useState(false)

  if (depth > MAX_DEPTH) {
    return null
  }

  const draggedId = store.draggedId
  const canAccept = draggedId !== null && store.canDrop(draggedId, parentId)
  const showPlaceholder = draggedId !== null && depth <= MAX_DEPTH

  const handleDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isOver) {
      setIsOver(true)
    }
  }

  const handleDragLeave: DragEventHandler<HTMLDivElement> = () => {
    if (isOver) {
      setIsOver(false)
    }
  }

  const handleDrop: DragEventHandler<HTMLDivElement> = (event) => {
    if (!canAccept || draggedId === null) return
    event.preventDefault()
    setIsOver(false)
    store.moveTodo(draggedId, parentId, index)
  }

  return (
    <div
      className={[
        'flex h-12 items-center justify-center transition-all duration-150',
        showPlaceholder ? 'w-24' : 'w-0',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-10 w-24 items-center justify-center rounded-2xl border border-dashed text-xs font-medium transition-all duration-150',
          showPlaceholder ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0',
          canAccept ? 'border-indigo-300 bg-indigo-100/60 text-indigo-500' : 'border-transparent bg-transparent text-transparent',
          isOver && canAccept ? 'border-indigo-400 bg-indigo-100 text-indigo-600' : '',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-hidden={!showPlaceholder}
      >
        Перетащите сюда
      </div>
    </div>
  )
}

export const MindMapDropZone = observer(MindMapDropZoneComponent)
