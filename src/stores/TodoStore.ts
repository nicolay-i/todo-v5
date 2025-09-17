import { makeAutoObservable, runInAction } from 'mobx'
import { MAX_DEPTH } from '@/lib/constants'
import type { AppState, PinnedListView, TaskNode, ActionRequest } from '@/types/state'

export class TodoStore {
  todos: TaskNode[] = []
  pinnedLists: PinnedListView[] = []
  draggedId: string | null = null
  isLoading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  get pinnedListsWithTodos() {
    return this.pinnedLists
  }

  async loadInitialState() {
    this.isLoading = true
    this.error = null

    try {
      const state = await this.requestState()
      runInAction(() => {
        this.applyState(state)
        this.isLoading = false
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Не удалось загрузить данные'
        this.isLoading = false
      })
    }
  }

  addTodo(parentId: string | null, title: string) {
    void this.mutate({ type: 'addTodo', parentId, title })
  }

  updateTitle(id: string, title: string) {
    void this.mutate({ type: 'updateTitle', id, title })
  }

  toggleTodo(id: string) {
    void this.mutate({ type: 'toggleTodo', id })
  }

  deleteTodo(id: string) {
    void this.mutate({ type: 'deleteTodo', id })
  }

  setDragged(id: string | null) {
    this.draggedId = id
  }

  clearDragged() {
    this.draggedId = null
  }

  moveTodo(id: string, targetParentId: string | null, targetIndex: number) {
    void this.mutate({ type: 'moveTodo', id, targetParentId, targetIndex })
  }

  togglePinned(id: string) {
    void this.mutate({ type: 'togglePinned', id })
  }

  movePinnedTodo(id: string, targetListId: string, targetIndex: number) {
    void this.mutate({ type: 'movePinnedTodo', id, targetListId, targetIndex })
  }

  isPinned(id: string): boolean {
    return this.findTodo(id)?.pinned ?? false
  }

  addPinnedList(title: string) {
    void this.mutate({ type: 'addPinnedList', title })
  }

  renamePinnedList(id: string, title: string) {
    void this.mutate({ type: 'renamePinnedList', id, title })
  }

  deletePinnedList(id: string) {
    void this.mutate({ type: 'deletePinnedList', id })
  }

  isPrimaryPinnedList(id: string): boolean {
    const sorted = [...this.pinnedLists].sort((a, b) => a.position - b.position)
    return sorted[0]?.id === id
  }

  canDrop(id: string, parentId: string | null): boolean {
    const itemInfo = this.findTodoWithMeta(id)
    if (!itemInfo) return false

    const subtreeDepth = this.getMaxDepth(itemInfo.node)
    if (parentId === null) {
      return subtreeDepth <= MAX_DEPTH
    }

    const parentInfo = this.findTodoWithMeta(parentId)
    if (!parentInfo) return false

    if (this.containsNode(itemInfo.node, parentId)) return false

    return parentInfo.depth + 1 + subtreeDepth <= MAX_DEPTH
  }

  private async mutate(action: ActionRequest) {
    try {
      const state = await this.requestState(action)
      runInAction(() => {
        this.applyState(state)
        this.draggedId = null
        this.error = null
      })
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Не удалось сохранить изменения'
      })
    }
  }

  private async requestState(action?: ActionRequest): Promise<AppState> {
    const response = await fetch('/api/state', {
      method: action ? 'POST' : 'GET',
      headers: action ? { 'Content-Type': 'application/json' } : undefined,
      body: action ? JSON.stringify(action) : undefined,
    })

    if (!response.ok) {
      throw new Error('Сервер вернул ошибку')
    }

    return response.json() as Promise<AppState>
  }

  private applyState(state: AppState) {
    this.todos = state.todos
    this.pinnedLists = state.pinnedLists
  }

  private findTodo(id: string): TaskNode | null {
    const search = (nodes: TaskNode[]): TaskNode | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return node
        }
        const found = search(node.children)
        if (found) {
          return found
        }
      }
      return null
    }

    return search(this.todos)
  }

  private findTodoWithMeta(
    id: string,
    nodes: TaskNode[] = this.todos,
    depth = 0,
    parent: TaskNode | null = null,
  ): { node: TaskNode; parent: TaskNode | null; depth: number } | null {
    for (const node of nodes) {
      if (node.id === id) {
        return { node, parent, depth }
      }
      const result = this.findTodoWithMeta(id, node.children, depth + 1, node)
      if (result) {
        return result
      }
    }
    return null
  }

  private getMaxDepth(node: TaskNode): number {
    if (node.children.length === 0) return 0
    let max = 0
    for (const child of node.children) {
      const depth = 1 + this.getMaxDepth(child)
      if (depth > max) {
        max = depth
      }
    }
    return max
  }

  private containsNode(node: TaskNode, id: string): boolean {
    if (node.id === id) return true
    return node.children.some((child) => this.containsNode(child, id))
  }
}

export { MAX_DEPTH } from '@/lib/constants'
export type { TaskNode, PinnedListView } from '@/types/state'
