import type { Todo } from '@prisma/client'
import { MAX_DEPTH } from './constants'
import { prisma } from './prisma'
import type { PinnedListState, TodoNode, TodoState } from './types'

interface SerializableTodoNode {
  id: string
  title: string
  completed: boolean
  pinned: boolean
  position: number
  children?: SerializableTodoNode[]
}

interface SerializablePinnedList {
  id: string
  title: string
  position: number
  isPrimary: boolean
  order: string[]
}

interface SerializableTodoState {
  todos: SerializableTodoNode[]
  pinnedLists: SerializablePinnedList[]
}

let schemaInitialized = false

async function ensureDatabase() {
  // No-op: schema is managed by Prisma migrations for Postgres
  if (schemaInitialized) return
  schemaInitialized = true
}

async function ensureSeedData() {
  await ensureDatabase()

  let primary = await prisma.pinnedList.findFirst({
    orderBy: { position: 'asc' },
  })

  if (!primary) {
    primary = await prisma.pinnedList.create({
      data: {
        title: 'Главное',
        isPrimary: true,
        position: 0,
      },
    })
  } else if (!primary.isPrimary) {
    primary = await prisma.pinnedList.update({
      where: { id: primary.id },
      data: { isPrimary: true },
    })
  }

  const count = await prisma.todo.count()
  if (count > 0) {
    return
  }

  await prisma.$transaction(async (tx) => {
    const qaChecklist = await tx.todo.create({
      data: {
        title: 'Проверка перед релизом',
        completed: false,
        pinned: false,
        position: 0,
      },
    })

    await tx.todo.createMany({
      data: [
        {
          title: 'Прогнать авто-тесты',
          completed: true,
          pinned: false,
          parentId: qaChecklist.id,
          position: 0,
        },
        {
          title: 'Проверить ручные сценарии',
          completed: false,
          pinned: false,
          parentId: qaChecklist.id,
          position: 1,
        },
        {
          title: 'Согласовать список изменений',
          completed: false,
          pinned: false,
          parentId: qaChecklist.id,
          position: 2,
        },
      ],
    })

    const designIteration = await tx.todo.create({
      data: {
        title: 'Прототип интерфейса',
        completed: false,
        pinned: false,
        position: 1,
      },
    })

    const feedback = await tx.todo.create({
      data: {
        title: 'Собрать обратную связь',
        completed: false,
        pinned: false,
        parentId: designIteration.id,
        position: 1,
      },
    })

    await tx.todo.createMany({
      data: [
        {
          title: 'Скетч основных экранов',
          completed: false,
          pinned: false,
          parentId: designIteration.id,
          position: 0,
        },
        {
          title: 'Созвон с командой продукта',
          completed: false,
          pinned: false,
          parentId: feedback.id,
          position: 0,
        },
      ],
    })
  })
}

async function getPrimaryList() {
  await ensureSeedData()
  const primary = await prisma.pinnedList.findFirst({
    orderBy: { position: 'asc' },
  })
  if (!primary) {
    throw new Error('Primary pinned list is missing')
  }
  if (!primary.isPrimary) {
    return prisma.pinnedList.update({
      where: { id: primary.id },
      data: { isPrimary: true },
    })
  }
  return primary
}

async function getNextTodoPosition(parentId: string | null) {
  await ensureSeedData()
  const lastTodo = await prisma.todo.findFirst({
    where: { parentId },
    orderBy: { position: 'desc' },
  })
  return (lastTodo?.position ?? -1) + 1
}

async function getNextPinnedListPosition() {
  await ensureSeedData()
  const lastList = await prisma.pinnedList.findFirst({
    orderBy: { position: 'desc' },
  })
  return (lastList?.position ?? -1) + 1
}

async function getNextPinnedTodoPosition(listId: string) {
  await ensureSeedData()
  const lastEntry = await prisma.pinnedTodo.findFirst({
    where: { pinnedListId: listId },
    orderBy: { position: 'desc' },
  })
  return (lastEntry?.position ?? -1) + 1
}

function buildTree(todos: Todo[]): TodoNode[] {
  const nodes = new Map<string, TodoNode>()
  const roots: TodoNode[] = []

  const sorted = [...todos].sort((a, b) => a.position - b.position)

  for (const todo of sorted) {
    nodes.set(todo.id, { ...todo, children: [] })
  }

  for (const todo of sorted) {
    const node = nodes.get(todo.id)!
    if (todo.parentId) {
      const parent = nodes.get(todo.parentId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  const sortChildren = (items: TodoNode[]) => {
    items.sort((a, b) => a.position - b.position)
    items.forEach((child) => sortChildren(child.children))
  }

  sortChildren(roots)

  return roots
}

async function composePinnedLists(): Promise<PinnedListState[]> {
  const [lists, entries] = await Promise.all([
    prisma.pinnedList.findMany({ orderBy: { position: 'asc' } }),
    prisma.pinnedTodo.findMany({ orderBy: [{ pinnedListId: 'asc' }, { position: 'asc' }] }),
  ])

  return lists.map((list) => ({
    id: list.id,
    title: list.title,
    order: entries.filter((entry) => entry.pinnedListId === list.id).map((entry) => entry.todoId),
    isPrimary: list.isPrimary,
    position: list.position,
  }))
}

export async function getTodoState(): Promise<TodoState> {
  await ensureSeedData()

  const todos = await prisma.todo.findMany()
  const tree = buildTree(todos)
  const pinnedLists = await composePinnedLists()

  return { todos: tree, pinnedLists }
}

async function getTodoDepth(id: string): Promise<number> {
  await ensureSeedData()
  let depth = 0
  let current = await prisma.todo.findUnique({ where: { id }, select: { parentId: true } })
  while (current?.parentId) {
    depth += 1
    current = await prisma.todo.findUnique({ where: { id: current.parentId }, select: { parentId: true } })
  }
  return depth
}

async function getSubtreeDepth(id: string): Promise<number> {
  await ensureSeedData()
  const stack: string[] = [id]
  let maxDepth = 0
  const depthMap = new Map<string, number>([[id, 0]])

  while (stack.length > 0) {
    const currentId = stack.pop()!
    const depth = depthMap.get(currentId) ?? 0
    const children = await prisma.todo.findMany({
      where: { parentId: currentId },
      select: { id: true },
    })
    for (const child of children) {
      const childDepth = depth + 1
      maxDepth = Math.max(maxDepth, childDepth)
      depthMap.set(child.id, childDepth)
      stack.push(child.id)
    }
  }

  return maxDepth
}

export async function addTodo(parentId: string | null, title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState()
  }

  await ensureSeedData()

  if (parentId) {
    const parentDepth = await getTodoDepth(parentId)
    if (parentDepth >= MAX_DEPTH) {
      return getTodoState()
    }
  }

  const position = await getNextTodoPosition(parentId)
  await prisma.todo.create({
    data: {
      title: trimmed,
      parentId,
      position,
    },
  })

  return getTodoState()
}

export async function updateTodoTitle(id: string, title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState()
  }

  await ensureSeedData()

  await prisma.todo.update({
    where: { id },
    data: { title: trimmed },
  })

  return getTodoState()
}

export async function toggleTodoCompleted(id: string): Promise<TodoState> {
  await ensureSeedData()
  const todo = await prisma.todo.findUnique({ where: { id } })
  if (!todo) {
    return getTodoState()
  }

  await prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed },
  })

  return getTodoState()
}

export async function deleteTodo(id: string): Promise<TodoState> {
  await ensureSeedData()
  await prisma.todo.delete({ where: { id } })
  return getTodoState()
}

export async function moveTodo(
  id: string,
  targetParentId: string | null,
  targetIndex: number,
): Promise<TodoState> {
  await ensureSeedData()
  const todo = await prisma.todo.findUnique({ where: { id } })
  if (!todo) {
    return getTodoState()
  }

  if (targetParentId) {
    const parentExists = await prisma.todo.findUnique({ where: { id: targetParentId } })
    if (!parentExists) {
      return getTodoState()
    }

    if (parentExists.id === id) {
      return getTodoState()
    }

    const parentDepth = await getTodoDepth(targetParentId)
    const subtreeDepth = await getSubtreeDepth(id)
    if (parentDepth + 1 + subtreeDepth > MAX_DEPTH) {
      return getTodoState()
    }

    // ensure not moving into descendant
    const stack = [id]
    while (stack.length > 0) {
      const currentId = stack.pop()!
      if (currentId === targetParentId) {
        return getTodoState()
      }
      const children = await prisma.todo.findMany({
        where: { parentId: currentId },
        select: { id: true },
      })
      stack.push(...children.map((child) => child.id))
    }
  } else {
    const subtreeDepth = await getSubtreeDepth(id)
    if (subtreeDepth > MAX_DEPTH) {
      return getTodoState()
    }
  }

  const sourceParentId = todo.parentId

  const sourceSiblings = await prisma.todo.findMany({
    where: { parentId: sourceParentId },
    orderBy: { position: 'asc' },
  })

  const targetSiblings = targetParentId === sourceParentId
    ? sourceSiblings
    : await prisma.todo.findMany({
        where: { parentId: targetParentId },
        orderBy: { position: 'asc' },
      })

  const currentIndex = sourceSiblings.findIndex((item) => item.id === id)
  if (currentIndex === -1) {
    return getTodoState()
  }

  let nextIndex = targetIndex
  if (targetParentId === sourceParentId && nextIndex > currentIndex) {
    nextIndex -= 1
  }

  if (targetParentId === sourceParentId) {
    const order = sourceSiblings.map((item) => item.id)
    order.splice(currentIndex, 1)
    const bounded = Math.min(Math.max(nextIndex, 0), order.length)
    order.splice(bounded, 0, id)

    await prisma.$transaction(
      order.map((todoId, index) =>
        prisma.todo.update({
          where: { id: todoId },
          data: {
            parentId: sourceParentId,
            position: index,
          },
        }),
      ),
    )

    return getTodoState()
  }

  const sourceOrder = sourceSiblings.filter((item) => item.id !== id).map((item) => item.id)
  const targetOrder = targetSiblings.map((item) => item.id)
  const bounded = Math.min(Math.max(nextIndex, 0), targetOrder.length)
  targetOrder.splice(bounded, 0, id)

  await prisma.$transaction([
    ...sourceOrder.map((todoId, index) =>
      prisma.todo.update({
        where: { id: todoId },
        data: {
          parentId: sourceParentId,
          position: index,
        },
      }),
    ),
    ...targetOrder.map((todoId, index) =>
      prisma.todo.update({
        where: { id: todoId },
        data: {
          parentId: targetParentId,
          position: index,
        },
      }),
    ),
  ])

  return getTodoState()
}

export async function togglePinned(id: string): Promise<TodoState> {
  await ensureSeedData()
  const todo = await prisma.todo.findUnique({ where: { id } })
  if (!todo) {
    return getTodoState()
  }

  if (todo.pinned) {
    await prisma.$transaction([
      prisma.todo.update({ where: { id }, data: { pinned: false } }),
      prisma.pinnedTodo.deleteMany({ where: { todoId: id } }),
    ])
  } else {
    const primary = await getPrimaryList()
    const position = await getNextPinnedTodoPosition(primary.id)
    await prisma.$transaction([
      prisma.todo.update({ where: { id }, data: { pinned: true } }),
      prisma.pinnedTodo.create({
        data: {
          todoId: id,
          pinnedListId: primary.id,
          position,
        },
      }),
    ])
  }

  return getTodoState()
}

export async function movePinnedTodo(
  todoId: string,
  targetListId: string,
  targetIndex: number,
): Promise<TodoState> {
  await ensureSeedData()
  const entry = await prisma.pinnedTodo.findFirst({ where: { todoId } })
  if (!entry) {
    return getTodoState()
  }

  const targetList = await prisma.pinnedList.findUnique({ where: { id: targetListId } })
  if (!targetList) {
    return getTodoState()
  }

  const sourceListId = entry.pinnedListId
  const sameList = sourceListId === targetListId

  const sourceEntries = await prisma.pinnedTodo.findMany({
    where: { pinnedListId: sourceListId },
    orderBy: { position: 'asc' },
  })

  const targetEntries = sameList
    ? sourceEntries
    : await prisma.pinnedTodo.findMany({
        where: { pinnedListId: targetListId },
        orderBy: { position: 'asc' },
      })

  const boundedIndex = Math.min(Math.max(targetIndex, 0), targetEntries.length)

  if (sameList) {
    const ids = sourceEntries.map((item) => item.id)
    const todoIndex = sourceEntries.findIndex((item) => item.todoId === todoId)
    if (todoIndex === -1) {
      return getTodoState()
    }

    const reordered = [...sourceEntries]
    const [moved] = reordered.splice(todoIndex, 1)
    reordered.splice(boundedIndex, 0, moved)

    await prisma.$transaction(
      reordered.map((item, index) =>
        prisma.pinnedTodo.update({
          where: { id: item.id },
          data: { position: index },
        }),
      ),
    )
  } else {
    const remainingSource = sourceEntries.filter((item) => item.id !== entry.id)
    const targetAfterMove = targetEntries.filter((item) => item.id !== entry.id)
    targetAfterMove.splice(boundedIndex, 0, entry)

    await prisma.$transaction([
      ...remainingSource.map((item, index) =>
        prisma.pinnedTodo.update({
          where: { id: item.id },
          data: { position: index },
        }),
      ),
      ...targetAfterMove.map((item, index) =>
        prisma.pinnedTodo.update({
          where: { id: item.id },
          data: {
            pinnedListId: item.id === entry.id ? targetListId : item.pinnedListId,
            position: index,
          },
        }),
      ),
    ])
  }

  return getTodoState()
}

export async function addPinnedList(title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState()
  }

  await ensureSeedData()

  const position = await getNextPinnedListPosition()
  await prisma.pinnedList.create({
    data: {
      title: trimmed,
      position,
      isPrimary: position === 0,
    },
  })

  return getTodoState()
}

export async function renamePinnedList(id: string, title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState()
  }

  await ensureSeedData()

  await prisma.pinnedList.update({
    where: { id },
    data: { title: trimmed },
  })

  return getTodoState()
}

export async function deletePinnedList(id: string): Promise<TodoState> {
  await ensureSeedData()
  const list = await prisma.pinnedList.findUnique({ where: { id } })
  if (!list) {
    return getTodoState()
  }

  if (list.isPrimary) {
    return getTodoState()
  }

  const primary = await getPrimaryList()

  await prisma.$transaction(async (tx) => {
    const entries = await tx.pinnedTodo.findMany({
      where: { pinnedListId: id },
      orderBy: { position: 'asc' },
    })

    const existingPrimary = await tx.pinnedTodo.findMany({
      where: { pinnedListId: primary.id },
      orderBy: { position: 'asc' },
    })

    let nextPosition = existingPrimary.length

    for (const entry of entries) {
      const alreadyExists = existingPrimary.some((item) => item.todoId === entry.todoId)
      if (alreadyExists) {
        continue
      }
      await tx.pinnedTodo.update({
        where: { id: entry.id },
        data: {
          pinnedListId: primary.id,
          position: nextPosition,
        },
      })
      nextPosition += 1
    }

    await tx.pinnedTodo.deleteMany({ where: { pinnedListId: id } })
    await tx.pinnedList.delete({ where: { id } })
  })

  return getTodoState()
}

function collectTodos(
  nodes: SerializableTodoNode[],
  parentId: string | null,
  depth: number,
  accumulator: {
    id: string
    title: string
    completed: boolean
    pinned: boolean
    position: number
    parentId: string | null
  }[],
  seenIds: Set<string>,
) {
  if (depth > MAX_DEPTH) {
    throw new Error('Превышена максимальная вложенность задач')
  }

  nodes.forEach((node, index) => {
    if (!node || typeof node !== 'object') {
      throw new Error(`Некорректный элемент задачи на уровне ${depth}`)
    }

    const { id, title, completed, pinned, position } = node
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error(`Задача №${index + 1} на уровне ${depth + 1} не содержит корректного идентификатора`)
    }
    if (seenIds.has(id)) {
      throw new Error(`Обнаружен повторяющийся идентификатор задачи: ${id}`)
    }
    seenIds.add(id)

    if (typeof title !== 'string' || title.trim() === '') {
      throw new Error(`Задача «${id}» имеет пустой заголовок`)
    }

    if (!Number.isInteger(position)) {
      throw new Error(`Задача «${title}» содержит некорректную позицию`)
    }

    accumulator.push({
      id,
      title: title.trim(),
      completed: Boolean(completed),
      pinned: Boolean(pinned),
      position,
      parentId,
    })

    const children = Array.isArray(node.children) ? node.children : []
    collectTodos(children, id, depth + 1, accumulator, seenIds)
  })
}

function normalizePinnedLists(
  lists: SerializablePinnedList[],
  todoIds: Set<string>,
): SerializablePinnedList[] {
  if (lists.length === 0) {
    throw new Error('Необходимо указать хотя бы один список закрепленных задач')
  }

  const seenListIds = new Set<string>()
  const sanitized = lists.map((list, index) => {
    if (!list || typeof list !== 'object') {
      throw new Error(`Некорректный список закрепленных задач №${index + 1}`)
    }

    const { id, title, position, isPrimary } = list
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error(`Список закрепленных задач №${index + 1} не содержит корректного идентификатора`)
    }
    if (seenListIds.has(id)) {
      throw new Error(`Обнаружен повторяющийся идентификатор списка закрепленных задач: ${id}`)
    }
    seenListIds.add(id)

    if (typeof title !== 'string' || title.trim() === '') {
      throw new Error(`Список закрепленных задач «${id}» имеет пустое название`)
    }

    if (!Number.isInteger(position)) {
      throw new Error(`Список закрепленных задач «${title}» содержит некорректную позицию`)
    }

    const uniqueOrder: string[] = []
    const seenTodoIds = new Set<string>()
    const order = Array.isArray(list.order) ? list.order : []
    order.forEach((todoId) => {
      if (typeof todoId !== 'string') {
        return
      }
      if (!todoIds.has(todoId)) {
        return
      }
      if (seenTodoIds.has(todoId)) {
        return
      }
      seenTodoIds.add(todoId)
      uniqueOrder.push(todoId)
    })

    return {
      id,
      title: title.trim(),
      position,
      isPrimary: Boolean(isPrimary),
      order: uniqueOrder,
    }
  })

  const primaryLists = sanitized.filter((list) => list.isPrimary)
  if (primaryLists.length !== 1) {
    throw new Error('В данных должен быть ровно один основной список закрепленных задач')
  }

  const [primary] = primaryLists
  const others = sanitized.filter((list) => list.id !== primary.id)
  others.sort((a, b) => a.position - b.position)

  return [primary, ...others].map((list, index) => ({
    ...list,
    position: index,
  }))
}

function sanitizeState(rawState: unknown) {
  if (!rawState || typeof rawState !== 'object') {
    throw new Error('Некорректный формат файла импорта')
  }

  const { todos, pinnedLists } = rawState as Partial<SerializableTodoState>
  if (!Array.isArray(todos) || !Array.isArray(pinnedLists)) {
    throw new Error('Файл импорта должен содержать списки задач и закреплений')
  }

  const todoAccumulator: {
    id: string
    title: string
    completed: boolean
    pinned: boolean
    position: number
    parentId: string | null
  }[] = []
  const todoIds = new Set<string>()

  collectTodos(todos, null, 0, todoAccumulator, todoIds)

  const normalizedLists = normalizePinnedLists(pinnedLists, todoIds)

  return { todos: todoAccumulator, pinnedLists: normalizedLists }
}

export async function exportTodoState(): Promise<TodoState> {
  return getTodoState()
}

export async function importTodoState(rawState: unknown): Promise<TodoState> {
  await ensureSeedData()

  const { todos, pinnedLists } = sanitizeState(rawState)

  await prisma.$transaction(async (tx) => {
    await tx.pinnedTodo.deleteMany()
    await tx.pinnedList.deleteMany()
    await tx.todo.deleteMany()

    if (todos.length > 0) {
      await tx.todo.createMany({
        data: todos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          completed: todo.completed,
          pinned: todo.pinned,
          position: todo.position,
          parentId: todo.parentId,
        })),
      })
    }

    await tx.pinnedList.createMany({
      data: pinnedLists.map((list) => ({
        id: list.id,
        title: list.title,
        position: list.position,
        isPrimary: list.isPrimary,
      })),
    })

    for (const list of pinnedLists) {
      if (list.order.length === 0) {
        continue
      }
      await tx.pinnedTodo.createMany({
        data: list.order.map((todoId, index) => ({
          pinnedListId: list.id,
          todoId,
          position: index,
        })),
      })
    }
  })

  return getTodoState()
}
