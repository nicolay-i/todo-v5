import { makeAutoObservable } from 'mobx'

export interface TodoItem {
  id: string
  title: string
  completed: boolean
  children: TodoItem[]
}

export const ROOT_ID = 'root'
export const MAX_DEPTH = 3

const createTodo = (title: string): TodoItem => ({
  id: crypto.randomUUID(),
  title,
  completed: false,
  children: [],
})

type FindResult = {
  todo: TodoItem
  depth: number
  parent: TodoItem | null
  list: TodoItem[]
  index: number
}

class TodoStore {
  todos: TodoItem[] = [
    {
      id: crypto.randomUUID(),
      title: 'Сделать утреннюю зарядку',
      completed: false,
      children: [],
    },
    {
      id: crypto.randomUUID(),
      title: 'Подготовить отчёт',
      completed: false,
      children: [
        {
          id: crypto.randomUUID(),
          title: 'Собрать данные',
          completed: true,
          children: [],
        },
        {
          id: crypto.randomUUID(),
          title: 'Сверстать презентацию',
          completed: false,
          children: [
            {
              id: crypto.randomUUID(),
              title: 'Выбрать шаблон',
              completed: false,
              children: [],
            },
          ],
        },
      ],
    },
  ]

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  addTodo(parentId: string | null, rawTitle: string) {
    const title = rawTitle.trim()
    if (!title) return null

    const todo = createTodo(title)

    if (!parentId) {
      this.todos.push(todo)
      return todo
    }

    const { list, depth } = this.listForParent(parentId)
    if (depth >= MAX_DEPTH) {
      return null
    }

    list.push(todo)
    return todo
  }

  toggleTodo(id: string) {
    const found = this.findWithParent(id)
    if (!found) return
    found.todo.completed = !found.todo.completed
  }

  removeTodo(id: string) {
    const found = this.findWithParent(id)
    if (!found) return
    found.list.splice(found.index, 1)
  }

  reorder(parentId: string | null, activeId: string, overId: string) {
    const list = parentId ? this.listForParent(parentId).list : this.todos
    const fromIndex = list.findIndex((item) => item.id === activeId)
    const toIndex = list.findIndex((item) => item.id === overId)

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return
    }

    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
  }

  getById(id: string) {
    return this.findWithParent(id)?.todo ?? null
  }

  private listForParent(parentId: string) {
    const parent = this.findWithParent(parentId)
    if (!parent) {
      throw new Error('Parent todo not found')
    }

    return { list: parent.todo.children, depth: parent.depth }
  }

  private findWithParent(
    id: string,
    list: TodoItem[] = this.todos,
    depth = 1,
    parent: TodoItem | null = null,
  ): FindResult | null {
    for (let index = 0; index < list.length; index += 1) {
      const todo = list[index]
      if (todo.id === id) {
        return { todo, depth, parent, list, index }
      }

      const child = this.findWithParent(id, todo.children, depth + 1, todo)
      if (child) {
        return child
      }
    }

    return null
  }
}

export const todoStore = new TodoStore()
