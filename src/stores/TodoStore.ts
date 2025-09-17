import { makeAutoObservable } from 'mobx'

export interface TodoNode {
  id: string
  title: string
  completed: boolean
  children: TodoNode[]
}

interface TodoLookup {
  node: TodoNode
  parent: TodoNode | null
  depth: number
  index: number
}

export const MAX_DEPTH = 2

export class TodoStore {
  todos: TodoNode[] = []
  draggedId: string | null = null
  pinnedIds: string[] = []
  draggedPinnedId: string | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.todos = this.createInitialTodos()
  }

  addTodo(parentId: string | null, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    const todo: TodoNode = {
      id: this.createId(),
      title: trimmed,
      completed: false,
      children: [],
    }

    if (!parentId) {
      this.todos.push(todo)
      return
    }

    const parentInfo = this.findTodo(parentId)
    if (!parentInfo) return
    if (parentInfo.depth >= MAX_DEPTH) return

    parentInfo.node.children.push(todo)
  }

  updateTitle(id: string, title: string) {
    const info = this.findTodo(id)
    if (!info) return
    const trimmed = title.trim()
    if (!trimmed) return
    info.node.title = trimmed
  }

  toggleTodo(id: string) {
    const info = this.findTodo(id)
    if (!info) return
    info.node.completed = !info.node.completed
  }

  deleteTodo(id: string) {
    const info = this.findTodo(id)
    if (!info) return

    const list = info.parent ? info.parent.children : this.todos
    const [removed] = list.splice(info.index, 1)
    if (removed) {
      this.removePinnedSubtree(removed)
    }
  }

  setDragged(id: string | null) {
    this.draggedId = id
  }

  clearDragged() {
    this.draggedId = null
  }

  setDraggedPinned(id: string | null) {
    this.draggedPinnedId = id
  }

  clearDraggedPinned() {
    this.draggedPinnedId = null
  }

  moveTodo(id: string, targetParentId: string | null, targetIndex: number) {
    if (!this.canDrop(id, targetParentId)) return

    const itemInfo = this.findTodo(id)
    if (!itemInfo) return

    const sourceList = itemInfo.parent ? itemInfo.parent.children : this.todos
    const parentInfo = targetParentId ? this.findTodo(targetParentId) : null

    if (targetParentId && !parentInfo) return

    const targetList = parentInfo ? parentInfo.node.children : this.todos

    let index = targetIndex
    if (sourceList === targetList && index > itemInfo.index) {
      index -= 1
    }

    const [node] = sourceList.splice(itemInfo.index, 1)
    if (!node) return

    if (index < 0) index = 0
    if (index > targetList.length) index = targetList.length

    targetList.splice(index, 0, node)
    this.draggedId = null
  }

  movePinnedTodo(id: string, targetIndex: number) {
    const currentIndex = this.pinnedIds.indexOf(id)
    if (currentIndex === -1) return

    let index = targetIndex
    if (index < 0) index = 0
    if (index > this.pinnedIds.length) index = this.pinnedIds.length

    if (index > currentIndex) {
      index -= 1
    }

    const [pinnedId] = this.pinnedIds.splice(currentIndex, 1)
    if (!pinnedId) return

    if (index < 0) index = 0
    if (index > this.pinnedIds.length) index = this.pinnedIds.length

    this.pinnedIds.splice(index, 0, pinnedId)
    this.draggedPinnedId = null
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

  get pinnedTodos(): TodoNode[] {
    const todos: TodoNode[] = []
    for (const id of this.pinnedIds) {
      const info = this.findTodo(id)
      if (info) {
        todos.push(info.node)
      }
    }
    return todos
  }

  isPinned(id: string): boolean {
    return this.pinnedIds.includes(id)
  }

  togglePin(id: string) {
    if (this.isPinned(id)) {
      this.unpinTodo(id)
    } else {
      this.pinTodo(id)
    }
  }

  private createInitialTodos(): TodoNode[] {
    const qaChecklist = this.makeTodo('Проверка перед релизом', {
      children: [
        this.makeTodo('Прогнать авто-тесты', { completed: true }),
        this.makeTodo('Проверить ручные сценарии'),
        this.makeTodo('Согласовать список изменений'),
      ],
    })

    const designIteration = this.makeTodo('Прототип интерфейса', {
      children: [
        this.makeTodo('Скетч основных экранов'),
        this.makeTodo('Собрать обратную связь', {
          children: [this.makeTodo('Созвон с командой продукта')],
        }),
      ],
    })

    return [qaChecklist, designIteration]
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

  private pinTodo(id: string) {
    if (!this.pinnedIds.includes(id)) {
      this.pinnedIds.push(id)
    }
  }

  private unpinTodo(id: string) {
    const index = this.pinnedIds.indexOf(id)
    if (index !== -1) {
      this.pinnedIds.splice(index, 1)
    }
  }

  private removePinnedSubtree(node: TodoNode) {
    this.unpinTodo(node.id)
    for (const child of node.children) {
      this.removePinnedSubtree(child)
    }
  }

  private makeTodo(title: string, options: { completed?: boolean; children?: TodoNode[] } = {}): TodoNode {
    return {
      id: this.createId(),
      title,
      completed: options.completed ?? false,
      children: options.children ?? [],
    }
  }

  private createId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }

    return Math.random().toString(36).slice(2, 11)
  }
}
