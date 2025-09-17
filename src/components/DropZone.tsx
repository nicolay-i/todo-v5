import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useState, type DragEvent } from 'react';
import { useTodoStore } from '../store/TodoStoreContext';

interface DropZoneProps {
  parentId: string | null;
  index: number;
  className?: string;
}

export const DropZone = observer(({ parentId, index, className }: DropZoneProps) => {
  const store = useTodoStore();
  const [isActive, setIsActive] = useState(false);

  const canDrop = store.draggingId ? store.canMove(store.draggingId, parentId) : false;

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!store.draggingId || !store.canMove(store.draggingId, parentId)) {
      setIsActive(false);
      return;
    }

    event.preventDefault();
    if (!isActive) {
      setIsActive(true);
    }
  };

  const handleDragLeave = () => {
    setIsActive(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { draggingId } = store;
    setIsActive(false);

    if (!draggingId || !store.canMove(draggingId, parentId)) {
      return;
    }

    store.moveItem(draggingId, parentId, index);
    store.endDragging();
  };

  return (
    <div
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'my-1 h-3 rounded border border-dashed border-transparent transition-all duration-150',
        store.draggingId ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        canDrop && 'opacity-100',
        isActive && 'border-slate-300 bg-slate-100',
        className,
      )}
    />
  );
});
