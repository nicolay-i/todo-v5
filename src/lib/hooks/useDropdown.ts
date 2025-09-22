import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Групповое хранение открытых выпадашек: на группу — карта инстансов
const DROPDOWN_GROUPS: Map<string, Map<symbol, () => void>> = new Map()

type DropdownOptions = {
  hoverOpenDelay?: number
  closeDelay?: number
  animationDuration?: number
  groupKey?: string
}

type TriggerProps = {
  onClick: (e: React.MouseEvent) => void
  onMouseEnter: (e: React.MouseEvent) => void
  onMouseLeave: (e: React.MouseEvent) => void
  'aria-expanded': boolean
}

type MenuProps = {
  onMouseEnter: (e: React.MouseEvent) => void
  onMouseLeave: (e: React.MouseEvent) => void
}

export function useDropdown(options: DropdownOptions = {}) {
  const { hoverOpenDelay = 300, closeDelay = 300, animationDuration = 200, groupKey } = options

  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')

  const rootRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const idRef = useRef<symbol>(Symbol('dropdown'))
  const openHoverTimerRef = useRef<number | null>(null)
  const closeTimerRef = useRef<number | null>(null)
  const menuHeightRef = useRef(0)

  const updatePlacement = useCallback(() => {
    if (typeof window === 'undefined') return
    const root = rootRef.current
    if (!root) return

    const rootRect = root.getBoundingClientRect()
    const menu = menuRef.current

    let menuHeight = menuHeightRef.current
    if (menu) {
      const { height } = menu.getBoundingClientRect()
      menuHeight = height
      menuHeightRef.current = height
    }

    const spaceBelow = window.innerHeight - rootRect.bottom
    const spaceAbove = rootRect.top
    const gap = 8 // соответствие отступу mt-2/mb-2

    const shouldOpenUp = spaceBelow < menuHeight + gap && spaceAbove > spaceBelow
    setPlacement(shouldOpenUp ? 'top' : 'bottom')
  }, [])

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
    requestAnimationFrame(() => {
      updatePlacement()
      setIsOpen(true)
    })
  }, [clearCloseTimer, clearOpenHoverTimer, groupKey, isMounted, updatePlacement])

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
    const dropdownId = idRef.current
    let group = DROPDOWN_GROUPS.get(groupKey)
    if (!group) {
      group = new Map()
      DROPDOWN_GROUPS.set(groupKey, group)
    }
    group.set(dropdownId, () => close())
    return () => {
      const g = DROPDOWN_GROUPS.get(groupKey)
      if (!g) return
      g.delete(dropdownId)
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

  const getTriggerProps = useCallback<() => TriggerProps>(() => ({
    onClick: () => toggle(),
    onMouseEnter: () => scheduleOpenOnHover(),
    onMouseLeave: () => scheduleClose(),
    'aria-expanded': isOpen,
  }), [isOpen, scheduleClose, scheduleOpenOnHover, toggle])

  const getMenuProps = useCallback<() => MenuProps>(() => ({
    onMouseEnter: () => clearCloseTimer(),
    onMouseLeave: () => scheduleClose(),
  }), [clearCloseTimer, scheduleClose])

  const getMenuClassName = useCallback((base = '') => {
    const placementClasses =
      placement === 'top'
        ? 'bottom-full mb-2 origin-bottom-right'
        : 'top-full mt-2 origin-top-right'
    const hiddenTranslation = placement === 'top' ? 'translate-y-1' : '-translate-y-1'
    const anim = isOpen
      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
      : `opacity-0 ${hiddenTranslation} scale-95 pointer-events-none`
    const trans = 'transition-all duration-200'
    return [base, placementClasses, trans, anim].filter(Boolean).join(' ')
  }, [isOpen, placement])

  useEffect(() => {
    if (!isMounted) return
    updatePlacement()
    if (typeof window === 'undefined') return
    const handleRecalc = () => updatePlacement()
    window.addEventListener('resize', handleRecalc)
    window.addEventListener('scroll', handleRecalc, true)
    return () => {
      window.removeEventListener('resize', handleRecalc)
      window.removeEventListener('scroll', handleRecalc, true)
    }
  }, [isMounted, updatePlacement])

  return useMemo(() => ({
    rootRef,
    menuRef,
    isMounted,
    isOpen,
    placement,
    open,
    close,
    toggle,
    getTriggerProps,
    getMenuProps,
    getMenuClassName,
  }), [close, getMenuClassName, getMenuProps, getTriggerProps, isMounted, isOpen, open, placement, toggle])
}

export type UseDropdownReturn = ReturnType<typeof useDropdown>
