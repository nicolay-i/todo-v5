export interface HighlightSegment {
  text: string
  matched: boolean
}

interface TokenMatch {
  start: number
  end: number
  score: number
  distance: number
}

export interface FuzzyMatchResult {
  segments: HighlightSegment[]
  score: number
}

export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
}

export function fuzzyMatchText(text: string, tokens: string[]): FuzzyMatchResult | null {
  if (tokens.length === 0) {
    return {
      score: 1,
      segments: [{ text, matched: false }],
    }
  }

  const matches: TokenMatch[] = []
  let totalScore = 0

  for (const token of tokens) {
    const match = findBestTokenMatch(text, token)
    if (!match) {
      return null
    }
    matches.push(match)
    totalScore += match.score
  }

  const merged = mergeRanges(matches)
  const segments = buildSegments(text, merged)

  return {
    score: totalScore / tokens.length,
    segments,
  }
}

function findBestTokenMatch(text: string, token: string): TokenMatch | null {
  const normalizedText = text.toLowerCase()
  const normalizedToken = token.toLowerCase()

  if (normalizedToken.length === 0) {
    return null
  }

  const directIndex = normalizedText.indexOf(normalizedToken)
  if (directIndex !== -1) {
    return {
      start: directIndex,
      end: directIndex + normalizedToken.length,
      score: 1,
      distance: 0,
    }
  }

  const textLength = normalizedText.length
  const tokenLength = normalizedToken.length
  if (textLength === 0) {
    return null
  }

  const maxExtra = Math.max(1, Math.floor(tokenLength * 0.4))
  const minWindow = Math.max(1, tokenLength - maxExtra)
  const maxWindow = tokenLength + maxExtra

  let best: TokenMatch | null = null

  for (let start = 0; start < textLength; start += 1) {
    for (let window = minWindow; window <= maxWindow; window += 1) {
      const end = start + window
      if (end > textLength) break
      const substr = normalizedText.slice(start, end)
      const distance = levenshtein(normalizedToken, substr)
      const maxLen = Math.max(tokenLength, substr.length)
      if (maxLen === 0) continue
      const score = 1 - distance / maxLen
      if (!best || score > best.score || (score === best.score && (best.end - best.start) > window)) {
        best = { start, end, score, distance }
      }
    }
  }

  if (!best) return null

  const threshold = 0.5
  const maxDistance = Math.max(1, Math.round(tokenLength * 0.4))
  if (best.score < threshold || best.distance > maxDistance) {
    return null
  }

  return best
}

function mergeRanges(matches: TokenMatch[]): TokenMatch[] {
  if (matches.length === 0) return []
  const sorted = [...matches].sort((a, b) => a.start - b.start)
  const result: TokenMatch[] = []

  for (const current of sorted) {
    const last = result[result.length - 1]
    if (!last) {
      result.push({ ...current })
      continue
    }

    if (current.start <= last.end) {
      const mergedScore = Math.max(last.score, current.score)
      last.end = Math.max(last.end, current.end)
      last.score = mergedScore
      last.distance = Math.min(last.distance, current.distance)
    } else {
      result.push({ ...current })
    }
  }

  return result
}

function buildSegments(text: string, ranges: TokenMatch[]): HighlightSegment[] {
  if (ranges.length === 0) {
    return text.length > 0 ? [{ text, matched: false }] : []
  }

  const segments: HighlightSegment[] = []
  let cursor = 0

  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({ text: text.slice(cursor, range.start), matched: false })
    }
    if (range.end > range.start) {
      segments.push({ text: text.slice(range.start, range.end), matched: true })
    }
    cursor = Math.max(cursor, range.end)
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), matched: false })
  }

  return segments.filter((segment) => segment.text.length > 0)
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const matrix: number[][] = Array.from({ length: rows }, (_, i) => {
    const row = new Array(cols)
    row[0] = i
    return row
  })

  for (let j = 0; j < cols; j += 1) {
    matrix[0][j] = j
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  return matrix[rows - 1][cols - 1]
}
