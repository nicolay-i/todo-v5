import type { TodoNode, Tag } from './types'

export type VisibilityMode = 'activeOnly' | 'today' | 'oneDay' | 'twoDays' | 'week'

export interface SearchHighlight {
  indices: ReadonlyArray<[number, number]>
}

export interface ListViewResult {
  todos: TodoNode[]
  highlightMap: Map<string, SearchHighlight>
  descriptionHighlightMap: Map<string, ReadonlyArray<[number, number]>>
}

export interface TodoLookup {
  node: TodoNode
  parent: TodoNode | null
  depth: number
  index: number
}

/**
 * Проверяет, является ли значение допустимым режимом видимости
 */
export function isVisibilityMode(value: string): value is VisibilityMode {
  return ['activeOnly', 'today', 'oneDay', 'twoDays', 'week'].includes(value)
}

/**
 * Возвращает начальную границу для фильтрации по режиму видимости
 */
export function startBoundary(mode: VisibilityMode): Date | null {
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

/**
 * Проверяет, должна ли задача быть включена в список по режиму видимости
 */
export function shouldIncludeTodo(node: TodoNode, mode: VisibilityMode): boolean {
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

/**
 * Вычисляет максимальную глубину поддерева
 */
export function getMaxDepth(node: TodoNode): number {
  if (node.children.length === 0) return 0
  let maxDepth = 0
  for (const child of node.children) {
    const childDepth = 1 + getMaxDepth(child)
    if (childDepth > maxDepth) {
      maxDepth = childDepth
    }
  }
  return maxDepth
}

/**
 * Проверяет, содержит ли узел заданный ID в своем поддереве
 */
export function containsNode(node: TodoNode, id: string): boolean {
  if (node.id === id) return true
  return node.children.some((child) => containsNode(child, id))
}

/**
 * Преобразует дерево задач в плоский массив
 */
export function flattenNodes(nodes: TodoNode[], acc: TodoNode[] = []): TodoNode[] {
  for (const node of nodes) {
    acc.push(node)
    if (node.children.length > 0) {
      flattenNodes(node.children, acc)
    }
  }
  return acc
}

/**
 * Проверяет, соответствует ли задача выбранным тегам поиска
 */
export function matchesSelectedTags(node: TodoNode, searchTagIds: string[]): boolean {
  if (searchTagIds.length === 0) return true
  const tagIds = new Set((node.tags ?? []).map((tag) => tag.id))
  for (const id of searchTagIds) {
    if (!tagIds.has(id)) return false
  }
  return true
}

/**
 * Проверяет, имеет ли задача системный тег "Временный"
 */
export function hasTemporaryTag(node: TodoNode): boolean {
  return (node.tags ?? []).some((tag) => tag.name === 'Временный')
}

/**
 * Ищет задачу в дереве по ID
 */
export function findTodo(
  id: string,
  nodes: TodoNode[],
  depth = 0,
  parent: TodoNode | null = null,
): TodoLookup | null {
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index]
    if (node.id === id) {
      return { node, parent, depth, index }
    }

    const result = findTodo(id, node.children, depth + 1, node)
    if (result) {
      return result
    }
  }

  return null
}

/**
 * Фильтрует дерево задач по режиму видимости
 */
export function filterTreeByMode(nodes: TodoNode[], mode: VisibilityMode): TodoNode[] {
  const result: TodoNode[] = []
  for (const node of nodes) {
    const filteredChildren = filterTreeByMode(node.children, mode)
    if (!shouldIncludeTodo(node, mode) && filteredChildren.length === 0) continue
    result.push({ ...node, children: filteredChildren })
  }
  return result
}

/**
 * Находит первого ребенка на заданной глубине в поддереве
 */
export function findFirstAtDepth(node: TodoNode, targetDepth: number, currentDepth: number): TodoNode | null {
  if (currentDepth === targetDepth) {
    return node
  }

  for (const child of node.children) {
    const result = findFirstAtDepth(child, targetDepth, currentDepth + 1)
    if (result) {
      return result
    }
  }

  return null
}

/**
 * Находит первого ребенка на максимальной глубине в поддереве узла
 */
export function findFirstChildAtMaxDepthInSubtree(node: TodoNode): TodoNode | null {
  const maxDepth = getMaxDepth(node)

  if (maxDepth === 0) {
    // Нет детей
    return null
  }

  // Ищем первого ребенка на глубине maxDepth
  return findFirstAtDepth(node, maxDepth, 0)
}