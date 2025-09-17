import { makeAutoObservable } from 'mobx'

export interface TodoNode {
  id: string
  title: string
  completed: boolean
  pinned: boolean
  children: TodoNode[]
}

export interface PinnedListState {
  id: string
  title: string
  order: string[]
}

export interface PinnedListView extends PinnedListState {
  todos: TodoNode[]
}

interface TodoLookup {
  node: TodoNode
  parent: TodoNode | null
  depth: number
  index: number
}

export const MAX_DEPTH = 6

export class TodoStore {
  todos: TodoNode[] = []
  draggedId: string | null = null
  pinnedLists: PinnedListState[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.pinnedLists.push(this.createPinnedList('Главное'))
    this.todos = this.createInitialTodos()
    this.syncPinnedTodos(this.todos)
  }

  addTodo(parentId: string | null, title: string): string | null {
    const trimmed = title.trim()
    if (!trimmed) return null

    const todo: TodoNode = {
      id: this.createId(),
      title: trimmed,
      completed: false,
      pinned: false,
      children: [],
    }

    if (!parentId) {
      this.todos.push(todo)
      return todo.id
    }

    const parentInfo = this.findTodo(parentId)
    if (!parentInfo) return null
    if (parentInfo.depth >= MAX_DEPTH) return null

    parentInfo.node.children.push(todo)
    return todo.id
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

    this.removePinnedRecursive(info.node)

    const list = info.parent ? info.parent.children : this.todos
    list.splice(info.index, 1)
  }

  setDragged(id: string | null) {
    this.draggedId = id
  }

  clearDragged() {
    this.draggedId = null
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

  get pinnedListsWithTodos(): PinnedListView[] {
    return this.pinnedLists.map((list) => ({
      ...list,
      todos: list.order
        .map((id) => this.findTodo(id)?.node)
        .filter((node): node is TodoNode => Boolean(node?.pinned)),
    }))
  }

  togglePinned(id: string) {
    const info = this.findTodo(id)
    if (!info) return

    if (info.node.pinned) {
      this.unpinNode(info.node)
      return
    }

    this.pinNode(info.node)
  }

  movePinnedTodo(id: string, targetListId: string, targetIndex: number) {
    const sourceList = this.pinnedLists.find((list) => list.order.includes(id))
    const targetList = this.pinnedLists.find((list) => list.id === targetListId)
    if (!sourceList || !targetList) return

    const currentIndex = sourceList.order.indexOf(id)
    if (currentIndex === -1) return

    const [removed] = sourceList.order.splice(currentIndex, 1)
    if (!removed) return

    let index = targetIndex
    if (targetList === sourceList && index > currentIndex) {
      index -= 1
    }

    if (index < 0) index = 0
    if (index > targetList.order.length) index = targetList.order.length

    targetList.order.splice(index, 0, removed)
  }

  isPinned(id: string): boolean {
    const info = this.findTodo(id)
    return info?.node.pinned ?? false
  }

  addPinnedList(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    this.pinnedLists.push(this.createPinnedList(trimmed))
  }

  renamePinnedList(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    const list = this.pinnedLists.find((item) => item.id === id)
    if (!list) return

    list.title = trimmed
  }

  deletePinnedList(id: string) {
    if (this.isPrimaryPinnedList(id)) return

    const index = this.pinnedLists.findIndex((list) => list.id === id)
    if (index === -1) return

    const primary = this.primaryPinnedList
    const [removed] = this.pinnedLists.splice(index, 1)
    if (!removed) return

    removed.order.forEach((todoId) => {
      const todo = this.findTodo(todoId)?.node
      if (!todo?.pinned) return
      if (!primary.order.includes(todoId)) {
        primary.order.push(todoId)
      }
    })
  }

  getTodo(id: string): TodoNode | null {
    return this.findTodo(id)?.node ?? null
  }

  getParentId(id: string): string | null {
    const info = this.findTodo(id)
    if (!info) return null
    return info.parent?.id ?? null
  }

  getChildren(parentId: string | null): TodoNode[] {
    if (!parentId) {
      return this.todos
    }

    const info = this.findTodo(parentId)
    return info ? info.node.children : []
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

  private pinNode(node: TodoNode) {
    if (node.pinned) return
    node.pinned = true
    const primary = this.primaryPinnedList
    if (!primary.order.includes(node.id)) {
      primary.order.push(node.id)
    }
  }

  private unpinNode(node: TodoNode) {
    if (!node.pinned) return
    node.pinned = false
    this.removeFromPinnedLists(node.id)
  }

  private removePinnedRecursive(node: TodoNode) {
    this.unpinNode(node)
    node.children.forEach((child) => this.removePinnedRecursive(child))
  }

  private syncPinnedTodos(nodes: TodoNode[]) {
    nodes.forEach((node) => {
      if (node.pinned) {
        const primary = this.primaryPinnedList
        if (!primary.order.includes(node.id)) {
          primary.order.push(node.id)
        }
      }
      if (node.children.length > 0) {
        this.syncPinnedTodos(node.children)
      }
    })
  }

  private get primaryPinnedList(): PinnedListState {
    if (this.pinnedLists.length === 0) {
      const list = this.createPinnedList('Главное')
      this.pinnedLists.push(list)
      return list
    }

    return this.pinnedLists[0]
  }

  private removeFromPinnedLists(id: string) {
    this.pinnedLists.forEach((list) => {
      const index = list.order.indexOf(id)
      if (index !== -1) {
        list.order.splice(index, 1)
      }
    })
  }

  private makeTodo(
    title: string,
    options: { completed?: boolean; children?: TodoNode[]; pinned?: boolean } = {},
  ): TodoNode {
    return {
      id: this.createId(),
      title,
      completed: options.completed ?? false,
      pinned: options.pinned ?? false,
      children: options.children ?? [],
    }
  }

  private createPinnedList(title: string): PinnedListState {
    return {
      id: this.createId(),
      title,
      order: [],
    }
  }

  private createId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }

    return Math.random().toString(36).slice(2, 11)
  }
}
