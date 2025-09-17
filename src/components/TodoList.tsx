import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { observer } from 'mobx-react-lite'
import type { TodoNode } from '../stores/TodoStore'
import { TodoItem } from './TodoItem'
import { AddTodoControl } from './AddTodoControl'
import { useTodoStore } from '../stores/TodoStoreContext'

interface TodoListProps {
  items: TodoNode[]
  level: number
  parentId?: string
}

export const TodoList = observer(({ items, level, parentId }: TodoListProps) => {
  const store = useTodoStore()

  if (items.length === 0) {
    return null
  }

  return (
    <div className={`${level === 1 ? 'space-y-3' : 'space-y-3 border-l border-slate-200 pl-4'}`}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3">
          {items.map((item) => (
            <TodoItem key={item.id} todo={item} parentId={parentId}>
              {item.children.length > 0 && (
                <div className="pt-1">
                  <TodoList items={item.children} level={level + 1} parentId={item.id} />
                </div>
              )}
              {store.canAddChild(item.id) && (
                <div className="pt-1">
                  <AddTodoControl parentId={item.id} level={level + 1} />
                </div>
              )}
            </TodoItem>
          ))}
        </ul>
      </SortableContext>
    </div>
  )
})
