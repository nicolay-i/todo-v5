import type { PinnedEntry, PinnedList, Todo } from '@prisma/client'
import type { AppState, PinnedListView, TodoTree } from '@/types/state'

export function buildTodoTree(todos: Todo[]): TodoTree[] {
  const nodes = new Map<string, TodoTree>()
  const roots: TodoTree[] = []

  for (const todo of todos) {
    nodes.set(todo.id, { ...todo, children: [] })
  }

  const sorted = [...todos].sort((a, b) => a.position - b.position)

  for (const todo of sorted) {
    const node = nodes.get(todo.id)
    if (!node) continue
    if (todo.parentId) {
      const parent = nodes.get(todo.parentId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  const sortChildren = (items: TodoTree[]) => {
    items.sort((a, b) => a.position - b.position)
    items.forEach((child) => sortChildren(child.children))
  }

  sortChildren(roots)
  return roots
}

export function composePinnedLists(
  lists: Array<PinnedList & { entries: Array<PinnedEntry & { todo: Todo }> }>,
): PinnedListView[] {
  return lists.map((list) => ({
    ...list,
    todos: list.entries
      .filter((entry) => entry.todo.pinned)
      .sort((a, b) => a.position - b.position)
      .map((entry) => entry.todo),
  }))
}

export function composeAppState(
  todos: Todo[],
  pinnedLists: Array<PinnedList & { entries: Array<PinnedEntry & { todo: Todo }> }>,
): AppState {
  return {
    todos: buildTodoTree(todos),
    pinnedLists: composePinnedLists(pinnedLists),
  }
}

export function buildParentMap(todos: Todo[]): Map<string, string | null> {
  const parentMap = new Map<string, string | null>()
  todos.forEach((todo) => {
    parentMap.set(todo.id, todo.parentId ?? null)
  })
  return parentMap
}

export function buildChildrenMap(todos: Todo[]): Map<string | null, Todo[]> {
  const childrenMap = new Map<string | null, Todo[]>()
  todos.forEach((todo) => {
    const parentId = todo.parentId ?? null
    const list = childrenMap.get(parentId)
    if (list) {
      list.push(todo)
    } else {
      childrenMap.set(parentId, [todo])
    }
  })
  for (const [, list] of childrenMap) {
    list.sort((a, b) => a.position - b.position)
  }
  return childrenMap
}

export function getDepth(id: string | null, parentMap: Map<string, string | null>): number {
  if (!id) return 0
  let depth = 0
  let current: string | null = id
  while (current) {
    const parentId: string | null = parentMap.get(current) ?? null
    if (!parentId) break
    depth += 1
    current = parentId
  }
  return depth
}

export function getSubtreeDepth(id: string, childrenMap: Map<string | null, Todo[]>): number {
  const children = childrenMap.get(id)
  if (!children || children.length === 0) return 0
  let maxDepth = 0
  for (const child of children) {
    const depth = 1 + getSubtreeDepth(child.id, childrenMap)
    if (depth > maxDepth) {
      maxDepth = depth
    }
  }
  return maxDepth
}

export function isDescendant(sourceId: string, targetId: string, childrenMap: Map<string | null, Todo[]>): boolean {
  const children = childrenMap.get(sourceId)
  if (!children) return false
  for (const child of children) {
    if (child.id === targetId) return true
    if (isDescendant(child.id, targetId, childrenMap)) return true
  }
  return false
}
