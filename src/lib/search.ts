import type { TodoNode } from './types'

export interface HighlightRange {
  start: number
  end: number
}

export interface FuzzyMatchResult {
  score: number
  ranges: HighlightRange[]
}

export interface SearchMetadata {
  active: boolean
  matches: Map<string, FuzzyMatchResult>
  matchedIds: Set<string>
  selfMatchedIds: Set<string>
  expandedIds: Set<string>
}

export function fuzzyMatchText(text: string, rawQuery: string): FuzzyMatchResult | null {
  const normalizedQuery = rawQuery.trim().toLowerCase()
  if (!normalizedQuery) return null

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return null

  const lowerText = text.toLowerCase()
  if (!lowerText) return null

  const ranges: HighlightRange[] = []
  let scoreSum = 0

  for (const token of tokens) {
    const tokenMatch = matchToken(lowerText, token)
    if (!tokenMatch) {
      return null
    }
    ranges.push({ start: tokenMatch.start, end: tokenMatch.end })
    scoreSum += tokenMatch.score
  }

  const mergedRanges = mergeRanges(ranges)
  const averageScore = scoreSum / tokens.length

  return {
    score: averageScore,
    ranges: mergedRanges,
  }
}

export function buildSearchMetadata(
  nodes: TodoNode[],
  rawQuery: string,
  tagIds: Set<string>,
): SearchMetadata {
  const query = rawQuery.trim().toLowerCase()
  const hasQuery = query.length > 0
  const hasTags = tagIds.size > 0

  if (!hasQuery && !hasTags) {
    return {
      active: false,
      matches: new Map(),
      matchedIds: new Set(),
      selfMatchedIds: new Set(),
      expandedIds: new Set(),
    }
  }

  const matches = new Map<string, FuzzyMatchResult>()
  const matchedIds = new Set<string>()
  const selfMatchedIds = new Set<string>()
  const expandedIds = new Set<string>()

  const visit = (node: TodoNode): boolean => {
    let childrenMatched = false
    for (const child of node.children) {
      if (visit(child)) {
        childrenMatched = true
      }
    }

    const tagsMatch = !hasTags || nodeHasAllTags(node, tagIds)
    let match: FuzzyMatchResult | null = null
    if (hasQuery && tagsMatch) {
      match = fuzzyMatchText(node.title, query)
    } else if (!hasQuery) {
      match = null
    }

    const selfMatches = tagsMatch && (!hasQuery || Boolean(match))

    if (selfMatches) {
      matchedIds.add(node.id)
      selfMatchedIds.add(node.id)
      if (match) {
        matches.set(node.id, match)
      }
    }

    if (childrenMatched) {
      matchedIds.add(node.id)
      expandedIds.add(node.id)
    }

    return selfMatches || childrenMatched
  }

  for (const node of nodes) {
    visit(node)
  }

  return {
    active: true,
    matches,
    matchedIds,
    selfMatchedIds,
    expandedIds,
  }
}

export function pruneTodosByIds(nodes: TodoNode[], allowedIds: Set<string>): TodoNode[] {
  const result: TodoNode[] = []
  for (const node of nodes) {
    const prunedChildren = pruneTodosByIds(node.children, allowedIds)
    const includeNode = allowedIds.has(node.id) || prunedChildren.length > 0
    if (!includeNode) continue
    result.push({ ...node, children: prunedChildren })
  }
  return result
}

export function collectTodoIds(nodes: TodoNode[]): Set<string> {
  const ids = new Set<string>()
  const stack = [...nodes]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    ids.add(current.id)
    for (const child of current.children) {
      stack.push(child)
    }
  }
  return ids
}

interface TokenMatch {
  score: number
  start: number
  end: number
}

function matchToken(text: string, token: string): TokenMatch | null {
  if (!token) return null
  const directIndex = text.indexOf(token)
  if (directIndex >= 0) {
    return {
      score: 1,
      start: directIndex,
      end: directIndex + token.length,
    }
  }

  const textLength = text.length
  if (textLength === 0) return null

  const allowedDiff = Math.max(1, Math.floor(token.length * 0.4))
  const desiredMin = token.length - allowedDiff
  const desiredMax = token.length + allowedDiff
  const minLen = Math.max(1, Math.min(textLength, desiredMin))
  const maxLen = Math.max(minLen, Math.min(textLength, desiredMax))

  let best: TokenMatch | null = null
  for (let start = 0; start < textLength; start += 1) {
    for (let len = minLen; len <= maxLen; len += 1) {
      const end = start + len
      if (end > textLength) break
      const segment = text.slice(start, end)
      const distance = levenshteinDistance(token, segment)
      const maxSegmentLength = Math.max(token.length, segment.length)
      if (maxSegmentLength === 0) continue
      const score = 1 - distance / maxSegmentLength
      const threshold = token.length <= 2
        ? 0.85
        : token.length <= 4
          ? 0.7
          : 0.6
      if (score < threshold) continue
      if (!best || score > best.score || (score === best.score && start < best.start)) {
        best = { score, start, end }
      }
    }
  }

  return best
}

function mergeRanges(ranges: HighlightRange[]): HighlightRange[] {
  if (ranges.length <= 1) return ranges
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged: HighlightRange[] = []
  let current = { ...sorted[0] }
  for (let index = 1; index < sorted.length; index += 1) {
    const next = sorted[index]
    if (next.start <= current.end) {
      current.end = Math.max(current.end, next.end)
    } else {
      merged.push(current)
      current = { ...next }
    }
  }
  merged.push(current)
  return merged
}

function nodeHasAllTags(node: TodoNode, tagIds: Set<string>): boolean {
  if (tagIds.size === 0) return true
  const nodeTags = node.tags ?? []
  if (nodeTags.length === 0) return false
  const nodeTagSet = new Set(nodeTags.map((tag) => tag.id))
  for (const tagId of tagIds) {
    if (!nodeTagSet.has(tagId)) return false
  }
  return true
}

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))

  for (let i = 0; i < rows; i += 1) {
    dp[i][0] = i
  }
  for (let j = 0; j < cols; j += 1) {
    dp[0][j] = j
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        const substitution = dp[i - 1][j - 1]
        const insertion = dp[i][j - 1]
        const deletion = dp[i - 1][j]
        dp[i][j] = Math.min(substitution, insertion, deletion) + 1
      }
    }
  }

  return dp[rows - 1][cols - 1]
}
