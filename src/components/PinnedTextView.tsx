'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'

import { formatPinnedListsToText } from '@/lib/formatPinnedText'
import type { PinnedListView } from '@/stores/TodoStore'

interface PinnedTextViewProps {
  lists: PinnedListView[]
}

export const PinnedTextView = ({ lists }: PinnedTextViewProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)

  const textRepresentation = useMemo(() => formatPinnedListsToText(lists), [lists])
  const hasContent = textRepresentation.trim().length > 0

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copied])

  useEffect(() => {
    setCopied(false)
  }, [textRepresentation])

  const handleCopy = async () => {
    if (!hasContent) return

    const text = textRepresentation
    let success = false

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        success = true
      }
    } catch (error) {
      success = false
    }

    if (!success) {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.focus()
        textarea.select()
        try {
          success = document.execCommand('copy')
        } catch (error) {
          success = false
        }
        window.getSelection()?.removeAllRanges()
      }
    }

    if (success) {
      setCopied(true)
    }
  }

  const linesCount = textRepresentation.split('\n').length
  const rows = Math.min(Math.max(linesCount + 2, 6), 24)

  const displayValue = hasContent ? textRepresentation : 'Нет данных для отображения'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Текстовое представление</h3>
          <p className="text-xs text-slate-500">Учитывает выбранный фильтр активности.</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasContent}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? (
            <>
              <FiCheck className="text-emerald-500" />
              Скопировано
            </>
          ) : (
            <>
              <FiCopy />
              Копировать
            </>
          )}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        readOnly
        value={displayValue}
        rows={rows}
        className="h-auto w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700 shadow-inner focus:border-slate-400 focus:outline-none"
      />
    </div>
  )
}
