import type { PinnedListView } from '@/stores/TodoStore'

const STATUS_COMPLETED_SYMBOL = '-'
const STATUS_ACTIVE_SYMBOL = '+'

export function formatPinnedListsToText(lists: PinnedListView[]): string {
  if (lists.length === 0) {
    return ''
  }

  const lines: string[] = []

  lists.forEach((list, index) => {
    lines.push(`## ${list.title}`)

    if (list.todos.length > 0) {
      lines.push('')
      for (const todo of list.todos) {
        const statusSymbol = todo.completed ? STATUS_COMPLETED_SYMBOL : STATUS_ACTIVE_SYMBOL
        const tags = (todo.tags ?? [])
          .map((tag) => tag.name.trim())
          .filter((name) => name.length > 0)
        const tagsPart = tags.length > 0 ? `[${tags.join(', ')}] ` : ''
        const title = todo.title.trim()
        lines.push(`${statusSymbol} ${tagsPart}${title}`)
      }
    }

    if (index < lists.length - 1) {
      lines.push('')
    }
  })

  return lines.join('\n')
}
