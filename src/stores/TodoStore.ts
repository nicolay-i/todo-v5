import { makeAutoObservable } from 'mobx'
import { MAX_DEPTH } from '@/lib/constants'
import type { TodoNode, TodoState, PinnedListState } from '@/lib/types'

export interface PinnedListView extends PinnedListState {
  todos: TodoNode[]
}

interface TodoLookup {
  node: TodoNode
  parent: TodoNode | null
  depth: number
  index: number
}

export class TodoStore {
  todos: TodoNode[] = []
  pinnedLists: PinnedListState[] = []
  draggedId: string | null = null
  // Set со свернутыми узлами дерева (хранит id задач)
  collapsedIds: Set<string> = new Set()

  private static readonly COLLAPSE_STORAGE_KEY = 'todoCollapsedIds_v1'

  constructor(initialState: TodoState) {
    makeAutoObservable(this, {}, { autoBind: true })
    this.todos = initialState.todos
    this.pinnedLists = initialState.pinnedLists
    this.loadCollapsed()
  }

  get pinnedListsWithTodos(): PinnedListView[] {
    return this.pinnedLists.map((list) => ({
      ...list,
      todos: list.order
        .map((id) => this.findTodo(id)?.node)
        .filter((node): node is TodoNode => Boolean(node?.pinned)),
    }))
  }

  async refresh() {
    try {
      const response = await fetch('/api/state', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load state')
      }
      const data = (await response.json()) as TodoState
      this.setState(data)
    } catch (error) {
      console.error('Failed to refresh state', error)
    }
  }

  async addTodo(parentId: string | null, title: string) {
    if (!title.trim()) return
    await this.mutate('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ parentId, title }),
    })
  }

  async updateTitle(id: string, title: string) {
    if (!title.trim()) return
    await this.mutate(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'rename', title }),
    })
  }

  async toggleTodo(id: string) {
    await this.mutate(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'toggleCompleted' }),
    })
  }

  async deleteTodo(id: string) {
    await this.mutate(`/api/todos/${id}`, { method: 'DELETE' })
  }

  setDragged(id: string | null) {
    this.draggedId = id
  }

  clearDragged() {
    this.draggedId = null
  }

  setState(state: TodoState) {
    this.todos = state.todos
    this.pinnedLists = state.pinnedLists
  }

  // ---- Collapse API ----
  isCollapsed(id: string): boolean {
    return this.collapsedIds.has(id)
  }

  setCollapsed(id: string, collapsed: boolean) {
    if (collapsed) {
      this.collapsedIds.add(id)
    } else {
      this.collapsedIds.delete(id)
    }
    this.saveCollapsed()
  }

  toggleCollapse(id: string) {
    if (this.collapsedIds.has(id)) {
      this.collapsedIds.delete(id)
    } else {
      this.collapsedIds.add(id)
    }
    this.saveCollapsed()
  }

  private loadCollapsed() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(TodoStore.COLLAPSE_STORAGE_KEY)
      if (!raw) return
      const arr = JSON.parse(raw) as string[]
      if (Array.isArray(arr)) {
        this.collapsedIds = new Set(arr)
      }
    } catch (e) {
      // ignore parsing/storage errors
      console.warn('Failed to load collapsedIds from storage')
    }
  }

  private saveCollapsed() {
    if (typeof window === 'undefined') return
    try {
      const arr = Array.from(this.collapsedIds)
      window.localStorage.setItem(TodoStore.COLLAPSE_STORAGE_KEY, JSON.stringify(arr))
    } catch (e) {
      // ignore storage errors
    }
  }

  async moveTodo(id: string, targetParentId: string | null, targetIndex: number) {
    if (!this.canDrop(id, targetParentId)) return
    await this.mutate(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'move', targetParentId, targetIndex }),
    })
  }

  async togglePinned(id: string) {
    await this.mutate(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'togglePinned' }),
    })
  }

  async movePinnedTodo(id: string, targetListId: string, targetIndex: number) {
    await this.mutate('/api/pinned-lists/move', {
      method: 'POST',
      body: JSON.stringify({ todoId: id, targetListId, targetIndex }),
    })
  }

  async addPinnedList(title: string) {
    if (!title.trim()) return
    await this.mutate('/api/pinned-lists', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
  }

  async renamePinnedList(id: string, title: string) {
    if (!title.trim()) return
    await this.mutate(`/api/pinned-lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    })
  }

  async deletePinnedList(id: string) {
    await this.mutate(`/api/pinned-lists/${id}`, { method: 'DELETE' })
  }

  isPinned(id: string): boolean {
    const info = this.findTodo(id)
    return info?.node.pinned ?? false
  }

  isPrimaryPinnedList(id: string): boolean {
    return this.pinnedLists[0]?.id === id
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

  private async mutate(url: string, init: RequestInit) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
      })

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = (await response.json()) as TodoState
      this.setState(data)
    } catch (error) {
      console.error('Failed to update state', error)
      await this.refresh()
    }
  }

  private findTodo(
    id: string,
    nodes: TodoNode[] = this.todos,
    depth = 0,
    parent: TodoNode | null = null,
  ): TodoLookup | null {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index]
      if (node.id === id) {
        return { node, parent, depth, index }
      }

      const result = this.findTodo(id, node.children, depth + 1, node)
      if (result) {
        return result
      }
    }

    return null
  }

  private getMaxDepth(node: TodoNode): number {
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

  private containsNode(node: TodoNode, id: string): boolean {
    if (node.id === id) return true
    return node.children.some((child) => this.containsNode(child, id))
  }
}
