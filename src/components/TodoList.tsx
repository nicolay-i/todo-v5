import { observer } from 'mobx-react-lite'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { TodoItem as TodoModel } from '../stores/TodoStore'
import { TodoItem } from './TodoItem'

type TodoListProps = {
  todos: TodoModel[]
  parentId: string | null
  depth: number
}

export const TodoList = observer(({ todos, parentId, depth }: TodoListProps) => {
  const ids = todos.map((todo) => todo.id)

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <ul className="space-y-3">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} parentId={parentId} depth={depth} />
        ))}
      </ul>
    </SortableContext>
  )
})
