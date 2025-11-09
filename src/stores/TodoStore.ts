import { makeAutoObservable, runInAction } from 'mobx'
import { MAX_DEPTH } from '@/lib/constants'
import type { TodoNode, TodoState, PinnedListState, Tag } from '@/lib/types'
import { fuzzyMatch } from '@/lib/search/fuzzyMatch'
import { NotificationStore } from './NotificationStore'
import { ApiClient } from '@/lib/apiClient'

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

export class TodoStore {
  todos: TodoNode[] = []
  pinnedLists: PinnedListState[] = []
  tags: Tag[] = []
  draggedId: string | null = null
  // Set со свернутыми узлами дерева (хранит id задач)
  collapsedIds: Set<string> = new Set()
  // Set со свернутыми закрепленными слотами (хранит id списков)
  collapsedPinnedListIds: Set<string> = new Set()

  // Видимость выполненных задач
  listFilterMode: VisibilityMode = 'today'
  pinnedFilterMode: VisibilityMode = 'today'

  // Поиск и фильтрация по тегам в основном списке
  searchQuery = ''
  searchTagIds: string[] = []

  // Флаг включения выделения первых todo на максимальной глубине
  highlightFirstAtMaxDepth = true

  // Оптимистичные обновления
  private stateSnapshot: TodoState | null = null
  pendingOperations = 0
  notifications: NotificationStore

  private static readonly COLLAPSE_STORAGE_KEY = 'todoCollapsedIds_v1'
  private static readonly PINNED_COLLAPSE_STORAGE_KEY = 'pinnedCollapsedIds_v1'
  private static readonly LIST_FILTER_STORAGE_KEY = 'listFilterMode_v1'
  private static readonly PINNED_FILTER_STORAGE_KEY = 'pinnedFilterMode_v1'
  private static readonly HIGHLIGHT_FIRST_STORAGE_KEY = 'highlightFirstAtMaxDepth_v1'

  constructor(initialState: TodoState, notifications: NotificationStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    this.notifications = notifications
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
      const data = await ApiClient.getState()
      this.setState(data)
    } catch (error) {
      console.error('Failed to refresh state', error)
    }
  }

  async addTodo(parentId: string | null, title: string, tagIds?: string[]) {
    if (!title.trim()) return
    
    const tempId = `temp_${Date.now()}_${Math.random()}`
    const now = new Date()

    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const newTodo: TodoNode = {
          id: tempId,
          title: title.trim(),
          completed: false,
          completedAt: null,
          pinned: false,
          alias: null,
          parentId,
          position: 0,
          userId: '', // Временное значение, будет заменено сервером
          createdAt: now,
          updatedAt: now,
          children: [],
          tags: [],
        }

        // Добавляем теги если указаны
        if (Array.isArray(tagIds) && tagIds.length > 0) {
          const uniqueTagIds = Array.from(new Set(tagIds))
          newTodo.tags = this.tags.filter((tag) => uniqueTagIds.includes(tag.id))
        }

        if (parentId) {
          const parent = this.findTodo(parentId)
          if (parent) {
            // Добавляем в начало списка детей
            parent.node.children = [newTodo, ...parent.node.children]
            // Обновляем позиции остальных
            parent.node.children.forEach((child, idx) => {
              child.position = idx
            })
          }
        } else {
          // Добавляем в корень
          this.todos = [newTodo, ...this.todos]
          this.todos.forEach((todo, idx) => {
            todo.position = idx
          })
        }
      },
      // Запрос на сервер
      async () => {
        const data = await ApiClient.addTodo(parentId, title, tagIds)
        this.setState(data)
      },
      'Не удалось создать задачу'
    )
  }

  async updateTodoDetails(id: string, details: { title?: string; alias?: string | null }) {
    const payload: Record<string, unknown> = { action: 'updateDetails' }
    let hasChanges = false

    if (typeof details.title === 'string') {
      const trimmed = details.title.trim()
      if (!trimmed) return
      payload.title = trimmed
      hasChanges = true
    }

    if (Object.prototype.hasOwnProperty.call(details, 'alias')) {
      payload.alias = details.alias
      hasChanges = true
    }

    if (!hasChanges) return

    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const info = this.findTodo(id)
        if (info) {
          if (typeof details.title === 'string') {
            info.node.title = details.title.trim()
          }
          if (Object.prototype.hasOwnProperty.call(details, 'alias')) {
            info.node.alias = details.alias ?? null
          }
          info.node.updatedAt = new Date()
        }
      },
      // Запрос на сервер
      async () => {
        const data = await ApiClient.updateTodoDetails(id, details)
        this.setState(data)
      },
      'Не удалось обновить задачу'
    )
  }

  async toggleTodo(id: string) {
    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const info = this.findTodo(id)
        if (info) {
          info.node.completed = !info.node.completed
          info.node.completedAt = info.node.completed ? new Date() : null
          info.node.updatedAt = new Date()

          // Рекурсивно обновляем детей
          this.updateChildrenCompleted(info.node, info.node.completed)
        }
      },
      // Запрос на сервер
      async () => {
        const data = await ApiClient.toggleTodoCompleted(id)
        this.setState(data)
      },
      'Не удалось изменить статус задачи'
    )
  }

  private updateChildrenCompleted(node: TodoNode, completed: boolean) {
    node.children.forEach((child) => {
      child.completed = completed
      child.completedAt = completed ? new Date() : null
      child.updatedAt = new Date()
      this.updateChildrenCompleted(child, completed)
    })
  }

  async deleteTodo(id: string) {
    try {
      const data = await ApiClient.deleteTodo(id)
      this.setState(data)
    } catch (error) {
      console.error('Failed to delete todo', error)
      await this.refresh()
    }
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

  toggleHighlightFirstAtMaxDepth() {
    this.highlightFirstAtMaxDepth = !this.highlightFirstAtMaxDepth
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
      const highlightRaw = window.localStorage.getItem(TodoStore.HIGHLIGHT_FIRST_STORAGE_KEY)
      if (listRaw && isVisibilityMode(listRaw)) this.listFilterMode = listRaw
      if (pinnedRaw && isVisibilityMode(pinnedRaw)) this.pinnedFilterMode = pinnedRaw
      if (highlightRaw !== null) this.highlightFirstAtMaxDepth = highlightRaw === 'true'
    } catch (e) {
      // ignore
    }
  }

  private saveFilters() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(TodoStore.LIST_FILTER_STORAGE_KEY, this.listFilterMode)
      window.localStorage.setItem(TodoStore.PINNED_FILTER_STORAGE_KEY, this.pinnedFilterMode)
      window.localStorage.setItem(TodoStore.HIGHLIGHT_FIRST_STORAGE_KEY, String(this.highlightFirstAtMaxDepth))
    } catch (e) {}
  }

  async moveTodo(id: string, targetParentId: string | null, targetIndex: number) {
    if (!this.canDrop(id, targetParentId)) return
    try {
      const data = await ApiClient.moveTodo(id, targetParentId, targetIndex)
      this.setState(data)
    } catch (error) {
      console.error('Failed to move todo', error)
      await this.refresh()
    }
  }

  async togglePinned(id: string) {
    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const info = this.findTodo(id)
        if (!info) return

        info.node.pinned = !info.node.pinned

        if (info.node.pinned) {
          // Закрепляем - добавляем в активный список
          const activeList = this.pinnedLists.find((list) => list.isActive)
          if (activeList) {
            activeList.order = [id, ...activeList.order]
          }
        } else {
          // Открепляем - удаляем из всех списков
          this.pinnedLists.forEach((list) => {
            if (list.order.includes(id)) {
              list.order = list.order.filter((todoId) => todoId !== id)
            }
          })
        }
      },
      // Запрос на сервер
      async () => {
        const data = await ApiClient.toggleTodoPinned(id)
        this.setState(data)
      },
      'Не удалось изменить закрепление задачи'
    )
  }

  async movePinnedTodo(id: string, targetListId: string, targetIndex: number) {
    try {
      const data = await ApiClient.movePinnedTodo(id, targetListId, targetIndex)
      this.setState(data)
    } catch (error) {
      console.error('Failed to move pinned todo', error)
      await this.refresh()
    }
  }

  async addPinnedList(title: string) {
    if (!title.trim()) return
    try {
      const data = await ApiClient.addPinnedList(title)
      this.setState(data)
    } catch (error) {
      console.error('Failed to add pinned list', error)
      await this.refresh()
    }
  }

  async renamePinnedList(id: string, title: string) {
    if (!title.trim()) return
    try {
      const data = await ApiClient.renamePinnedList(id, title)
      this.setState(data)
    } catch (error) {
      console.error('Failed to rename pinned list', error)
      await this.refresh()
    }
  }

  async deletePinnedList(id: string) {
    try {
      const data = await ApiClient.deletePinnedList(id)
      this.setState(data)
    } catch (error) {
      console.error('Failed to delete pinned list', error)
      await this.refresh()
    }
  }

  // ---- Tags CRUD ----
  async addTag(name: string) {
    if (!name.trim()) return
    try {
      const data = await ApiClient.addTag(name)
      this.setState(data)
    } catch (error) {
      console.error('Failed to add tag', error)
      await this.refresh()
    }
  }

  async renameTag(id: string, name: string) {
    if (!name.trim()) return
    try {
      const data = await ApiClient.renameTag(id, name)
      this.setState(data)
    } catch (error) {
      console.error('Failed to rename tag', error)
      await this.refresh()
    }
  }

  async deleteTag(id: string) {
    try {
      const data = await ApiClient.deleteTag(id)
      this.setState(data)
    } catch (error) {
      console.error('Failed to delete tag', error)
      await this.refresh()
    }
  }

  async attachTag(todoId: string, tagId: string) {
    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const todoInfo = this.findTodo(todoId)
        const tag = this.tags.find((t) => t.id === tagId)

        if (todoInfo && tag) {
          if (!todoInfo.node.tags) {
            todoInfo.node.tags = []
          }
          // Проверяем, что тег еще не добавлен
          if (!todoInfo.node.tags.some((t) => t.id === tagId)) {
            todoInfo.node.tags.push(tag)
          }
        }
      },
      // Запрос на сервер
      async () => {
        const data = await ApiClient.attachTag(todoId, tagId)
        this.setState(data)
      },
      'Не удалось добавить тег'
    )
  }

  async detachTag(todoId: string, tagId: string) {
    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const todoInfo = this.findTodo(todoId)
        if (todoInfo && todoInfo.node.tags) {
          todoInfo.node.tags = todoInfo.node.tags.filter((t) => t.id !== tagId)
        }
      },
      // Запрос на сервер
      async () => {
        const data = await ApiClient.detachTag(todoId, tagId)
        this.setState(data)
      },
      'Не удалось удалить тег'
    )
  }

  getNearestAlias(todoId: string): { todoId: string; alias: string } | null {
    const info = this.findTodo(todoId)
    if (!info) return null

    let currentParent = info.parent
    while (currentParent) {
      const aliasValue = typeof currentParent.alias === 'string' ? currentParent.alias.trim() : ''
      const hasAlias = aliasValue.length > 0
      const hasRequiredTag = (currentParent.tags ?? []).some((tag) => tag.name === 'Проект' || tag.name === 'Раздел')

      if (hasAlias && hasRequiredTag) {
        return { todoId: currentParent.id, alias: aliasValue }
      }

      const parentInfo = this.findTodo(currentParent.id)
      currentParent = parentInfo?.parent ?? null
    }

    return null
  }

  async reorderTags(tagIds: string[]) {
    try {
      const data = await ApiClient.reorderTags(tagIds)
      this.setState(data)
    } catch (error) {
      console.error('Failed to reorder tags', error)
      await this.refresh()
    }
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
    try {
      const data = await ApiClient.setActivePinnedList(id)
      this.setState(data)
    } catch (error) {
      console.error('Failed to set active pinned list', error)
      await this.refresh()
    }
  }

  stepActivePinnedList(offset: number) {
    if (offset === 0 || this.pinnedLists.length === 0) return
    const currentIndex = this.pinnedLists.findIndex((list) => list.isActive)
    let nextIndex = currentIndex
    if (currentIndex === -1) {
      nextIndex = offset > 0 ? 0 : this.pinnedLists.length - 1
    } else {
      nextIndex = currentIndex + offset
      if (nextIndex < 0) nextIndex = 0
      if (nextIndex >= this.pinnedLists.length) nextIndex = this.pinnedLists.length - 1
    }
    if (nextIndex === currentIndex || nextIndex < 0 || nextIndex >= this.pinnedLists.length) return
    const nextId = this.pinnedLists[nextIndex].id
    void this.setActivePinnedList(nextId)
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

  /**
   * Создает снэпшот текущего состояния перед оптимистичным обновлением
   */
  private createSnapshot() {
    this.stateSnapshot = {
      todos: JSON.parse(JSON.stringify(this.todos)),
      pinnedLists: JSON.parse(JSON.stringify(this.pinnedLists)),
      tags: JSON.parse(JSON.stringify(this.tags)),
    }
  }

  /**
   * Откатывает состояние к предыдущему снэпшоту
   */
  private rollbackToSnapshot() {
    if (this.stateSnapshot) {
      runInAction(() => {
        this.todos = this.stateSnapshot!.todos
        this.pinnedLists = this.stateSnapshot!.pinnedLists
        this.tags = this.stateSnapshot!.tags ?? []
        this.stateSnapshot = null
      })
    }
  }

  /**
   * Очищает снэпшот после успешной операции
   */
  private clearSnapshot() {
    this.stateSnapshot = null
  }

  /**
   * Обертка для оптимистичных мутаций
   * @param optimisticUpdate - функция для немедленного обновления UI
   * @param serverUpdate - промис с запросом на сервер
   * @param errorMessage - сообщение об ошибке для пользователя
   */
  private async optimisticMutate(
    optimisticUpdate: () => void,
    serverUpdate: () => Promise<void>,
    errorMessage: string
  ) {
    this.createSnapshot()
    this.pendingOperations++

    try {
      // Немедленно обновляем UI
      runInAction(optimisticUpdate)

      // Отправляем запрос на сервер
      await serverUpdate()

      // Успех - очищаем снэпшот
      this.clearSnapshot()
    } catch (error) {
      // Ошибка - откатываем изменения
      this.rollbackToSnapshot()

      // Показываем уведомление
      this.notifications.show('error', errorMessage)

      // Перезагружаем актуальное состояние с сервера
      await this.refresh()
    } finally {
      runInAction(() => {
        this.pendingOperations--
      })
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

  /**
   * Проверяет, является ли задача первым ребенком узла на максимальной глубине.
   * Проверяет для каждого узла-предка, является ли данная задача первым потомком
   * на максимальной глубине поддерева этого предка.
   */
  isFirstChildAtMaxDepth(todoId: string): boolean {
    // Проверяем для всех узлов в дереве, является ли данный todoId
    // первым ребенком на максимальной глубине

    // Рекурсивная функция для проверки каждого узла
    const checkNode = (node: TodoNode): boolean => {
      // Для текущего узла находим первого ребенка на максимальной глубине
      const firstAtMax = this.findFirstChildAtMaxDepthInSubtree(node)
      if (firstAtMax?.id === todoId) {
        return true
      }

      // Проверяем рекурсивно для всех детей
      for (const child of node.children) {
        if (checkNode(child)) {
          return true
        }
      }

      return false
    }

    // Проверяем для всех корневых узлов
    for (const root of this.todos) {
      if (checkNode(root)) {
        return true
      }
    }

    return false
  }

  /**
   * Находит первого ребенка на максимальной глубине в поддереве узла
   */
  private findFirstChildAtMaxDepthInSubtree(node: TodoNode): TodoNode | null {
    const maxDepth = this.getMaxDepth(node)
    
    if (maxDepth === 0) {
      // Нет детей
      return null
    }

    // Ищем первого ребенка на глубине maxDepth
    return this.findFirstAtDepth(node, maxDepth, 0)
  }

  /**
   * Рекурсивно ищет первого ребенка на заданной глубине
   */
  private findFirstAtDepth(node: TodoNode, targetDepth: number, currentDepth: number): TodoNode | null {
    if (currentDepth === targetDepth) {
      return node
    }

    for (const child of node.children) {
      const result = this.findFirstAtDepth(child, targetDepth, currentDepth + 1)
      if (result) {
        return result
      }
    }

    return null
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
