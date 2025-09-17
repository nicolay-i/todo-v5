import type { TodoNode } from '../../stores/TodoStore'

export interface MindMapBranch {
  node: TodoNode
  children: MindMapBranch[]
}

const isNodeTreeCompleted = (node: TodoNode): boolean => {
  if (!node.completed) {
    return false
  }

  return node.children.every((child) => isNodeTreeCompleted(child))
}

export const buildMindMapBranches = (
  nodes: TodoNode[],
  hideCompleted: boolean,
): MindMapBranch[] => {
  const branches: MindMapBranch[] = []

  nodes.forEach((node) => {
    const children = buildMindMapBranches(node.children, hideCompleted)
    const allChildrenCompleted =
      node.children.length > 0 && node.children.every((child) => isNodeTreeCompleted(child))

    const shouldHide = hideCompleted && (node.completed || allChildrenCompleted) && children.length === 0

    if (!shouldHide) {
      branches.push({ node, children })
    }
  })

  return branches
}
