import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Групповое хранение открытых выпадашек: на группу — карта инстансов
const DROPDOWN_GROUPS: Map<string, Map<symbol, () => void>> = new Map()

type DropdownOptions = {
  openOnHover?: boolean
  closeOnTriggerLeave?: boolean
  hoverOpenDelay?: number
  closeDelay?: number
  animationDuration?: number
  groupKey?: string
}

type TriggerProps = {
  onClick: (e: React.MouseEvent) => void
  onMouseEnter?: (e: React.MouseEvent) => void
  onMouseLeave?: (e: React.MouseEvent) => void
  'aria-expanded': boolean
}

type MenuProps = {
  onMouseEnter: (e: React.MouseEvent) => void
  onMouseLeave: (e: React.MouseEvent) => void
}

export function useDropdown(options: DropdownOptions = {}) {
  const {
    openOnHover = true,
    closeOnTriggerLeave = openOnHover,
    hoverOpenDelay = 300,
    closeDelay = 300,
    animationDuration = 200,
    groupKey,
  } = options

  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef<symbol>(Symbol('dropdown'))
  const openHoverTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const clearOpenHoverTimer = useCallback(() => {
    if (openHoverTimerRef.current !== null) {
      clearTimeout(openHoverTimerRef.current)
      openHoverTimerRef.current = null
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const open = useCallback(() => {
    clearCloseTimer()
    clearOpenHoverTimer()
    // Закрываем остальные в группе
    if (groupKey) {
      const group = DROPDOWN_GROUPS.get(groupKey)
      if (group) {
        for (const [key, closeFn] of group.entries()) {
          if (key !== idRef.current) closeFn()
        }
      }
    }
    if (!isMounted) setIsMounted(true)
    requestAnimationFrame(() => setIsOpen(true))
  }, [clearCloseTimer, clearOpenHoverTimer, groupKey, isMounted])

  const close = useCallback(() => {
    clearCloseTimer()
    clearOpenHoverTimer()
    if (!isMounted && !isOpen) return
    setIsOpen(false)
    window.setTimeout(() => setIsMounted(false), animationDuration)
  }, [animationDuration, clearCloseTimer, clearOpenHoverTimer, isMounted, isOpen])

  const toggle = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [close, isOpen, open])

  const scheduleOpenOnHover = useCallback(() => {
    clearOpenHoverTimer()
    openHoverTimerRef.current = window.setTimeout(() => open(), hoverOpenDelay)
  }, [clearOpenHoverTimer, hoverOpenDelay, open])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => close(), closeDelay)
  }, [clearCloseTimer, close, closeDelay])

  // click outside to close
  useEffect(() => {
    if (!isMounted) return
    const onDocMouseDown = (e: MouseEvent) => {
      const root = rootRef.current
      if (!root) return
      if (!root.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [close, isMounted])

  // Регистрация в группе для взаимного закрытия
  useEffect(() => {
    if (!groupKey) return
    let group = DROPDOWN_GROUPS.get(groupKey)
    if (!group) {
      group = new Map()
      DROPDOWN_GROUPS.set(groupKey, group)
    }
    const id = idRef.current
    group.set(id, () => close())
    return () => {
      const g = DROPDOWN_GROUPS.get(groupKey)
      if (!g) return
      g.delete(id)
      if (g.size === 0) DROPDOWN_GROUPS.delete(groupKey)
    }
  }, [close, groupKey])

  // cleanup timers
  useEffect(() => {
    return () => {
      clearOpenHoverTimer()
      clearCloseTimer()
    }
  }, [clearCloseTimer, clearOpenHoverTimer])

  const getTriggerProps = useCallback<() => TriggerProps>(() => {
    const props: TriggerProps = {
      onClick: () => toggle(),
      'aria-expanded': isOpen,
    }
    if (openOnHover) {
      props.onMouseEnter = () => scheduleOpenOnHover()
    }
    if (closeOnTriggerLeave) {
      props.onMouseLeave = () => scheduleClose()
    }
    return props
  }, [closeOnTriggerLeave, isOpen, openOnHover, scheduleClose, scheduleOpenOnHover, toggle])

  const getMenuProps = useCallback<() => MenuProps>(() => ({
    onMouseEnter: () => clearCloseTimer(),
    onMouseLeave: () => scheduleClose(),
  }), [clearCloseTimer, scheduleClose])

  const getMenuClassName = useCallback((base = '') => {
    const anim = isOpen
      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
      : 'opacity-0 -translate-y-1 scale-95 pointer-events-none'
    const trans = 'transition-all duration-200'
    return [base, trans, anim].filter(Boolean).join(' ')
  }, [isOpen])

  return useMemo(() => ({
    rootRef,
    isMounted,
    isOpen,
    open,
    close,
    toggle,
    getTriggerProps,
    getMenuProps,
    getMenuClassName,
  }), [close, getMenuClassName, getMenuProps, getTriggerProps, isMounted, isOpen, open, toggle])
}

export type UseDropdownReturn = ReturnType<typeof useDropdown>
