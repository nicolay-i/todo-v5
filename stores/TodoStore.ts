'use client'

import { makeAutoObservable, runInAction } from 'mobx'
import type { Todo } from '@prisma/client'
import { MAX_DEPTH as MAX_DEPTH_LIMIT } from '@/lib/constants'
import type { AppState, PinnedListView, TodoTree } from '@/types/state'

export const MAX_DEPTH = MAX_DEPTH_LIMIT

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {})
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  headers.set('Accept', 'application/json')
  return headers
}

export class TodoStore {
  todos: TodoTree[] = []
  pinnedLists: PinnedListView[] = []
  draggedId: string | null = null
  isHydrating = false
  isInitialized = false
  isMutating = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get pinnedListsWithTodos(): PinnedListView[] {
    return this.pinnedLists
  }

  get primaryPinnedListId(): string | null {
    if (this.pinnedLists.length === 0) {
      return null
    }
    const [first] = [...this.pinnedLists].sort((a, b) => a.position - b.position)
    return first?.id ?? null
  }

  async hydrate() {
    if (this.isHydrating) return
    this.isHydrating = true
    try {
      const response = await fetch('/api/state', { headers: { Accept: 'application/json' } })
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные')
      }
      const data = (await response.json()) as AppState
      runInAction(() => {
        this.todos = data.todos
        this.pinnedLists = data.pinnedLists
        this.error = null
        this.isInitialized = true
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Неизвестная ошибка'
      })
    } finally {
      runInAction(() => {
        this.isHydrating = false
      })
    }
  }

  private async mutate(url: string, init: RequestInit) {
    this.isMutating = true
    try {
      const response = await fetch(url, {
        ...init,
        headers: buildHeaders(init),
      })
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Ошибка при обновлении данных')
      }
      const data = (await response.json()) as AppState
      runInAction(() => {
        this.todos = data.todos
        this.pinnedLists = data.pinnedLists
        this.error = null
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Неизвестная ошибка'
      })
    } finally {
      runInAction(() => {
        this.isMutating = false
      })
    }
  }

  addTodo(parentId: string | null, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    void this.mutate('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ parentId, title: trimmed }),
    })
  }

  updateTitle(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    if (!this.findTodo(id)) return
    void this.mutate(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: trimmed }),
    })
  }

  toggleTodo(id: string) {
    const info = this.findTodo(id)
    if (!info) return
    const completed = !info.node.completed
    void this.mutate(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    })
  }

  deleteTodo(id: string) {
    void this.mutate(`/api/todos/${id}`, {
      method: 'DELETE',
    })
  }

  togglePinned(id: string) {
    const info = this.findTodo(id)
    if (!info) return
    const pinned = !info.node.pinned
    void this.mutate(`/api/todos/${id}/pinned`, {
      method: 'POST',
      body: JSON.stringify({ pinned }),
    })
  }

  moveTodo(id: string, targetParentId: string | null, targetIndex: number) {
    void this.mutate(`/api/todos/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ targetParentId, targetIndex }),
    })
  }

  movePinnedTodo(id: string, listId: string, targetIndex: number) {
    void this.mutate('/api/pinned-todos/move', {
      method: 'POST',
      body: JSON.stringify({ todoId: id, listId, targetIndex }),
    })
  }

  addPinnedList(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    void this.mutate('/api/pinned-lists', {
      method: 'POST',
      body: JSON.stringify({ title: trimmed }),
    })
  }

  renamePinnedList(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    void this.mutate(`/api/pinned-lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: trimmed }),
    })
  }

  deletePinnedList(id: string) {
    void this.mutate(`/api/pinned-lists/${id}`, {
      method: 'DELETE',
    })
  }

  isPinned(id: string): boolean {
    const info = this.findTodo(id)
    return info?.node.pinned ?? false
  }

  isPrimaryPinnedList(id: string): boolean {
    return this.primaryPinnedListId === id
  }

  setDragged(id: string | null) {
    this.draggedId = id
  }

  clearDragged() {
    this.draggedId = null
  }

  canDrop(id: string, parentId: string | null): boolean {
    const itemInfo = this.findTodo(id)
    if (!itemInfo) return false

    const subtreeDepth = this.getMaxDepth(itemInfo.node)

    if (!parentId) {
      return subtreeDepth <= MAX_DEPTH
    }

    const parentInfo = this.findTodo(parentId)
    if (!parentInfo) return false

    if (this.containsNode(itemInfo.node, parentId)) return false

    return parentInfo.depth + 1 + subtreeDepth <= MAX_DEPTH
  }

  private findTodo(
    id: string,
    nodes: TodoTree[] = this.todos,
    depth = 0,
    parent: TodoTree | null = null,
  ): { node: TodoTree; parent: TodoTree | null; depth: number; index: number } | null {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index]
      if (node.id === id) {
        return { node, parent, depth, index }
      }
      const result = this.findTodo(id, node.children, depth + 1, node)
      if (result) return result
    }
    return null
  }

  private getMaxDepth(node: TodoTree): number {
    if (node.children.length === 0) return 0
    let maxDepth = 0
    for (const child of node.children) {
      const childDepth = 1 + this.getMaxDepth(child)
      if (childDepth > maxDepth) {
        maxDepth = childDepth
      }
    }
    return maxDepth
  }

  private containsNode(node: TodoTree, id: string): boolean {
    if (node.id === id) return true
    return node.children.some((child) => this.containsNode(child, id))
  }
}

export function flattenTodos(nodes: TodoTree[]): Todo[] {
  const result: Todo[] = []
  const stack = [...nodes]
  while (stack.length > 0) {
    const current = stack.shift()
    if (!current) continue
    const { children, ...rest } = current
    result.push(rest)
    stack.unshift(...children)
  }
  return result
}
