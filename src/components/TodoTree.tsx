import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import type { TodoNode } from '../store/TodoStore';
import { useTodoStore } from '../store/TodoStoreContext';
import { DropZone } from './DropZone';
import { IconButton } from './IconButton';
import {
  CheckIcon,
  CircleIcon,
  CloseIcon,
  GripIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from './icons';

interface TodoTreeProps {
  parentId: string | null;
  items: TodoNode[];
  depth: number;
}

interface TodoNodeRowProps {
  item: TodoNode;
  depth: number;
  renderChildren: (parentId: string, items: TodoNode[], depth: number) => ReactNode;
}

function TodoNodeRow({ item, depth, renderChildren }: TodoNodeRowProps) {
  const store = useTodoStore();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(item.title);
  }, [item.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleToggle = useCallback(() => {
    store.toggleCompleted(item.id);
  }, [store, item.id]);

  const handleAddChild = useCallback(() => {
    store.addItem(item.id);
  }, [store, item.id]);

  const handleDelete = useCallback(() => {
    store.deleteItem(item.id);
  }, [store, item.id]);

  const handleStartEdit = useCallback(() => {
    setDraft(item.title);
    setIsEditing(true);
  }, [item.title]);

  const handleSave = useCallback(() => {
    store.updateTitle(item.id, draft);
    setIsEditing(false);
  }, [store, item.id, draft]);

  const handleCancel = useCallback(() => {
    setDraft(item.title);
    setIsEditing(false);
  }, [item.title]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSave();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.id);
      store.startDragging(item.id);
    },
    [store, item.id],
  );

  const handleDragEnd = useCallback(() => {
    store.endDragging();
  }, [store]);

  const canAddChild = store.canAddChild(item.id);
  const showChildren = canAddChild || item.children.length > 0;

  return (
    <div className="space-y-2">
      <div
        className={clsx(
          'group flex items-center gap-3 rounded-xl border border-transparent bg-white px-3 py-2 shadow-sm transition-all',
          'hover:border-slate-300',
          item.completed && 'border-slate-200 bg-slate-100/80 text-slate-400 line-through',
        )}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <button
          type="button"
          onClick={handleToggle}
          aria-label={item.completed ? 'Снять отметку' : 'Отметить выполненным'}
          className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition-colors',
            'bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50',
            item.completed && 'border-slate-300 bg-slate-200 text-slate-500',
          )}
        >
          {item.completed ? <CheckIcon size={16} /> : <CircleIcon size={16} />}
        </button>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <IconButton icon={<CheckIcon size={16} />} label="Сохранить" variant="primary" onClick={handleSave} />
              <IconButton icon={<CloseIcon size={16} />} label="Отменить" onClick={handleCancel} />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="w-full text-left text-sm font-medium text-slate-700 transition hover:text-slate-900"
            >
              {item.title}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {canAddChild && (
            <IconButton icon={<PlusIcon size={16} />} label="Добавить подзадачу" onClick={handleAddChild} />
          )}
          {!isEditing && (
            <IconButton icon={<PencilIcon size={16} />} label="Редактировать" onClick={handleStartEdit} />
          )}
          {!isEditing && (
            <IconButton icon={<TrashIcon size={16} />} label="Удалить" onClick={handleDelete} />
          )}
          <div className="ml-2 text-slate-300 transition group-hover:text-slate-500" aria-hidden="true">
            <GripIcon size={16} />
          </div>
        </div>
      </div>

      {showChildren && (
        <div className="border-l border-slate-100 pl-6">
          {renderChildren(item.id, item.children, depth + 1)}
        </div>
      )}
    </div>
  );
}

const ObservedTodoNodeRow = observer(TodoNodeRow);

function TodoTreeView({ parentId, items, depth }: TodoTreeProps) {
  const renderChildren = useCallback(
    (nextParentId: string, nextItems: TodoNode[], nextDepth: number) => (
      <TodoTree parentId={nextParentId} items={nextItems} depth={nextDepth} />
    ),
    [],
  );

  return (
    <div className={clsx('space-y-2', depth > 0 && 'pt-2')}>
      <DropZone parentId={parentId} index={0} />
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <ObservedTodoNodeRow item={item} depth={depth} renderChildren={renderChildren} />
          <DropZone parentId={parentId} index={index + 1} />
        </Fragment>
      ))}
    </div>
  );
}

export const TodoTree = observer(TodoTreeView);
