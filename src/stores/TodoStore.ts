import { createContext, useContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'

export const MAX_TODO_DEPTH = 2

export interface TodoItem {
  id: string
  title: string
  completed: boolean
  depth: number
  children: TodoItem[]
}

export class TodoStore {
  todos: TodoItem[] = []

  constructor() {
    makeAutoObservable(this)
    this.todos = [
      this.createTodo('Планирование релиза', 0, [
        this.createTodo('Собрать требования от команды', 1),
        this.createTodo('Уточнить сроки с заказчиком', 1, [
          this.createTodo('Подготовить план презентации', 2),
          this.createTodo('Согласовать бюджет', 2),
        ]),
      ]),
      this.createTodo('Личное развитие', 0, [
        this.createTodo('Прочитать новую книгу по дизайну', 1),
        this.createTodo('Потренироваться 3 раза за неделю', 1),
      ]),
    ]
  }

  addTodo(title: string, parentId: string | null = null): boolean {
    const normalizedTitle = title.trim()
    if (!normalizedTitle) {
      return false
    }

    if (parentId === null) {
      this.todos.push(this.createTodo(normalizedTitle, 0))
      return true
    }

    const found = this.findWithParent(parentId)
    if (!found) {
      return false
    }

    if (found.item.depth >= MAX_TODO_DEPTH) {
      return false
    }

    found.item.children.push(
      this.createTodo(normalizedTitle, found.item.depth + 1),
    )
    found.item.completed = false
    this.updateAncestorsCompletion(found.parent)
    return true
  }

  toggleTodo(id: string): void {
    const result = this.findWithParent(id)
    if (!result) {
      return
    }

    const nextState = !result.item.completed
    result.item.completed = nextState
    this.toggleChildren(result.item.children, nextState)
    this.updateAncestorsCompletion(result.parent)
  }

  removeTodo(id: string): void {
    const result = this.findWithParent(id)
    if (!result) {
      return
    }

    if (result.parent) {
      result.parent.children.splice(result.index, 1)
      this.updateAncestorsCompletion(result.parent)
      return
    }

    this.todos.splice(result.index, 1)
  }

  reorder(parentId: string | null, fromIndex: number, dropIndex: number): void {
    const list = this.getList(parentId)
    if (!list || list.length === 0) {
      return
    }

    if (fromIndex < 0 || fromIndex >= list.length) {
      return
    }

    const boundedDrop = Math.max(0, Math.min(Math.trunc(dropIndex), list.length))
    if (boundedDrop === fromIndex || boundedDrop === fromIndex + 1) {
      return
    }

    const [moved] = list.splice(fromIndex, 1)
    const insertIndex = fromIndex < boundedDrop ? boundedDrop - 1 : boundedDrop
    list.splice(insertIndex, 0, moved)
  }

  canAddChild(parentId: string | null): boolean {
    if (parentId === null) {
      return true
    }
    const found = this.findWithParent(parentId)
    if (!found) {
      return false
    }
    return found.item.depth < MAX_TODO_DEPTH
  }

  private toggleChildren(children: TodoItem[], completed: boolean) {
    children.forEach((child) => {
      child.completed = completed
      this.toggleChildren(child.children, completed)
    })
  }

  private updateAncestorsCompletion(parent: TodoItem | null) {
    if (!parent) {
      return
    }

    parent.completed = parent.children.length > 0
      ? parent.children.every((child) => child.completed)
      : parent.completed

    const found = this.findWithParent(parent.id)
    this.updateAncestorsCompletion(found?.parent ?? null)
  }

  private getList(parentId: string | null): TodoItem[] | undefined {
    if (parentId === null) {
      return this.todos
    }
    const found = this.findWithParent(parentId)
    return found?.item.children
  }

  private findWithParent(
    id: string,
    items: TodoItem[] = this.todos,
    parent: TodoItem | null = null,
  ): { item: TodoItem; parent: TodoItem | null; index: number } | undefined {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      if (item.id === id) {
        return { item, parent, index }
      }
      const nested = this.findWithParent(id, item.children, item)
      if (nested) {
        return nested
      }
    }
    return undefined
  }

  private createTodo(
    title: string,
    depth: number,
    children: TodoItem[] = [],
  ): TodoItem {
    return {
      id: nanoid(),
      title,
      completed: children.length > 0 && children.every((child) => child.completed),
      depth,
      children,
    }
  }
}

export const TodoStoreContext = createContext<TodoStore | null>(null)

export const useTodoStore = (): TodoStore => {
  const store = useContext(TodoStoreContext)
  if (!store) {
    throw new Error('useTodoStore must be used within a TodoStoreContext.Provider')
  }
  return store
}
