import { makeAutoObservable } from 'mobx'

export interface TodoNode {
  id: string
  title: string
  completed: boolean
  pinned: boolean
  pinnedListId: string | null
  children: TodoNode[]
}

export interface PinnedList {
  id: string
  title: string
  itemIds: string[]
  locked?: boolean
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
  pinnedLists: PinnedList[] = []

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.pinnedLists = this.createInitialPinnedLists()
    this.todos = this.createInitialTodos()
  }

  addTodo(parentId: string | null, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    const todo: TodoNode = {
      id: this.createId(),
      title: trimmed,
      completed: false,
      pinned: false,
      pinnedListId: null,
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

  get pinnedListsView() {
    return this.pinnedLists.map((list) => ({
      ...list,
      todos: list.itemIds
        .map((id) => this.findTodo(id)?.node)
        .filter((node): node is TodoNode => Boolean(node?.pinned && node.pinnedListId === list.id)),
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
    const info = this.findTodo(id)
    if (!info?.node.pinned) return

    const sourceList =
      this.findPinnedListByTodoId(id) ??
      (info.node.pinnedListId ? this.pinnedLists.find((list) => list.id === info.node.pinnedListId) : undefined)
    const targetList = this.pinnedLists.find((list) => list.id === targetListId)
    if (!sourceList || !targetList) return

    const currentIndex = sourceList.itemIds.indexOf(id)
    if (currentIndex === -1) return

    let index = targetIndex
    if (sourceList === targetList && index > currentIndex) {
      index -= 1
    }

    const [removed] = sourceList.itemIds.splice(currentIndex, 1)
    if (!removed) return

    if (index < 0) index = 0
    if (index > targetList.itemIds.length) index = targetList.itemIds.length

    targetList.itemIds.splice(index, 0, removed)
    info.node.pinnedListId = targetList.id
  }

  isPinned(id: string): boolean {
    const info = this.findTodo(id)
    return info?.node.pinned ?? false
  }

  addPinnedList(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    const list: PinnedList = {
      id: this.createId(),
      title: trimmed,
      itemIds: [],
    }

    this.pinnedLists.push(list)
  }

  renamePinnedList(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    const list = this.pinnedLists.find((item) => item.id === id)
    if (!list) return

    list.title = trimmed
  }

  removePinnedList(id: string) {
    const index = this.pinnedLists.findIndex((item) => item.id === id)
    if (index <= 0) return

    const [removed] = this.pinnedLists.splice(index, 1)
    if (!removed) return

    const firstList = this.ensurePrimaryPinnedList()
    const itemsToReassign = [...removed.itemIds]
    const itemsToAdd = itemsToReassign.filter((itemId) => !firstList.itemIds.includes(itemId))

    firstList.itemIds.push(...itemsToAdd)

    itemsToReassign.forEach((itemId) => {
      const info = this.findTodo(itemId)
      if (info?.node.pinned) {
        info.node.pinnedListId = firstList.id
      }
    })
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

  private createInitialPinnedLists(): PinnedList[] {
    return [
      {
        id: this.createId(),
        title: 'Основной список',
        itemIds: [],
        locked: true,
      },
    ]
  }

  private ensurePrimaryPinnedList(): PinnedList {
    if (this.pinnedLists.length === 0) {
      const list: PinnedList = {
        id: this.createId(),
        title: 'Основной список',
        itemIds: [],
        locked: true,
      }
      this.pinnedLists.push(list)
      return list
    }

    return this.pinnedLists[0]
  }

  private findPinnedListByTodoId(id: string): PinnedList | undefined {
    return this.pinnedLists.find((list) => list.itemIds.includes(id))
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

    const primaryList = this.ensurePrimaryPinnedList()
    node.pinned = true
    node.pinnedListId = primaryList.id

    if (!primaryList.itemIds.includes(node.id)) {
      primaryList.itemIds.push(node.id)
    }
  }

  private unpinNode(node: TodoNode) {
    if (!node.pinned) return

    node.pinned = false
    node.pinnedListId = null

    this.pinnedLists.forEach((list) => {
      const index = list.itemIds.indexOf(node.id)
      if (index !== -1) {
        list.itemIds.splice(index, 1)
      }
    })
  }

  private removePinnedRecursive(node: TodoNode) {
    this.unpinNode(node)
    node.children.forEach((child) => this.removePinnedRecursive(child))
  }

  private makeTodo(
    title: string,
    options: { completed?: boolean; children?: TodoNode[]; pinned?: boolean } = {},
  ): TodoNode {
    const pinned = options.pinned ?? false
    const primaryList = pinned ? this.ensurePrimaryPinnedList() : null

    const todo: TodoNode = {
      id: this.createId(),
      title,
      completed: options.completed ?? false,
      pinned,
      pinnedListId: pinned ? primaryList?.id ?? null : null,
      children: options.children ?? [],
    }

    if (pinned && primaryList && !primaryList.itemIds.includes(todo.id)) {
      primaryList.itemIds.push(todo.id)
    }

    return todo
  }

  private createId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }

    return Math.random().toString(36).slice(2, 11)
  }
}
