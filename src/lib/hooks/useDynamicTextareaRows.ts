import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Хук динамического определения количества строк для textarea.
 * Поведение соответствует прежней логике в `TodoItem`: вычисление только при входе
 * в режим редактирования и вручную по blur, чтобы не дергать layout на каждый ввод.
 */
export function useDynamicTextareaRows(value: string, active: boolean, maxRows = 12) {
  const [rows, setRows] = useState(1)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLDivElement | null>(null)

  const recalcRows = useCallback(() => {
    const wrapEl = wrapRef.current
    const measureEl = measureRef.current
    if (!wrapEl || !measureEl) return

    const width = wrapEl.clientWidth
    if (width <= 0) return

    measureEl.style.width = `${width}px`
    measureEl.textContent = value || ''

    const style = window.getComputedStyle(measureEl)
    const lineHeightPx = parseFloat(style.lineHeight || '20')
    const totalHeight = measureEl.scrollHeight
    let nextRows = lineHeightPx > 0 ? Math.ceil(totalHeight / lineHeightPx) : 1
    if (!Number.isFinite(nextRows) || nextRows <= 0) nextRows = 1
    nextRows = Math.min(nextRows, maxRows)
    setRows(nextRows)
  }, [value, maxRows])

  // Вычисление при входе в активный режим
  useEffect(() => {
    if (!active) return
    setRows(1)
    const raf = requestAnimationFrame(() => {
      recalcRows()
    })
    return () => cancelAnimationFrame(raf)
  }, [active, recalcRows])

  // Пересчет при ресайзе окна, когда активно
  useEffect(() => {
    if (!active) return
    const handler = () => recalcRows()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [active, recalcRows])

  return { rows, wrapRef, measureRef, recalcRows }
}

export type UseDynamicTextareaRowsResult = ReturnType<typeof useDynamicTextareaRows>