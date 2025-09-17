import { autorun, makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'

export const MAX_DEPTH = 3

export interface TodoItem {
  id: string
  title: string
  completed: boolean
  children: TodoItem[]
}

const STORAGE_KEY = 'nested-todos'

export class TodoStore {
  todos: TodoItem[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    if (typeof window !== 'undefined') {
      this.hydrateFromStorage()
      autorun(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos))
      })
    }
  }

  addTodo(parentPath: string[], title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    if (parentPath.length >= MAX_DEPTH) return
    const list = this.getListByParentPath(parentPath)
    if (!list) return

    list.push({
      id: nanoid(),
      title: trimmed,
      completed: false,
      children: [],
    })
  }

  toggleCompleted(id: string) {
    const todo = this.getTodoById(id)
    if (!todo) return

    const next = !todo.completed
    todo.completed = next
    this.setChildrenCompletion(todo, next)
  }

  removeTodo(id: string) {
    this.removeRecursive(this.todos, id)
  }

  reorder(parentPath: string[], activeId: string, overId: string) {
    const list = this.getListByParentPath(parentPath)
    if (!list) return
    const fromIndex = list.findIndex((todo) => todo.id === activeId)
    const toIndex = list.findIndex((todo) => todo.id === overId)
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return

    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
  }

  findPath(id: string): string[] | null {
    const path: string[] = []
    const found = this.searchPath(this.todos, id, path)
    return found ? path : null
  }

  private hydrateFromStorage() {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as TodoItem[]
      this.todos = this.normaliseItems(parsed)
    } catch (error) {
      console.warn('Failed to parse todo data from storage', error)
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  private getTodoById(id: string): TodoItem | null {
    const path = this.findPath(id)
    if (!path) return null
    const parentPath = path.slice(0, -1)
    const list = this.getListByParentPath(parentPath)
    if (!list) return null
    return list.find((todo) => todo.id === id) ?? null
  }

  private getListByParentPath(path: string[]): TodoItem[] | null {
    let list = this.todos
    for (const id of path) {
      const node = list.find((todo) => todo.id === id)
      if (!node) return null
      list = node.children
    }
    return list
  }

  private searchPath(list: TodoItem[], id: string, trail: string[]): boolean {
    for (const item of list) {
      trail.push(item.id)
      if (item.id === id) {
        return true
      }
      if (this.searchPath(item.children, id, trail)) {
        return true
      }
      trail.pop()
    }
    return false
  }

  private setChildrenCompletion(todo: TodoItem, completed: boolean) {
    todo.children.forEach((child) => {
      child.completed = completed
      this.setChildrenCompletion(child, completed)
    })
  }

  private removeRecursive(list: TodoItem[], id: string): boolean {
    const index = list.findIndex((item) => item.id === id)
    if (index >= 0) {
      list.splice(index, 1)
      return true
    }
    for (const item of list) {
      if (this.removeRecursive(item.children, id)) {
        return true
      }
    }
    return false
  }

  private normaliseItems(items: TodoItem[] | undefined): TodoItem[] {
    if (!items) return []
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      completed: item.completed,
      children: this.normaliseItems(item.children),
    }))
  }
}

export const todoStore = new TodoStore()
