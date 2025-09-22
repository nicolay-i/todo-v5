'use client'

import type { ReactNode } from 'react'

import type { HighlightRange } from '@/lib/search'

interface HighlightTextProps {
  text: string
  ranges: HighlightRange[]
}

export const HighlightText = ({ text, ranges }: HighlightTextProps) => {
  if (!text) {
    return null
  }

  if (!ranges || ranges.length === 0) {
    return <>{text}</>
  }

  const segments: ReactNode[] = []
  let cursor = 0
  const sorted = [...ranges].sort((a, b) => a.start - b.start)

  sorted.forEach((range, index) => {
    const start = clamp(range.start, 0, text.length)
    const end = clamp(range.end, start, text.length)
    if (start > cursor) {
      segments.push(
        <span key={`plain-${index}-${cursor}`}>{text.slice(cursor, start)}</span>,
      )
    }
    if (end > start) {
      segments.push(
        <mark
          key={`mark-${index}-${start}`}
          className="rounded bg-amber-200/70 px-1 py-0.5 text-slate-900"
        >
          {text.slice(start, end)}
        </mark>,
      )
    }
    cursor = end
  })

  if (cursor < text.length) {
    segments.push(<span key={`plain-tail-${cursor}`}>{text.slice(cursor)}</span>)
  }

  return <>{segments}</>
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}
