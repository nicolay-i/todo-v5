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
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Текстовое представление</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Учитывает выбранный фильтр активности.</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!hasContent}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? (
            <>
              <FiCheck className="text-emerald-500 dark:text-emerald-400" />
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
        className="h-auto w-full resize-none rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 font-mono text-sm text-slate-700 dark:text-slate-200 shadow-inner focus:border-slate-400 dark:focus:border-slate-500 focus:outline-none"
      />
    </div>
  )
}
