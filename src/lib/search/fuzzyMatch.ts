export interface FuzzyMatchResult {
  score: number
  indices: [number, number][]
}

interface FuzzyMatchOptions {
  threshold?: number
}

const DEFAULT_THRESHOLD = 0.55

export function fuzzyMatch(query: string, text: string, options: FuzzyMatchOptions = {}): FuzzyMatchResult | null {
  const trimmed = query.trim()
  if (!trimmed) return null

  const normalizedText = text.toLocaleLowerCase()
  const normalizedQuery = trimmed.toLocaleLowerCase()
  const terms = normalizedQuery.split(/\s+/).filter(Boolean)
  if (terms.length === 0) return null

  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  const ranges: [number, number][] = []
  let totalScore = 0

  for (const term of terms) {
    const match = matchSingleTerm(term, normalizedText, threshold)
    if (!match) {
      return null
    }
    totalScore += match.score
    ranges.push(...match.indices)
  }

  const averageScore = totalScore / terms.length
  if (averageScore < threshold) {
    return null
  }

  const merged = mergeRanges(ranges)
  return { score: averageScore, indices: merged }
}

function matchSingleTerm(term: string, text: string, threshold: number): FuzzyMatchResult | null {
  if (!term) return null

  const exactIndex = text.indexOf(term)
  if (exactIndex !== -1) {
    return { score: 1, indices: [[exactIndex, exactIndex + term.length - 1]] }
  }

  const tolerance = Math.max(1, Math.floor(term.length / 3))
  const minWindow = Math.max(1, term.length - tolerance)
  const maxWindow = term.length + tolerance

  let bestScore = -Infinity
  let bestRange: [number, number] | null = null

  for (let start = 0; start < text.length; start += 1) {
    for (let length = minWindow; length <= maxWindow; length += 1) {
      const end = start + length
      if (end > text.length) break
      const candidate = text.slice(start, end)
      const distance = levenshtein(term, candidate)
      const maxLen = Math.max(term.length, candidate.length)
      const similarity = 1 - distance / maxLen
      if (similarity > bestScore) {
        bestScore = similarity
        bestRange = [start, end - 1]
      } else if (bestRange && similarity === bestScore) {
        const currentLen = bestRange[1] - bestRange[0]
        if (length - 1 < currentLen) {
          bestRange = [start, end - 1]
        }
      }
    }
  }

  if (!bestRange || bestScore < threshold) {
    return null
  }

  return { score: bestScore, indices: [bestRange] }
}

function mergeRanges(ranges: [number, number][]): [number, number][] {
  if (ranges.length <= 1) return ranges.map((range) => [...range] as [number, number])
  const sorted = [...ranges].sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []

  for (const range of sorted) {
    const last = merged[merged.length - 1]
    if (!last) {
      merged.push([...range] as [number, number])
      continue
    }
    if (range[0] <= last[1] + 1) {
      last[1] = Math.max(last[1], range[1])
    } else {
      merged.push([...range] as [number, number])
    }
  }

  return merged
}

function levenshtein(source: string, target: string): number {
  if (source === target) return 0
  if (source.length === 0) return target.length
  if (target.length === 0) return source.length

  const sourceChars = Array.from(source)
  const targetChars = Array.from(target)
  const targetLength = targetChars.length
  const distances = new Array<number>(targetLength + 1)

  for (let j = 0; j <= targetLength; j += 1) {
    distances[j] = j
  }

  for (let i = 1; i <= sourceChars.length; i += 1) {
    let previous = distances[0]
    distances[0] = i
    for (let j = 1; j <= targetLength; j += 1) {
      const temp = distances[j]
      if (sourceChars[i - 1] === targetChars[j - 1]) {
        distances[j] = previous
      } else {
        distances[j] = Math.min(previous, distances[j], distances[j - 1]) + 1
      }
      previous = temp
    }
  }

  return distances[targetLength]
}
