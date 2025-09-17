import { useState } from 'react'
import type { DragEvent } from 'react'
import { TodoStore } from '../stores/TodoStore'

interface DropZoneProps {
  parentId: string | null
  index: number
  draggedId: string | null
  store: TodoStore
  onDropComplete: () => void
  className?: string
}

export const DropZone = ({
  parentId,
  index,
  draggedId,
  store,
  onDropComplete,
  className = '',
}: DropZoneProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const canAccept = draggedId ? store.canDrop(draggedId, parentId) : false

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canAccept) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (!isHovered) setIsHovered(true)
  }

  const handleDragLeave = () => {
    if (isHovered) setIsHovered(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!draggedId || !canAccept) return
    event.preventDefault()
    event.stopPropagation()
    store.moveTodo(draggedId, parentId, index)
    setIsHovered(false)
    onDropComplete()
  }

  const baseClasses = canAccept ? 'opacity-60 bg-slate-300/40' : 'opacity-0'
  const activeClasses = isHovered ? 'bg-sky-400/70 opacity-100' : ''

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`my-1 h-3 w-full rounded-full transition-[background,opacity] ${className} ${baseClasses} ${activeClasses}`}
    />
  )
}
