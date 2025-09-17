import { makeAutoObservable } from 'mobx'

export const MAX_DEPTH = 3

export interface Todo {
  id: string
  title: string
  completed: boolean
  children: Todo[]
}

interface TodoInfo {
  todo: Todo
  parent: Todo | null
  index: number
  depth: number
}

const createId = () => Math.random().toString(36).slice(2, 10)

const createTodo = (title: string): Todo => ({
  id: createId(),
  title,
  completed: false,
  children: [],
})

const findTodoInfo = (
  list: Todo[],
  id: string,
  depth = 1,
  parent: Todo | null = null,
): TodoInfo | null => {
  for (let index = 0; index < list.length; index += 1) {
    const todo = list[index]
    if (todo.id === id) {
      return { todo, parent, index, depth }
    }

    const match = findTodoInfo(todo.children, id, depth + 1, todo)
    if (match) {
      return match
    }
  }
  return null
}

const containsTodo = (root: Todo, searchId: string): boolean => {
  for (const child of root.children) {
    if (child.id === searchId || containsTodo(child, searchId)) {
      return true
    }
  }
  return false
}

const getMaxDepth = (todo: Todo): number => {
  if (todo.children.length === 0) {
    return 1
  }
  return 1 + Math.max(...todo.children.map((child) => getMaxDepth(child)))
}

export class TodoStore {
  todos: Todo[] = []

  constructor() {
    makeAutoObservable(this)
    this.seed()
  }

  private seed() {
    this.todos = [
      {
        ...createTodo('Подготовить утренний обзор'),
        children: [
          createTodo('Собрать задачи команды'),
          createTodo('Сверстать презентацию'),
        ],
      },
      {
        ...createTodo('Личное развитие'),
        children: [
          {
            ...createTodo('Прочитать главу книги'),
            children: [createTodo('Сделать конспект')],
          },
        ],
      },
    ]
  }

  addTodo(parentId: string | null, rawTitle: string) {
    const title = rawTitle.trim()
    if (!title) return

    if (!parentId) {
      this.todos.push(createTodo(title))
      return
    }

    const parentInfo = findTodoInfo(this.todos, parentId)
    if (!parentInfo || parentInfo.depth >= MAX_DEPTH) return

    parentInfo.todo.children.push(createTodo(title))
  }

  updateTodo(id: string, rawTitle: string) {
    const info = findTodoInfo(this.todos, id)
    if (!info) return

    const title = rawTitle.trim()
    if (!title) return

    info.todo.title = title
  }

  toggleTodo(id: string) {
    const info = findTodoInfo(this.todos, id)
    if (!info) return

    info.todo.completed = !info.todo.completed
  }

  removeTodo(id: string) {
    const info = findTodoInfo(this.todos, id)
    if (!info) return

    const bucket = info.parent ? info.parent.children : this.todos
    bucket.splice(info.index, 1)
  }

  canDrop(id: string | null, targetParentId: string | null) {
    if (!id) return false
    return Boolean(this.getMovePlan(id, targetParentId))
  }

  moveTodo(id: string, targetParentId: string | null, targetIndex: number) {
    if (!Number.isFinite(targetIndex)) return

    const plan = this.getMovePlan(id, targetParentId)
    if (!plan) return

    const { source, targetParent } = plan
    const fromArray = source.parent ? source.parent.children : this.todos
    const initialTargetArray = targetParent ? targetParent.todo.children : this.todos

    let insertIndex = Math.max(0, Math.min(targetIndex, initialTargetArray.length))
    if (fromArray === initialTargetArray && source.index < insertIndex) {
      insertIndex -= 1
    }

    fromArray.splice(source.index, 1)

    const targetArray = targetParent ? targetParent.todo.children : this.todos
    const boundedIndex = Math.max(0, Math.min(insertIndex, targetArray.length))
    targetArray.splice(boundedIndex, 0, source.todo)
  }

  private getMovePlan(id: string, targetParentId: string | null) {
    const source = findTodoInfo(this.todos, id)
    if (!source) return null

    if (targetParentId === id) return null

    let targetParent: TodoInfo | null = null
    if (targetParentId) {
      targetParent = findTodoInfo(this.todos, targetParentId)
      if (!targetParent) return null
      if (containsTodo(source.todo, targetParentId)) return null
    }

    const parentDepth = targetParent ? targetParent.depth : 0
    const subtreeDepth = getMaxDepth(source.todo)
    if (parentDepth + subtreeDepth > MAX_DEPTH) return null

    return { source, targetParent }
  }
}

export const todoStore = new TodoStore()
