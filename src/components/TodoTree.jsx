import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { observer } from 'mobx-react-lite';
import {
  Check,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import AddTodoForm from './AddTodoForm';
import { MAX_DEPTH } from '../stores/TodoStore';

const ROOT_CONTAINER = 'root';

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const getContainerId = (parentId) =>
  parentId ? `container-${parentId}` : `container-${ROOT_CONTAINER}`;

const parseParentId = (containerId) => {
  if (!containerId) {
    return null;
  }
  if (!containerId.startsWith('container-')) {
    return null;
  }
  const raw = containerId.replace('container-', '');
  return raw === ROOT_CONTAINER ? null : raw;
};

const IconButton = (props) => {
  const {
    icon: IconComponent,
    label,
    variant = 'ghost',
    className = '',
    disabled = false,
    ...rest
  } = props;
  const styles = {
    ghost:
      'text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:ring-slate-200',
    primary:
      'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-emerald-200',
    danger:
      'text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-200',
    confirm:
      'text-emerald-600 hover:bg-emerald-50 focus-visible:ring-emerald-200',
    cancel:
      'text-rose-500 hover:bg-rose-50 focus-visible:ring-rose-200',
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={classNames(
        'rounded-full p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        styles[variant],
        disabled && 'pointer-events-none opacity-30',
        className,
      )}
      {...rest}
    >
      <IconComponent className="h-4 w-4" />
    </button>
  );
};

const DragPreview = ({ item }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
    <GripVertical className="h-4 w-4 text-slate-300" />
    <span
      className={classNames(
        'text-sm font-medium text-slate-700',
        item.completed && 'text-slate-400 line-through',
      )}
    >
      {item.title}
    </span>
  </div>
);

const TodoTree = observer(({ store, addingFor, onRequestAdd, onAddSubmit, onAddCancel }) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const activeItem = useMemo(
    () => (activeId ? store.findById(activeId) : null),
    [activeId, store],
  );

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) {
      return;
    }

    if (over.id === active.id) {
      return;
    }

    const overData = over.data?.current;

    let targetParentId = null;
    let targetIndex = 0;

    if (overData?.type === 'container') {
      targetParentId = overData.parentId ?? null;
      const children = store.getChildren(targetParentId);
      targetIndex = children.length;
    } else if (overData?.sortable) {
      targetParentId = parseParentId(overData.sortable.containerId);
      targetIndex = overData.sortable.index ?? 0;
    } else {
      return;
    }

    store.moveTodo(active.id, targetParentId, targetIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <TodoList
        store={store}
        parentId={null}
        parentDepth={0}
        addingFor={addingFor}
        onRequestAdd={onRequestAdd}
        onAddSubmit={onAddSubmit}
        onAddCancel={onAddCancel}
      />
      <DragOverlay dropAnimation={null}>
        {activeItem ? <DragPreview item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
});

const TodoList = observer(
  ({
    store,
    parentId,
    parentDepth,
    addingFor,
    onRequestAdd,
    onAddSubmit,
    onAddCancel,
  }) => {
    const items = store.getChildren(parentId);
    const containerId = getContainerId(parentId);

    const { setNodeRef, isOver } = useDroppable({
      id: containerId,
      data: {
        type: 'container',
        parentId,
        depth: parentDepth,
      },
    });

    const isAddingHere = addingFor?.parentId === parentId;

    return (
      <SortableContext
        id={containerId}
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={classNames(
            'space-y-2 rounded-2xl px-1 py-1 transition-colors',
            parentDepth > 0 && 'ml-6 border-l border-slate-200 pl-4',
            isOver && 'bg-blue-50/70 ring-1 ring-blue-200',
          )}
        >
          {items.map((item) => (
            <TodoItem
              key={item.id}
              item={item}
              store={store}
              parentId={parentId}
              depth={parentDepth + 1}
              addingFor={addingFor}
              onRequestAdd={onRequestAdd}
              onAddSubmit={onAddSubmit}
              onAddCancel={onAddCancel}
            />
          ))}
          {isAddingHere && store.canAddChild(parentId) && (
            <AddTodoForm
              onSubmit={(value) => onAddSubmit(parentId ?? null, value)}
              onCancel={onAddCancel}
            />
          )}
          {items.length === 0 && !isAddingHere && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center text-sm text-slate-400">
              {parentDepth === 0
                ? 'Здесь пока пусто. Добавьте задачу или перетащите её из другого уровня.'
                : 'Добавьте подзадачу или перетащите её сюда.'}
            </div>
          )}
        </div>
      </SortableContext>
    );
  },
);

const TodoItem = observer(
  ({
    item,
    store,
    parentId,
    depth,
    addingFor,
    onRequestAdd,
    onAddSubmit,
    onAddCancel,
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(item.title);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({
        id: item.id,
        data: {
          type: 'item',
          parentId,
          depth,
        },
      });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    useEffect(() => {
      if (!isEditing) {
        setDraft(item.title);
      }
    }, [item.title, isEditing]);

    const canAddChild = store.canAddChild(item.id);

    const handleEditSubmit = (event) => {
      event.preventDefault();
      const trimmed = draft.trim();
      if (!trimmed) {
        setDraft(item.title);
        setIsEditing(false);
        return;
      }
      store.renameTodo(item.id, trimmed);
      setIsEditing(false);
    };

    const handleCancelEdit = () => {
      setDraft(item.title);
      setIsEditing(false);
    };

    const toggleComplete = () => {
      store.toggleTodo(item.id);
    };

    const handleDelete = () => {
      store.deleteTodo(item.id);
      if (addingFor?.parentId === item.id) {
        onAddCancel();
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={classNames(
          'rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow',
          isDragging && 'z-50 border-blue-300 shadow-xl',
        )}
      >
        <div className="flex items-start gap-3 px-3 py-3">
          <IconButton
            icon={GripVertical}
            label="Переместить"
            className="mt-1 cursor-grab"
            {...attributes}
            {...listeners}
          />
          <input
            type="checkbox"
            checked={item.completed}
            onChange={toggleComplete}
            className="mt-1 h-4 w-4 cursor-pointer accent-emerald-500"
          />
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <div className="flex items-center gap-1">
                  <IconButton icon={Check} label="Сохранить" variant="confirm" type="submit" />
                  <IconButton
                    icon={X}
                    label="Отменить"
                    variant="cancel"
                    onClick={handleCancelEdit}
                  />
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={classNames(
                    'text-sm font-medium text-slate-800',
                    item.completed && 'text-slate-400 line-through',
                  )}
                >
                  {item.title}
                </span>
                {item.children.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    {item.children.length}
                  </span>
                )}
                {depth >= MAX_DEPTH && (
                  <span className="text-xs uppercase tracking-wide text-slate-300">макс. уровень</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              icon={Plus}
              label="Добавить подзадачу"
              disabled={!canAddChild}
              onClick={() => onRequestAdd(item.id)}
              variant="primary"
            />
            <IconButton
              icon={Pencil}
              label="Редактировать"
              onClick={() => {
                setDraft(item.title);
                setIsEditing(true);
              }}
            />
            <IconButton icon={Trash2} label="Удалить" variant="danger" onClick={handleDelete} />
          </div>
        </div>
        {item.children.length > 0 || (addingFor?.parentId === item.id && store.canAddChild(item.id)) ? (
          <div className="pb-3">
            <TodoList
              store={store}
              parentId={item.id}
              parentDepth={depth}
              addingFor={addingFor}
              onRequestAdd={onRequestAdd}
              onAddSubmit={onAddSubmit}
              onAddCancel={onAddCancel}
            />
          </div>
        ) : null}
      </div>
    );
  },
);

export default TodoTree;
