import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTodoStore } from '../stores/TodoStoreContext'

interface PinnedDropZoneProps {
  index: number
}

const PinnedDropZoneComponent = ({ index }: PinnedDropZoneProps) => {
  const store = useTodoStore()
  const [isOver, setIsOver] = useState(false)

  const draggedId = store.draggedId
  const isPinnedItem = draggedId !== null && store.isPinned(draggedId)
  const canAccept = isPinnedItem

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
    store.movePinned(draggedId, index)
  }

  const heightClass = canAccept ? 'h-2' : 'h-0'
  const marginClass = canAccept ? 'my-1' : 'my-0'

  return (
    <div className="py-0">
      <div
        className={[
          'rounded border border-dashed transition-all duration-150 ease-out',
          heightClass,
          marginClass,
          canAccept ? 'opacity-100 border-slate-300 bg-slate-200/60' : 'opacity-0 border-transparent bg-transparent',
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

export const PinnedDropZone = observer(PinnedDropZoneComponent)
