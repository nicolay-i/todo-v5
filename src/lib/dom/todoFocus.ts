const TODO_SELECTOR = '[data-todo-focusable="true"]'

export type TodoFocusScope = 'list' | 'pinned'

function queryFocusables(scope?: string): HTMLElement[] {
  const selector = scope
    ? `${TODO_SELECTOR}[data-focus-scope="${scope}"]`
    : TODO_SELECTOR
  return Array.from(document.querySelectorAll<HTMLElement>(selector))
}

export function focusTodoByOffset(current: HTMLElement, offset: number): boolean {
  if (!current) return false
  const scope = current.dataset.focusScope
  if (!scope) return false
  const items = queryFocusables(scope)
  if (items.length === 0) return false
  const index = items.findIndex((element) => element === current)
  if (index === -1) return false
  const nextIndex = Math.min(Math.max(index + offset, 0), items.length - 1)
  if (nextIndex === index) return false
  const target = items[nextIndex]
  target.focus()
  target.scrollIntoView({ block: 'nearest' })
  return true
}

export function focusEdgeTodo(scope: TodoFocusScope, toEnd = false): boolean {
  const items = queryFocusables(scope)
  if (items.length === 0) return false
  const target = toEnd ? items[items.length - 1] : items[0]
  target.focus()
  target.scrollIntoView({ block: 'nearest' })
  return true
}

export function isInputLike(element: EventTarget | null): boolean {
  if (!(element instanceof HTMLElement)) return false
  if (element.isContentEditable) return true
  const tag = element.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON'
}
