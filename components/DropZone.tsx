'use client'

import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { MAX_DEPTH } from '@/stores/TodoStore'
import { useTodoStore } from '@/stores/TodoStoreContext'

interface DropZoneProps {
  parentId: string | null
  depth: number
  index: number
}

const DropZoneComponent = ({ parentId, depth, index }: DropZoneProps) => {
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

  const heightClass = showPlaceholder ? 'h-2' : 'h-0'
  const marginClass = showPlaceholder ? 'my-1' : 'my-0'

  return (
    <div className="py-0">
      <div
        className={[
          'rounded border border-dashed transition-all duration-150 ease-out',
          heightClass,
          marginClass,
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

export const DropZone = observer(DropZoneComponent)
