import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTodoStore } from '../stores/TodoStoreContext'

interface PinnedDropZoneProps {
  listId: string
  index: number
  isListEmpty?: boolean
}

const PinnedDropZoneComponent = ({ listId, index, isListEmpty = false }: PinnedDropZoneProps) => {
  const store = useTodoStore()
  const [isOver, setIsOver] = useState(false)

  const draggedId = store.draggedId
  const canAccept = draggedId !== null && store.isPinned(draggedId)
  const shouldDisplay = canAccept || isListEmpty

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
    store.movePinnedTodo(draggedId, listId, index)
    store.clearDragged()
  }

  const heightClass = shouldDisplay ? 'h-10' : 'h-0'
  const marginClass = shouldDisplay ? 'my-2' : 'my-0'
  const opacityClass = shouldDisplay ? 'opacity-100' : 'opacity-0'
  const baseStyles = isListEmpty
    ? 'border-slate-200/80 bg-white/90'
    : canAccept
      ? 'border-amber-300 bg-amber-200/40'
      : 'border-transparent bg-transparent'
  const activeStyles = isOver && canAccept ? 'border-amber-400 bg-amber-200/70' : ''

  return (
    <div className="py-0">
      <div
        className={[
          'rounded border border-dashed transition-all duration-150 ease-out',
          heightClass,
          marginClass,
          opacityClass,
          baseStyles,
          activeStyles,
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-hidden
      />
    </div>
  )
}

export const PinnedDropZone = observer(PinnedDropZoneComponent)
