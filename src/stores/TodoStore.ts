import { makeAutoObservable } from 'mobx'
import { arrayMove } from '@dnd-kit/sortable'

export interface TodoNode {
  id: string
  title: string
  completed: boolean
  children: TodoNode[]
}

type FindResult = {
  node: TodoNode
  parent?: TodoNode
  depth: number
}

const MAX_DEPTH = 3

function createId() {
  return Math.random().toString(36).slice(2, 9)
}

export class TodoStore {
  todos: TodoNode[] = []

  constructor(initialTodos?: TodoNode[]) {
    this.todos = initialTodos ? [...initialTodos] : []
    makeAutoObservable(this, {}, { autoBind: true })

    if (!initialTodos) {
      this.seed()
    }
  }

  private seed() {
    const planningId = createId()
    const reviewId = createId()
    this.todos = [
      {
        id: planningId,
        title: 'Планирование недели',
        completed: false,
        children: [
          {
            id: createId(),
            title: 'Согласовать задачи с командой',
            completed: false,
            children: [],
          },
          {
            id: createId(),
            title: 'Заполнить календарь',
            completed: false,
            children: [],
          },
        ],
      },
      {
        id: createId(),
        title: 'Подготовить презентацию',
        completed: false,
        children: [
          {
            id: createId(),
            title: 'Собрать статистику',
            completed: false,
            children: [
              {
                id: createId(),
                title: 'Экспортировать отчёт из CRM',
                completed: false,
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: reviewId,
        title: 'Еженедельный обзор',
        completed: false,
        children: [],
      },
    ]
  }

  addTodo(title: string, parentId?: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    const newTodo: TodoNode = {
      id: createId(),
      title: trimmed,
      completed: false,
      children: [],
    }

    if (!parentId) {
      this.todos.push(newTodo)
      return
    }

    const parentInfo = this.findWithParent(parentId)
    if (!parentInfo) return
    if (parentInfo.depth >= MAX_DEPTH) return

    parentInfo.node.children.push(newTodo)
  }

  updateTitle(id: string, title: string) {
    const info = this.findWithParent(id)
    if (!info) return
    info.node.title = title
  }

  toggleTodo(id: string) {
    const info = this.findWithParent(id)
    if (!info) return

    info.node.completed = !info.node.completed
  }

  removeTodo(id: string) {
    const info = this.findWithParent(id)
    if (!info) return

    if (!info.parent) {
      this.todos = this.todos.filter((todo) => todo.id !== id)
      return
    }

    info.parent.children = info.parent.children.filter((todo) => todo.id !== id)
  }

  canAddChild(parentId?: string) {
    if (!parentId) return true
    const info = this.findWithParent(parentId)
    if (!info) return false
    return info.depth < MAX_DEPTH
  }

  reorder(parentId: string | undefined, activeId: string, overId: string) {
    const list = this.getSiblings(parentId)
    const fromIndex = list.findIndex((item) => item.id === activeId)
    const toIndex = list.findIndex((item) => item.id === overId)

    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
      return
    }

    const reordered = arrayMove([...list], fromIndex, toIndex)
    if (!parentId) {
      this.todos = reordered
      return
    }

    const parentInfo = this.findWithParent(parentId)
    if (!parentInfo) return

    parentInfo.node.children = reordered
  }

  private getSiblings(parentId?: string) {
    if (!parentId) {
      return this.todos
    }

    const parentInfo = this.findWithParent(parentId)
    return parentInfo ? parentInfo.node.children : []
  }

  private findWithParent(
    id: string,
    nodes: TodoNode[] = this.todos,
    depth = 1,
    parent?: TodoNode,
  ): FindResult | undefined {
    for (const node of nodes) {
      if (node.id === id) {
        return { node, parent, depth }
      }

      if (node.children.length > 0) {
        const result = this.findWithParent(id, node.children, depth + 1, node)
        if (result) return result
      }
    }

    return undefined
  }
}
