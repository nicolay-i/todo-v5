import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTodoStore } from '../stores/TodoStoreContext'

interface PinnedDropZoneProps {
  listId: string
  index: number
}

const PinnedDropZoneComponent = ({ listId, index }: PinnedDropZoneProps) => {
  const store = useTodoStore()
  const [isOver, setIsOver] = useState(false)

  const draggedId = store.draggedId
  const canAccept = draggedId !== null && store.isPinned(draggedId)
  const showPlaceholder = canAccept

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

  return (
    <div className="py-0">
      <div
        className={[
          'rounded border border-dashed transition-all duration-150 ease-out',
          showPlaceholder ? 'my-2 h-2 opacity-100' : 'my-0 h-0 opacity-0',
          canAccept ? 'border-amber-300 bg-amber-200/40' : 'border-transparent bg-transparent',
          isOver && canAccept ? 'border-amber-400 bg-amber-200/70' : '',
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
