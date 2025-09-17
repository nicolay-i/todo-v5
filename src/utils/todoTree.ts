import type { TodoNode } from '../stores/TodoStore'

export function isTodoSubtreeComplete(node: TodoNode): boolean {
  if (node.children.length === 0) {
    return node.completed
  }

  return node.children.every((child) => isTodoSubtreeComplete(child))
}
