import { useCallback, useEffect, useRef, useState } from 'react'

interface UseModalOptions {
  onAfterClose?: () => void
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean
  animationDuration?: number // ms, используется для задержки размонтирования
}

export interface UseModalResult {
  isOpen: boolean
  isMounted: boolean
  open: () => void
  close: () => void
  backdropProps: {
    onClick: (e: React.MouseEvent) => void
  }
  modalRef: React.RefObject<HTMLDivElement>
}

export const useModal = (options: UseModalOptions = {}): UseModalResult => {
  const { onAfterClose, closeOnEsc = true, closeOnBackdrop = true, animationDuration = 200 } = options
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const clearTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const open = useCallback(() => {
    clearTimer()
    setIsMounted(true)
    requestAnimationFrame(() => {
      setIsOpen(true)
    })
  }, [])

  const finalizeClose = useCallback(() => {
    setIsMounted(false)
    if (onAfterClose) onAfterClose()
  }, [onAfterClose])

  const close = useCallback(() => {
    setIsOpen(false)
    clearTimer()
    closeTimerRef.current = window.setTimeout(finalizeClose, animationDuration)
  }, [animationDuration, finalizeClose])

  // Esc handler
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeOnEsc, isOpen, close])

  // Focus trap (минимальный): при открытии ставим фокус в модал
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const prev = document.activeElement as HTMLElement | null
      const modalEl = modalRef.current
      const focusable = modalEl.querySelector(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement | null
      ;(focusable ?? modalEl).focus()
    }
  }, [isOpen])

  const backdropProps = {
    onClick: (e: React.MouseEvent) => {
      if (!closeOnBackdrop) return
      if (e.target === e.currentTarget) {
        close()
      }
    }
  }

  return { isOpen, isMounted, open, close, backdropProps, modalRef }
}
