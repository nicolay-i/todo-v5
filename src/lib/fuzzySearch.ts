const MAX_ERROR_RATIO = 0.45

export type HighlightRange = [number, number]

export function findFuzzyMatches(text: string, rawQuery: string): HighlightRange[] | null {
  const normalizedQuery = rawQuery.trim().toLowerCase()
  if (!normalizedQuery) return null

  const normalizedText = text.toLowerCase()
  if (!normalizedText) return null

  const parts = normalizedQuery.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return null

  const ranges: HighlightRange[] = []
  for (const part of parts) {
    const match = findBestRange(normalizedText, part)
    if (!match) {
      return null
    }
    ranges.push([match.start, match.end])
  }

  return mergeRanges(ranges)
}

interface RangeMatch {
  start: number
  end: number
  score: number
}

function findBestRange(text: string, query: string): RangeMatch | null {
  const directIndex = text.indexOf(query)
  if (directIndex >= 0) {
    return { start: directIndex, end: directIndex + query.length, score: 0 }
  }

  const textLength = text.length
  const queryLength = query.length
  if (textLength === 0 || queryLength === 0) {
    return null
  }

  let best: RangeMatch | null = null
  const baseMinWindow = Math.max(1, queryLength - 2)
  const baseMaxWindow = Math.max(baseMinWindow, Math.min(textLength, Math.ceil(queryLength * 1.2)))

  for (let start = 0; start < textLength; start += 1) {
    const maxLenForStart = Math.min(baseMaxWindow, textLength - start)
    if (maxLenForStart <= 0) continue
    const minLenForStart = Math.min(Math.max(1, baseMinWindow), maxLenForStart)

    for (let len = minLenForStart; len <= maxLenForStart; len += 1) {
      const end = start + len
      const segment = text.slice(start, end)
      const distance = levenshtein(query, segment)
      const ratio = distance / Math.max(queryLength, segment.length)
      if (ratio > MAX_ERROR_RATIO) continue
      if (!best || ratio < best.score || (Math.abs(ratio - best.score) < 1e-3 && len < best.end - best.start)) {
        best = { start, end, score: ratio }
      }
    }
  }

  if (!best) {
    const distance = levenshtein(query, text)
    const ratio = distance / Math.max(queryLength, textLength)
    if (ratio <= MAX_ERROR_RATIO) {
      best = { start: 0, end: textLength, score: ratio }
    }
  }

  return best
}

function mergeRanges(ranges: HighlightRange[]): HighlightRange[] {
  if (ranges.length === 0) return []
  const sorted = [...ranges]
    .map(([start, end]) => [start, end] as HighlightRange)
    .sort((a, b) => a[0] - b[0])

  const result: HighlightRange[] = []
  for (const [start, end] of sorted) {
    if (result.length === 0) {
      result.push([start, end])
      continue
    }
    const last = result[result.length - 1]
    if (start <= last[1]) {
      last[1] = Math.max(last[1], end)
    } else {
      result.push([start, end])
    }
  }
  return result
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const prevRow = new Array(b.length + 1)
  const currentRow = new Array(b.length + 1)

  for (let j = 0; j <= b.length; j += 1) {
    prevRow[j] = j
  }

  for (let i = 1; i <= a.length; i += 1) {
    currentRow[0] = i
    const aChar = a.charCodeAt(i - 1)

    for (let j = 1; j <= b.length; j += 1) {
      const bChar = b.charCodeAt(j - 1)
      const cost = aChar === bChar ? 0 : 1
      currentRow[j] = Math.min(
        currentRow[j - 1] + 1,
        prevRow[j] + 1,
        prevRow[j - 1] + cost,
      )
    }

    for (let j = 0; j <= b.length; j += 1) {
      prevRow[j] = currentRow[j]
    }
  }

  return currentRow[b.length]
}
