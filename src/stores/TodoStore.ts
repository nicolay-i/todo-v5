import { makeAutoObservable } from 'mobx'
import { MAX_DEPTH } from '@/lib/constants'
import type { TodoNode, TodoState, PinnedListState, Tag } from '@/lib/types'
import { fuzzyMatch } from '@/lib/search/fuzzyMatch'

export interface PinnedListView extends PinnedListState {
  todos: TodoNode[]
}

interface TodoLookup {
  node: TodoNode
  parent: TodoNode | null
  depth: number
  index: number
}

interface SearchHighlight {
  indices: ReadonlyArray<[number, number]>
}

interface ListViewResult {
  todos: TodoNode[]
  highlightMap: Map<string, SearchHighlight>
}

type FocusScope = 'list' | 'pinned'

type KeyboardActionType = 'edit' | 'openTags'

interface KeyboardAction {
  type: KeyboardActionType
  targetId: string
  token: number
}

interface PinnedTodoRef {
  todoId: string
  listId: string
}

export class TodoStore {
  todos: TodoNode[] = []
  pinnedLists: PinnedListState[] = []
  tags: Tag[] = []
  draggedId: string | null = null
  // Set со свернутыми узлами дерева (хранит id задач)
  collapsedIds: Set<string> = new Set()
  // Set со свернутыми закрепленными слотами (хранит id списков)
  collapsedPinnedListIds: Set<string> = new Set()
  focusedTodoId: string | null = null

  // Видимость выполненных задач
  listFilterMode: VisibilityMode = 'today'
  pinnedFilterMode: VisibilityMode = 'today'

  // Поиск и фильтрация по тегам в основном списке
  searchQuery = ''
  searchTagIds: string[] = []

  keyboardAction: KeyboardAction | null = null
  private actionToken = 0

  private static readonly COLLAPSE_STORAGE_KEY = 'todoCollapsedIds_v1'
  private static readonly PINNED_COLLAPSE_STORAGE_KEY = 'pinnedCollapsedIds_v1'
  private static readonly LIST_FILTER_STORAGE_KEY = 'listFilterMode_v1'
  private static readonly PINNED_FILTER_STORAGE_KEY = 'pinnedFilterMode_v1'

  constructor(initialState: TodoState) {
    makeAutoObservable(this, {}, { autoBind: true })
    this.todos = initialState.todos
    this.pinnedLists = initialState.pinnedLists
    this.tags = initialState.tags ?? []
    this.loadCollapsed()
    this.loadPinnedCollapsed()
    this.loadFilters()
  }

  get pinnedListsWithTodos(): PinnedListView[] {
    return this.pinnedLists.map((list) => ({
      ...list,
      todos: list.order
        .map((id) => this.findTodo(id)?.node)
        .filter((node): node is TodoNode => Boolean(node?.pinned))
        .filter((node) => this.shouldIncludeTodo(node, this.pinnedFilterMode)),
    }))
  }

  get visibleTodos(): TodoNode[] {
    return this.listView.todos
  }

  get linearVisibleTodoIds(): string[] {
    const result: string[] = []
    const traverse = (nodes: TodoNode[]) => {
      for (const node of nodes) {
        result.push(node.id)
        const collapsed = !this.isSearchActive && this.isCollapsed(node.id)
        if (!collapsed && node.children.length > 0) {
          traverse(node.children)
        }
      }
    }
    traverse(this.visibleTodos)
    return result
  }

  get listView(): ListViewResult {
    const byMode = this.filterTreeByMode(this.todos, this.listFilterMode)
    if (!this.isSearchActive) {
      return { todos: byMode, highlightMap: new Map() }
    }

    const highlightMap = this.buildSearchHighlightMap(byMode)
    const filtered = this.applySearchFilters(byMode, highlightMap)
    return { todos: filtered, highlightMap }
  }

  get isSearchActive(): boolean {
    return this.searchQuery.trim().length > 0 || this.searchTagIds.length > 0
  }

  get pinnedTodoRefs(): PinnedTodoRef[] {
    const result: PinnedTodoRef[] = []
    for (const list of this.pinnedListsWithTodos) {
      for (const todo of list.todos) {
        result.push({ todoId: todo.id, listId: list.id })
      }
    }
    return result
  }

  get activePinnedListId(): string | null {
    const active = this.pinnedLists.find((list) => list.isActive)
    if (active) return active.id
    return this.pinnedLists[0]?.id ?? null
  }

  get selectedSearchTags(): Tag[] {
    if (this.searchTagIds.length === 0) return []
    const selected = new Set(this.searchTagIds)
    return this.tags.filter((tag) => selected.has(tag.id))
  }

  getSearchHighlight(id: string): ReadonlyArray<[number, number]> | null {
    const highlight = this.listView.highlightMap.get(id)
    return highlight ? highlight.indices : null
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

  async addTodo(parentId: string | null, title: string, tagIds?: string[]) {
    if (!title.trim()) return
    const payload: any = { parentId, title }
    if (Array.isArray(tagIds) && tagIds.length > 0) payload.tagIds = Array.from(new Set(tagIds))
    await this.mutate('/api/todos', {
      method: 'POST',
      body: JSON.stringify(payload),
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

  setFocusedTodoId(id: string | null) {
    this.focusedTodoId = id
  }

  focusTodo(id: string | null, scope: FocusScope) {
    this.focusedTodoId = id
    if (scope === 'pinned' && id) {
      const listId = this.findPinnedListIdForTodo(id)
      if (listId && !this.isActivePinnedList(listId)) {
        void this.setActivePinnedList(listId)
      }
    }
  }

  focusFirstTodo(scope: FocusScope): string | null {
    if (scope === 'list') {
      const sequence = this.linearVisibleTodoIds
      if (sequence.length === 0) {
        this.focusedTodoId = null
        return null
      }
      const firstId = sequence[0]
      this.focusTodo(firstId, 'list')
      return firstId
    }

    const refs = this.pinnedTodoRefs
    if (refs.length === 0) {
      this.focusedTodoId = null
      return null
    }
    const first = refs[0]
    this.focusTodo(first.todoId, 'pinned')
    return first.todoId
  }

  focusFirstTodoInPinnedList(listId: string): string | null {
    const list = this.pinnedListsWithTodos.find((item) => item.id === listId)
    const firstId = list?.todos[0]?.id ?? null
    if (firstId) {
      this.focusTodo(firstId, 'pinned')
    } else {
      this.focusedTodoId = null
    }
    return firstId
  }

  isTodoVisibleInScope(id: string | null, scope: FocusScope): boolean {
    if (!id) return false
    if (scope === 'list') {
      return this.linearVisibleTodoIds.includes(id)
    }
    return this.pinnedTodoRefs.some((ref) => ref.todoId === id)
  }

  focusNextTodo(direction: 1 | -1, scope: FocusScope): string | null {
    if (scope === 'list') {
      const sequence = this.linearVisibleTodoIds
      if (sequence.length === 0) return null
      const currentIndex = this.focusedTodoId ? sequence.indexOf(this.focusedTodoId) : -1
      let nextIndex = currentIndex + direction
      if (currentIndex === -1) {
        nextIndex = direction > 0 ? 0 : sequence.length - 1
      }
      if (nextIndex < 0 || nextIndex >= sequence.length) return null
      const nextId = sequence[nextIndex]
      this.focusTodo(nextId, 'list')
      return nextId
    }

    const refs = this.pinnedTodoRefs
    if (refs.length === 0) return null
    const currentIndex = this.focusedTodoId
      ? refs.findIndex((ref) => ref.todoId === this.focusedTodoId)
      : -1
    let nextIndex = currentIndex + direction
    if (currentIndex === -1) {
      nextIndex = direction > 0 ? 0 : refs.length - 1
    }
    if (nextIndex < 0 || nextIndex >= refs.length) return null
    const nextRef = refs[nextIndex]
    this.focusTodo(nextRef.todoId, 'pinned')
    return nextRef.todoId
  }

  focusParentTodo(id: string): string | null {
    const info = this.findTodo(id)
    if (!info?.parent) return null
    this.focusTodo(info.parent.id, 'list')
    return info.parent.id
  }

  focusFirstChildTodo(id: string): string | null {
    const info = this.findTodo(id)
    if (!info || info.node.children.length === 0) return null
    const firstChild = info.node.children[0]
    this.focusTodo(firstChild.id, 'list')
    return firstChild.id
  }

  getAdjacentPinnedListId(direction: 1 | -1): string | null {
    if (this.pinnedLists.length === 0) return null
    let index = this.pinnedLists.findIndex((list) => list.isActive)
    if (index === -1) index = 0
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= this.pinnedLists.length) return null
    return this.pinnedLists[nextIndex].id
  }

  requestKeyboardAction(type: KeyboardActionType, targetId: string) {
    this.actionToken += 1
    this.keyboardAction = { type, targetId, token: this.actionToken }
  }

  clearKeyboardAction(token: number) {
    if (this.keyboardAction?.token === token) {
      this.keyboardAction = null
    }
  }

  async detachLastTag(todoId: string) {
    const info = this.findTodo(todoId)
    const tags = info?.node.tags ?? []
    if (tags.length === 0) return
    const last = tags[tags.length - 1]
    await this.detachTag(todoId, last.id)
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
    this.tags = state.tags ?? []
  }

  // ---- Filters API ----
  setListFilterMode(mode: VisibilityMode) {
    this.listFilterMode = mode
    this.saveFilters()
  }

  setPinnedFilterMode(mode: VisibilityMode) {
    this.pinnedFilterMode = mode
    this.saveFilters()
  }

  // ---- Search API ----
  setSearchQuery(query: string) {
    this.searchQuery = query
  }

  clearSearchQuery() {
    this.searchQuery = ''
  }

  setSearchTags(ids: string[]) {
    const unique = Array.from(new Set(ids))
    this.searchTagIds = unique
  }

  toggleSearchTag(id: string) {
    if (this.searchTagIds.includes(id)) {
      this.searchTagIds = this.searchTagIds.filter((value) => value !== id)
    } else {
      this.searchTagIds = [...this.searchTagIds, id]
    }
  }

  clearSearchTags() {
    this.searchTagIds = []
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

  // ---- Collapse API for pinned lists ----
  isPinnedListCollapsed(id: string): boolean {
    return this.collapsedPinnedListIds.has(id)
  }

  setPinnedListCollapsed(id: string, collapsed: boolean) {
    if (collapsed) {
      this.collapsedPinnedListIds.add(id)
    } else {
      this.collapsedPinnedListIds.delete(id)
    }
    this.savePinnedCollapsed()
  }

  togglePinnedListCollapse(id: string) {
    if (this.collapsedPinnedListIds.has(id)) {
      this.collapsedPinnedListIds.delete(id)
    } else {
      this.collapsedPinnedListIds.add(id)
    }
    this.savePinnedCollapsed()
  }

  private loadPinnedCollapsed() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(TodoStore.PINNED_COLLAPSE_STORAGE_KEY)
      if (!raw) return
      const arr = JSON.parse(raw) as string[]
      if (Array.isArray(arr)) {
        this.collapsedPinnedListIds = new Set(arr)
      }
    } catch (e) {
      // ignore parsing/storage errors
      console.warn('Failed to load pinned collapsed ids from storage')
    }
  }

  private savePinnedCollapsed() {
    if (typeof window === 'undefined') return
    try {
      const arr = Array.from(this.collapsedPinnedListIds)
      window.localStorage.setItem(TodoStore.PINNED_COLLAPSE_STORAGE_KEY, JSON.stringify(arr))
    } catch (e) {
      // ignore storage errors
    }
  }

  private loadFilters() {
    if (typeof window === 'undefined') return
    try {
      const listRaw = window.localStorage.getItem(TodoStore.LIST_FILTER_STORAGE_KEY)
      const pinnedRaw = window.localStorage.getItem(TodoStore.PINNED_FILTER_STORAGE_KEY)
      if (listRaw && isVisibilityMode(listRaw)) this.listFilterMode = listRaw
      if (pinnedRaw && isVisibilityMode(pinnedRaw)) this.pinnedFilterMode = pinnedRaw
    } catch (e) {
      // ignore
    }
  }

  private saveFilters() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(TodoStore.LIST_FILTER_STORAGE_KEY, this.listFilterMode)
      window.localStorage.setItem(TodoStore.PINNED_FILTER_STORAGE_KEY, this.pinnedFilterMode)
    } catch (e) {}
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

  // ---- Tags CRUD ----
  async addTag(name: string) {
    if (!name.trim()) return
    await this.mutate('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async renameTag(id: string, name: string) {
    if (!name.trim()) return
    await this.mutate('/api/tags', {
      method: 'PATCH',
      body: JSON.stringify({ id, name }),
    })
  }

  async deleteTag(id: string) {
    await this.mutate('/api/tags', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  }

  async attachTag(todoId: string, tagId: string) {
    await this.mutate(`/api/todos/${todoId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagId }),
    })
  }

  async detachTag(todoId: string, tagId: string) {
    await this.mutate(`/api/todos/${todoId}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tagId }),
    })
  }

  async reorderTags(tagIds: string[]) {
    await this.mutate('/api/tags', {
      method: 'PUT',
      body: JSON.stringify({ tagIds }),
    })
  }

  isPinned(id: string): boolean {
    const info = this.findTodo(id)
    return info?.node.pinned ?? false
  }

  isPrimaryPinnedList(id: string): boolean {
    return this.pinnedLists[0]?.id === id
  }

  isActivePinnedList(id: string): boolean {
    const list = this.pinnedLists.find((l) => l.id === id)
    return Boolean(list?.isActive)
  }

  async setActivePinnedList(id: string) {
    await this.mutate(`/api/pinned-lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'setActive' }),
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

  findTodo(
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

  findPinnedListIdForTodo(todoId: string): string | null {
    for (const ref of this.pinnedTodoRefs) {
      if (ref.todoId === todoId) {
        return ref.listId
      }
    }
    return null
  }

  private filterTreeByMode(nodes: TodoNode[], mode: VisibilityMode): TodoNode[] {
    const result: TodoNode[] = []
    for (const node of nodes) {
      const filteredChildren = this.filterTreeByMode(node.children, mode)
      if (!this.shouldIncludeTodo(node, mode) && filteredChildren.length === 0) continue
      result.push({ ...node, children: filteredChildren })
    }
    return result
  }

  private applySearchFilters(
    nodes: TodoNode[],
    highlightMap: Map<string, SearchHighlight>,
  ): TodoNode[] {
    if (!this.isSearchActive) return nodes
    const query = this.searchQuery.trim()
    const requireTextMatch = query.length > 0
    const result: TodoNode[] = []

    for (const node of nodes) {
      const filteredChildren = this.applySearchFilters(node.children, highlightMap)
      const matchesTags = this.matchesSelectedTags(node)
      const matchesText = highlightMap.has(node.id)

      let include = false
      if (requireTextMatch) {
        include = (matchesTags && matchesText) || filteredChildren.length > 0
      } else if (this.searchTagIds.length > 0) {
        include = matchesTags || filteredChildren.length > 0
      } else {
        include = true
      }

      if (!include) continue
      result.push({ ...node, children: filteredChildren })
    }

    return result
  }

  private buildSearchHighlightMap(nodes: TodoNode[]): Map<string, SearchHighlight> {
    const result = new Map<string, SearchHighlight>()
    const query = this.searchQuery.trim()
    if (query.length === 0) return result

    const flattened = this.flattenNodes(nodes)
    for (const node of flattened) {
      if (!this.matchesSelectedTags(node)) continue
      const match = fuzzyMatch(query, node.title)
      if (!match) continue
      result.set(node.id, { indices: match.indices })
    }

    return result
  }

  private flattenNodes(nodes: TodoNode[], acc: TodoNode[] = []): TodoNode[] {
    for (const node of nodes) {
      acc.push(node)
      if (node.children.length > 0) {
        this.flattenNodes(node.children, acc)
      }
    }
    return acc
  }

  private matchesSelectedTags(node: TodoNode): boolean {
    if (this.searchTagIds.length === 0) return true
    const tagIds = new Set((node.tags ?? []).map((tag) => tag.id))
    for (const id of this.searchTagIds) {
      if (!tagIds.has(id)) return false
    }
    return true
  }

  private shouldIncludeTodo(node: TodoNode, mode: VisibilityMode): boolean {
    if (!node.completed) return true
    const completedAt = (node as any).completedAt
      ? new Date((node as any).completedAt)
      : (node as any).updatedAt
        ? new Date((node as any).updatedAt)
        : null
    if (!completedAt) return false
    const start = startBoundary(mode)
    if (!start) return false
    return completedAt >= start
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

export type VisibilityMode = 'activeOnly' | 'today' | 'oneDay' | 'twoDays' | 'week'

function isVisibilityMode(value: string): value is VisibilityMode {
  return ['activeOnly', 'today', 'oneDay', 'twoDays', 'week'].includes(value)
}

function startBoundary(mode: VisibilityMode): Date | null {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (mode) {
    case 'activeOnly':
      return new Date(8640000000000000) // far future; but will be unused because completed are hidden
    case 'today':
      return startOfToday
    case 'oneDay': {
      const d = new Date(startOfToday)
      d.setDate(d.getDate() - 1)
      return d
    }
    case 'twoDays': {
      const d = new Date(startOfToday)
      d.setDate(d.getDate() - 2)
      return d
    }
    case 'week': {
      const d = new Date(startOfToday)
      d.setDate(d.getDate() - 6)
      return d
    }
    default:
      return startOfToday
  }
}
