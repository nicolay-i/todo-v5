import type { Prisma } from '@prisma/client'
import { prisma } from './prisma'
import { MAX_DEPTH } from './constants'
import type { ActionRequest, AppState, TaskNode, TaskRecord } from '@/types/state'

type TransactionClient = Prisma.TransactionClient

type TaskCollections = {
  tasks: TaskRecord[]
  map: Map<string, TaskRecord>
  children: Map<string | null, TaskRecord[]>
}

export async function getAppState(): Promise<AppState> {
  const tasks = await prisma.task.findMany({
    select: { id: true, title: true, completed: true, pinned: true, order: true, parentId: true },
    orderBy: { order: 'asc' },
  })

  const { tree, map } = buildTree(tasks)

  const pinnedListsRaw = await prisma.pinnedList.findMany({
    orderBy: { position: 'asc' },
    include: {
      items: {
        orderBy: { position: 'asc' },
        select: {
          taskId: true,
        },
      },
    },
  })

  const pinnedLists = pinnedListsRaw.map((list) => ({
    id: list.id,
    title: list.title,
    position: list.position,
    todos: list.items
      .map((item) => map.get(item.taskId))
      .filter((task): task is TaskNode => Boolean(task && task.pinned)),
  }))

  return { todos: tree, pinnedLists }
}

export async function handleAction(action: ActionRequest): Promise<void> {
  switch (action.type) {
    case 'addTodo':
      await addTodo(action.parentId, action.title)
      break
    case 'updateTitle':
      await updateTitle(action.id, action.title)
      break
    case 'toggleTodo':
      await toggleTodo(action.id)
      break
    case 'deleteTodo':
      await deleteTodo(action.id)
      break
    case 'moveTodo':
      await moveTodo(action.id, action.targetParentId, action.targetIndex)
      break
    case 'togglePinned':
      await togglePinned(action.id)
      break
    case 'movePinnedTodo':
      await movePinnedTodo(action.id, action.targetListId, action.targetIndex)
      break
    case 'addPinnedList':
      await addPinnedList(action.title)
      break
    case 'renamePinnedList':
      await renamePinnedList(action.id, action.title)
      break
    case 'deletePinnedList':
      await deletePinnedList(action.id)
      break
    default:
      break
  }
}

async function addTodo(parentId: string | null, title: string) {
  const trimmed = title.trim()
  if (!trimmed) return

  if (parentId) {
    const collections = await loadTasks()
    const parent = collections.map.get(parentId)
    if (!parent) return

    const depth = getDepth(parentId, collections.map)
    if (depth >= MAX_DEPTH) return
  }

  const siblingCount = await prisma.task.count({ where: { parentId } })
  await prisma.task.create({
    data: {
      title: trimmed,
      parentId,
      order: siblingCount,
    },
  })
}

async function updateTitle(id: string, title: string) {
  const trimmed = title.trim()
  if (!trimmed) return

  await prisma.task.update({
    where: { id },
    data: { title: trimmed },
  })
}

async function toggleTodo(id: string) {
  const task = await prisma.task.findUnique({ where: { id }, select: { completed: true } })
  if (!task) return

  await prisma.task.update({ where: { id }, data: { completed: !task.completed } })
}

async function deleteTodo(id: string) {
  const collections = await loadTasks()
  if (!collections.map.has(id)) return

  const subtree = collectSubtree(id, collections.children)
  const parentId = collections.map.get(id)?.parentId ?? null

  await prisma.$transaction([
    prisma.pinnedListItem.deleteMany({ where: { taskId: { in: subtree } } }),
    prisma.task.deleteMany({ where: { id: { in: subtree } } }),
  ])

  await normalizeOrder(parentId)
}

async function moveTodo(id: string, targetParentId: string | null, targetIndex: number) {
  const collections = await loadTasks()
  const task = collections.map.get(id)
  if (!task) return

  const subtreeDepth = getSubtreeDepth(id, collections.children)

  if (targetParentId === null) {
    if (subtreeDepth > MAX_DEPTH) return
  } else {
    const parent = collections.map.get(targetParentId)
    if (!parent) return
    if (containsNode(id, targetParentId, collections.children)) return

    const parentDepth = getDepth(targetParentId, collections.map)
    if (parentDepth + 1 + subtreeDepth > MAX_DEPTH) return
  }

  const sourceParentId = task.parentId ?? null
  const sourceChildren = [...(collections.children.get(sourceParentId) ?? [])]
  const targetChildren = targetParentId === sourceParentId
    ? sourceChildren
    : [...(collections.children.get(targetParentId ?? null) ?? [])]

  const currentIndex = sourceChildren.findIndex((child) => child.id === id)
  if (currentIndex === -1) return

  let index = targetIndex
  if (targetParentId === sourceParentId && index > currentIndex) {
    index -= 1
  }

  if (index < 0) index = 0
  if (index > targetChildren.length) index = targetChildren.length

  const sourceWithout = sourceChildren.filter((child) => child.id !== id)
  const targetWith = targetParentId === sourceParentId
    ? [...sourceWithout]
    : targetChildren

  if (targetParentId === sourceParentId) {
    targetWith.splice(index, 0, task)

    await prisma.$transaction(
      targetWith.map((child, order) =>
        prisma.task.update({ where: { id: child.id }, data: { order } })
      ),
    )
    return
  }

  const insertList = [...targetWith]
  insertList.splice(index, 0, task)

  await prisma.$transaction(async (tx) => {
    await tx.task.update({ where: { id }, data: { parentId: targetParentId } })

    await Promise.all(
      sourceWithout.map((child, order) =>
        tx.task.update({ where: { id: child.id }, data: { order } })
      ),
    )

    await Promise.all(
      insertList.map((child, order) =>
        tx.task.update({ where: { id: child.id }, data: { order } })
      ),
    )
  })
}

async function togglePinned(id: string) {
  const task = await prisma.task.findUnique({ where: { id }, select: { pinned: true } })
  if (!task) return

  if (task.pinned) {
    await prisma.$transaction([
      prisma.task.update({ where: { id }, data: { pinned: false } }),
      prisma.pinnedListItem.deleteMany({ where: { taskId: id } }),
    ])
    return
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({ where: { id }, data: { pinned: true } })
    const primary = await getPrimaryList(tx)
    const existing = await tx.pinnedListItem.findUnique({
      where: { listId_taskId: { listId: primary.id, taskId: id } },
    })
    if (existing) return

    const position = await tx.pinnedListItem.count({ where: { listId: primary.id } })
    await tx.pinnedListItem.create({
      data: {
        listId: primary.id,
        taskId: id,
        position,
      },
    })
  })
}

async function movePinnedTodo(id: string, targetListId: string, targetIndex: number) {
  const task = await prisma.task.findUnique({ where: { id }, select: { pinned: true } })
  if (!task?.pinned) return

  const targetList = await prisma.pinnedList.findUnique({ where: { id: targetListId }, select: { id: true } })
  if (!targetList) return

  const item = await prisma.pinnedListItem.findFirst({ where: { taskId: id } })
  if (!item) return

  const sameList = item.listId === targetListId

  if (sameList) {
    const items = await prisma.pinnedListItem.findMany({
      where: { listId: item.listId },
      orderBy: { position: 'asc' },
    })

    const currentIndex = items.findIndex((record) => record.id === item.id)
    if (currentIndex === -1) return

    let index = targetIndex
    if (index > currentIndex) index -= 1
    if (index < 0) index = 0

    const reordered = items.filter((record) => record.id !== item.id)
    if (index > reordered.length) index = reordered.length
    reordered.splice(index, 0, item)

    await prisma.$transaction(
      reordered.map((record, position) =>
        prisma.pinnedListItem.update({ where: { id: record.id }, data: { position } }),
      ),
    )
    return
  }

  const sourceItems = await prisma.pinnedListItem.findMany({
    where: { listId: item.listId },
    orderBy: { position: 'asc' },
  })

  const targetItems = await prisma.pinnedListItem.findMany({
    where: { listId: targetListId },
    orderBy: { position: 'asc' },
  })

  let index = targetIndex
  if (index < 0) index = 0
  if (index > targetItems.length) index = targetItems.length

  const sourceWithout = sourceItems.filter((record) => record.id !== item.id)
  const targetWith = [...targetItems]
  targetWith.splice(index, 0, item)

  await prisma.$transaction(async (tx) => {
    await tx.pinnedListItem.update({ where: { id: item.id }, data: { listId: targetListId } })

    await Promise.all(
      sourceWithout.map((record, position) =>
        tx.pinnedListItem.update({ where: { id: record.id }, data: { position } }),
      ),
    )

    await Promise.all(
      targetWith.map((record, position) =>
        tx.pinnedListItem.update({ where: { id: record.id }, data: { position } }),
      ),
    )
  })
}

async function addPinnedList(title: string) {
  const trimmed = title.trim()
  if (!trimmed) return

  const position = await prisma.pinnedList.count()
  await prisma.pinnedList.create({ data: { title: trimmed, position } })
}

async function renamePinnedList(id: string, title: string) {
  const trimmed = title.trim()
  if (!trimmed) return

  await prisma.pinnedList.update({ where: { id }, data: { title: trimmed } })
}

async function deletePinnedList(id: string) {
  const list = await prisma.pinnedList.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!list) return

  const primary = await prisma.pinnedList.findFirst({ orderBy: { position: 'asc' } })
  if (!primary || primary.id === id) return

  await prisma.$transaction(async (tx) => {
    for (const item of list.items) {
      const exists = await tx.pinnedListItem.findUnique({
        where: { listId_taskId: { listId: primary.id, taskId: item.taskId } },
      })
      if (exists) continue

      const position = await tx.pinnedListItem.count({ where: { listId: primary.id } })
      await tx.pinnedListItem.create({
        data: { listId: primary.id, taskId: item.taskId, position },
      })
    }

    await tx.pinnedList.delete({ where: { id } })
    await renumberPinnedLists(tx)
  })
}

async function getPrimaryList(tx: TransactionClient) {
  const existing = await tx.pinnedList.findFirst({ orderBy: { position: 'asc' } })
  if (existing) {
    return existing
  }

  return tx.pinnedList.create({ data: { title: 'Главное', position: 0 } })
}

async function renumberPinnedLists(tx: TransactionClient) {
  const lists = await tx.pinnedList.findMany({ orderBy: { position: 'asc' } })
  await Promise.all(
    lists.map((list, index) =>
      tx.pinnedList.update({ where: { id: list.id }, data: { position: index } }),
    ),
  )
}

async function normalizeOrder(parentId: string | null) {
  const siblings = await prisma.task.findMany({
    where: { parentId },
    orderBy: { order: 'asc' },
    select: { id: true },
  })

  await prisma.$transaction(
    siblings.map((task, index) =>
      prisma.task.update({ where: { id: task.id }, data: { order: index } }),
    ),
  )
}

async function loadTasks(): Promise<TaskCollections> {
  const tasks = await prisma.task.findMany({
    select: { id: true, title: true, completed: true, pinned: true, order: true, parentId: true },
    orderBy: { order: 'asc' },
  })

  const map = new Map<string, TaskRecord>()
  const children = new Map<string | null, TaskRecord[]>()

  for (const task of tasks) {
    map.set(task.id, task)
    const key = task.parentId ?? null
    const list = children.get(key)
    if (list) {
      list.push(task)
    } else {
      children.set(key, [task])
    }
  }

  for (const list of children.values()) {
    list.sort((a, b) => a.order - b.order)
  }

  return { tasks, map, children }
}

function buildTree(tasks: TaskRecord[]): { tree: TaskNode[]; map: Map<string, TaskNode> } {
  const nodes = tasks.map<TaskNode>((task) => ({ ...task, children: [] }))
  const map = new Map<string, TaskNode>()
  nodes.forEach((node) => map.set(node.id, node))

  nodes.forEach((node) => {
    if (node.parentId) {
      const parent = map.get(node.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  const sortChildren = (node: TaskNode) => {
    node.children.sort((a, b) => a.order - b.order)
    node.children.forEach(sortChildren)
  }

  const tree = nodes.filter((node) => node.parentId === null).sort((a, b) => a.order - b.order)
  tree.forEach(sortChildren)

  return { tree, map }
}

function collectSubtree(id: string, children: Map<string | null, TaskRecord[]>): string[] {
  const result: string[] = [id]
  const stack = [id]

  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    const nodes = children.get(current) ?? []
    for (const node of nodes) {
      result.push(node.id)
      stack.push(node.id)
    }
  }

  return result
}

function getDepth(id: string, map: Map<string, TaskRecord>): number {
  let depth = 0
  let current = map.get(id)
  while (current?.parentId) {
    depth += 1
    current = map.get(current.parentId)
  }
  return depth
}

function getSubtreeDepth(id: string, children: Map<string | null, TaskRecord[]>): number {
  const nodes = children.get(id) ?? []
  if (nodes.length === 0) return 0
  let max = 0
  for (const node of nodes) {
    const depth = 1 + getSubtreeDepth(node.id, children)
    if (depth > max) {
      max = depth
    }
  }
  return max
}

function containsNode(sourceId: string, targetId: string, children: Map<string | null, TaskRecord[]>): boolean {
  const stack = [sourceId]
  while (stack.length > 0) {
    const current = stack.pop()
    if (!current) continue
    if (current === targetId) {
      return true
    }
    const nodes = children.get(current) ?? []
    nodes.forEach((node) => stack.push(node.id))
  }
  return false
}
