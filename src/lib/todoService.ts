import { randomUUID } from 'node:crypto'
import type { Todo, Tag } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { MAX_DEPTH } from './constants'
import { prisma } from './prisma'
import type { PinnedListState, TodoNode, TodoState } from './types'

interface NormalizedTodoRecord {
  id: string
  title: string
  completed: boolean
  pinned: boolean
  parentId: string | null
  position: number
}

interface NormalizedPinnedList {
  id: string
  title: string
  position: number
  isPrimary: boolean
  isActive?: boolean
  order: string[]
}

async function ensureUserData(userId: string) {
  await prisma.$transaction(async (tx) => {
    const lists = await tx.pinnedList.findMany({ where: { userId }, orderBy: { position: 'asc' } })
    if (lists.length === 0) {
      await tx.pinnedList.create({
        data: {
          userId,
          title: 'Главное',
          position: 0,
          isPrimary: true,
          isActive: true,
        },
      })
      return
    }

    const primaryCandidate = lists.find((list) => list.isPrimary) ?? lists[0]
    if (!primaryCandidate.isPrimary) {
      await tx.pinnedList.update({ where: { id: primaryCandidate.id }, data: { isPrimary: true } })
    }
    await tx.pinnedList.updateMany({
      where: { userId, id: { not: primaryCandidate.id }, isPrimary: true },
      data: { isPrimary: false },
    })

    const activeCandidate = lists.find((list) => list.isActive) ?? primaryCandidate
    if (!activeCandidate.isActive) {
      await tx.pinnedList.update({ where: { id: activeCandidate.id }, data: { isActive: true } })
    }
    await tx.pinnedList.updateMany({
      where: { userId, id: { not: activeCandidate.id }, isActive: true },
      data: { isActive: false },
    })
  })

  const todoCount = await prisma.todo.count({ where: { creatorId: userId } })
  if (todoCount === 0) {
    await prisma.$transaction(async (tx) => {
      const qaChecklist = await tx.todo.create({
        data: {
          title: 'Проверка перед релизом',
          completed: false,
          pinned: false,
          position: 0,
          creatorId: userId,
        },
      })

      await tx.todo.createMany({
        data: [
          {
            title: 'Прогнать авто-тесты',
            completed: true,
            completedAt: new Date(),
            pinned: false,
            parentId: qaChecklist.id,
            position: 0,
            creatorId: userId,
          },
          {
            title: 'Проверить ручные сценарии',
            completed: false,
            pinned: false,
            parentId: qaChecklist.id,
            position: 1,
            creatorId: userId,
          },
          {
            title: 'Согласовать список изменений',
            completed: false,
            pinned: false,
            parentId: qaChecklist.id,
            position: 2,
            creatorId: userId,
          },
        ],
      })

      const designIteration = await tx.todo.create({
        data: {
          title: 'Прототип интерфейса',
          completed: false,
          pinned: false,
          position: 1,
          creatorId: userId,
        },
      })

      const feedback = await tx.todo.create({
        data: {
          title: 'Собрать обратную связь',
          completed: false,
          pinned: false,
          parentId: designIteration.id,
          position: 1,
          creatorId: userId,
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
            creatorId: userId,
          },
          {
            title: 'Созвон с командой продукта',
            completed: false,
            pinned: false,
            parentId: feedback.id,
            position: 0,
            creatorId: userId,
          },
        ],
      })
    })
  }
}

async function getPrimaryList(userId: string) {
  await ensureUserData(userId)
  const primary = await prisma.pinnedList.findFirst({
    where: { userId, isPrimary: true },
    orderBy: { position: 'asc' },
  })
  if (primary) {
    return primary
  }
  const fallback = await prisma.pinnedList.findFirst({ where: { userId }, orderBy: { position: 'asc' } })
  if (!fallback) {
    throw new Error('Primary pinned list is missing')
  }
  return prisma.pinnedList.update({
    where: { id: fallback.id },
    data: { isPrimary: true },
  })
}

async function getActiveList(userId: string) {
  await ensureUserData(userId)
  let active = await prisma.pinnedList.findFirst({
    where: { userId, isActive: true },
    orderBy: { position: 'asc' },
  })
  if (!active) {
    const primary = await getPrimaryList(userId)
    active = await prisma.pinnedList.update({ where: { id: primary.id }, data: { isActive: true } })
  }
  return active
}

async function getNextTodoPosition(userId: string, parentId: string | null) {
  const lastTodo = await prisma.todo.findFirst({
    where: { creatorId: userId, parentId },
    orderBy: { position: 'desc' },
  })
  return (lastTodo?.position ?? -1) + 1
}

async function getNextPinnedListPosition(userId: string) {
  const lastList = await prisma.pinnedList.findFirst({
    where: { userId },
    orderBy: { position: 'desc' },
  })
  return (lastList?.position ?? -1) + 1
}

async function getNextPinnedTodoPosition(userId: string, listId: string) {
  const lastEntry = await prisma.pinnedTodo.findFirst({
    where: { pinnedListId: listId, pinnedList: { userId } },
    orderBy: { position: 'desc' },
  })
  return (lastEntry?.position ?? -1) + 1
}

function buildTree(todos: (Todo & { tags: Tag[] })[]): TodoNode[] {
  const nodes = new Map<string, TodoNode>()
  const roots: TodoNode[] = []

  const sorted = [...todos].sort((a, b) => a.position - b.position)

  for (const todo of sorted) {
    nodes.set(todo.id, { ...todo, children: [], tags: todo.tags })
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

async function composePinnedLists(userId: string): Promise<PinnedListState[]> {
  const [lists, entries] = await Promise.all([
    prisma.pinnedList.findMany({ where: { userId }, orderBy: { position: 'asc' } }),
    prisma.pinnedTodo.findMany({
      where: { pinnedList: { userId } },
      orderBy: [{ pinnedListId: 'asc' }, { position: 'asc' }],
    }),
  ])

  return lists.map((list) => ({
    id: list.id,
    title: list.title,
    order: entries.filter((entry) => entry.pinnedListId === list.id).map((entry) => entry.todoId),
    isPrimary: list.isPrimary,
    position: list.position,
    isActive: list.isActive ?? false,
  }))
}

export async function getTodoState(userId: string): Promise<TodoState> {
  await ensureUserData(userId)

  const [todos, tags] = await Promise.all([
    prisma.todo.findMany({
      where: { creatorId: userId },
      include: { tags: true },
    }),
    prisma.tag.findMany({ where: { userId }, orderBy: { position: 'asc' } }),
  ])
  const tree = buildTree(todos)
  const pinnedLists = await composePinnedLists(userId)

  return { todos: tree, pinnedLists, tags }
}

function normalizeTodos(
  nodes: unknown,
  parentId: string | null,
  depth: number,
  result: NormalizedTodoRecord[],
  idSet: Set<string>,
) {
  if (depth > MAX_DEPTH) {
    throw new Error('Превышена максимальная глубина вложенности задач')
  }

  if (!Array.isArray(nodes)) {
    return
  }

  nodes.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      return
    }

    const raw = item as Partial<TodoNode>
    const idCandidate = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : randomUUID()
    const id = idSet.has(idCandidate) ? randomUUID() : idCandidate
    idSet.add(id)

    const title = typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title.trim() : 'Без названия'
    const completed = typeof raw.completed === 'boolean' ? raw.completed : false
    const pinned = typeof raw.pinned === 'boolean' ? raw.pinned : false

    result.push({
      id,
      title,
      completed,
      pinned,
      parentId,
      position: index,
    })

    normalizeTodos((raw.children ?? []) as unknown, id, depth + 1, result, idSet)
  })
}

function normalizePinnedLists(
  lists: unknown,
  todoIds: Set<string>,
): NormalizedPinnedList[] {
  if (!Array.isArray(lists)) {
    return [
      {
        id: randomUUID(),
        title: 'Главное',
        position: 0,
        isPrimary: true,
        isActive: true,
        order: [],
      },
    ]
  }

  const normalized: NormalizedPinnedList[] = []

  lists.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      return
    }

    const raw = item as Partial<PinnedListState>
    const idCandidate = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : randomUUID()
    const id = normalized.some((list) => list.id === idCandidate) ? randomUUID() : idCandidate
    const title = typeof raw.title === 'string' && raw.title.trim().length > 0 ? raw.title.trim() : 'Главное'
    const order = Array.isArray(raw.order)
      ? raw.order
        .map((value) => (typeof value === 'string' ? value : String(value)))
        .filter((todoId) => todoIds.has(todoId))
      : []

    normalized.push({
      id,
      title,
      position: index,
      isPrimary: Boolean(raw.isPrimary),
      isActive: Boolean((raw as any).isActive),
      order,
    })
  })

  if (normalized.length === 0) {
    return [
      {
        id: randomUUID(),
        title: 'Главное',
        position: 0,
        isPrimary: true,
        isActive: true,
        order: [],
      },
    ]
  }

  const firstPrimaryIndex = normalized.findIndex((item) => item.isPrimary)
  let firstActiveIndex = normalized.findIndex((item) => item.isActive)
  if (firstActiveIndex === -1) firstActiveIndex = firstPrimaryIndex === -1 ? 0 : firstPrimaryIndex
  normalized.forEach((item, index) => {
    item.position = index
    item.isPrimary = index === (firstPrimaryIndex === -1 ? 0 : firstPrimaryIndex)
    item.isActive = index === firstActiveIndex
  })

  return normalized
}

export async function replaceTodoState(userId: string, state: unknown): Promise<TodoState> {
  const todos: NormalizedTodoRecord[] = []
  const idSet = new Set<string>()
  const parsed = (state as Partial<TodoState>) ?? {}
  normalizeTodos(parsed.todos ?? [], null, 0, todos, idSet)

  // normalize tags (top-level)
  const tagRecords: { id: string; name: string; position: number; isSystem: boolean; userId: string }[] = []
  const tagIdSet = new Set<string>()
  if (Array.isArray((parsed as any).tags)) {
    for (const [index, raw] of (parsed as any).tags.entries()) {
      if (!raw || typeof raw !== 'object') continue
      const rid = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : randomUUID()
      const id = tagIdSet.has(rid) ? randomUUID() : rid
      tagIdSet.add(id)
      const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Без имени'
      const position = typeof raw.position === 'number' ? raw.position : index
      const isSystem = typeof (raw as any).isSystem === 'boolean'
        ? Boolean((raw as any).isSystem)
        : name === 'Проект' || name === 'Раздел'
      tagRecords.push({ id, name, position, isSystem, userId })
    }
  }

  // collect per-todo tag ids if present
  const todoTagMap = new Map<string, string[]>()
  if (Array.isArray(parsed.todos)) {
    const walk = (nodes: any[], idLookup: Map<string, string>) => {
      for (const item of nodes) {
        if (!item || typeof item !== 'object') continue
        const raw = item as any
        const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : undefined
        if (id) {
          const tagIds: string[] = []
          if (Array.isArray(raw.tags)) {
            for (const t of raw.tags) {
              if (t && typeof t === 'object') {
                const tid = typeof t.id === 'string' && t.id.trim() ? t.id.trim() : undefined
                if (tid) tagIds.push(tid)
              }
            }
          }
          if (tagIds.length > 0) {
            todoTagMap.set(id, Array.from(new Set(tagIds)))
          }
        }
        if (Array.isArray(raw.children)) {
          walk(raw.children, idLookup)
        }
      }
    }
    walk(parsed.todos as any[], new Map())
  }

  const todoIds = new Set(todos.map((item) => item.id))
  const pinnedLists = normalizePinnedLists(parsed.pinnedLists ?? [], todoIds)

  const pinnedTodoIds = new Set<string>()
  pinnedLists.forEach((list) => {
    list.order.forEach((todoId) => pinnedTodoIds.add(todoId))
  })

  todos.forEach((todo) => {
    todo.pinned = todo.pinned || pinnedTodoIds.has(todo.id)
  })

  await prisma.$transaction(async (tx) => {
    await tx.pinnedTodo.deleteMany({ where: { pinnedList: { userId } } })
    await tx.pinnedList.deleteMany({ where: { userId } })
    await tx.tag.deleteMany({ where: { userId } })
    await tx.todo.deleteMany({ where: { creatorId: userId } })

    if (tagRecords.length > 0) {
      await tx.tag.createMany({ data: tagRecords })
    }

    for (const todo of todos) {
      await tx.todo.create({
        data: {
          id: todo.id,
          title: todo.title,
          completed: todo.completed,
          pinned: todo.pinned,
          parentId: todo.parentId,
          position: todo.position,
          creatorId: userId,
        },
      })
    }

    // connect tags to todos
    if (todoTagMap.size > 0) {
      for (const [todoId, tagIds] of todoTagMap) {
        await tx.todo.update({
          where: { id: todoId },
          data: { tags: { set: [], connect: tagIds.map((id) => ({ id })) } },
        })
      }
    }

    for (const list of pinnedLists) {
      await tx.pinnedList.create({
        data: {
          id: list.id,
          title: list.title,
          position: list.position,
          isPrimary: list.isPrimary,
          isActive: Boolean(list.isActive),
          userId,
        },
      })

      if (list.order.length > 0) {
        await tx.pinnedTodo.createMany({
          data: list.order.map((todoId, index) => ({
            pinnedListId: list.id,
            todoId,
            position: index,
          })),
        })
      }
    }
  })

  await ensureUserData(userId)
  return getTodoState(userId)
}

async function getTodoDepth(userId: string, id: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ depth: number | null }[]>`
    WITH RECURSIVE ancestors AS (
      SELECT "parentId", 0::int AS depth FROM "Todo" WHERE "id" = ${id} AND "creatorId" = ${userId}
      UNION ALL
      SELECT t."parentId", ancestors.depth + 1
      FROM "Todo" t
      JOIN ancestors ON t."id" = ancestors."parentId"
      WHERE t."creatorId" = ${userId}
    )
    SELECT COALESCE(MAX(depth), 0) AS depth FROM ancestors;
  `
  return rows[0]?.depth ?? 0
}

async function getSubtreeDepth(userId: string, id: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ maxDepth: number | null }[]>`
    WITH RECURSIVE tree AS (
      SELECT "id", "parentId", 0::int AS depth FROM "Todo" WHERE "id" = ${id} AND "creatorId" = ${userId}
      UNION ALL
      SELECT t."id", t."parentId", tree.depth + 1
      FROM "Todo" t
      JOIN tree ON t."parentId" = tree."id"
      WHERE t."creatorId" = ${userId}
    )
    SELECT COALESCE(MAX(depth), 0) AS "maxDepth" FROM tree;
  `
  return rows[0]?.maxDepth ?? 0
}

export async function addTodo(
  userId: string,
  parentId: string | null,
  title: string,
  tagIds?: string[],
): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState(userId)
  }

  await ensureUserData(userId)

  if (parentId) {
    const parent = await prisma.todo.findFirst({ where: { id: parentId, creatorId: userId } })
    if (!parent) {
      return getTodoState(userId)
    }
    const parentDepth = await getTodoDepth(userId, parentId)
    if (parentDepth >= MAX_DEPTH) {
      return getTodoState(userId)
    }
  }

  let connectTags: { id: string }[] | undefined
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    const unique = Array.from(new Set(tagIds))
    const validTags = await prisma.tag.findMany({ where: { id: { in: unique }, userId } })
    if (validTags.length > 0) {
      connectTags = validTags.map((tag) => ({ id: tag.id }))
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.todo.updateMany({
      where: { parentId, creatorId: userId },
      data: { position: { increment: 1 } },
    })

    await tx.todo.create({
      data: {
        title: trimmed,
        parentId,
        position: 0,
        creatorId: userId,
        ...(connectTags ? { tags: { connect: connectTags } } : {}),
      },
    })
  })

  return getTodoState(userId)
}

export async function updateTodoTitle(userId: string, id: string, title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState(userId)
  }

  await ensureUserData(userId)

  const todo = await prisma.todo.findFirst({ where: { id, creatorId: userId } })
  if (!todo) {
    return getTodoState(userId)
  }

  await prisma.todo.update({
    where: { id },
    data: { title: trimmed },
  })

  return getTodoState(userId)
}

export async function toggleTodoCompleted(userId: string, id: string): Promise<TodoState> {
  await ensureUserData(userId)
  const todo = await prisma.todo.findFirst({ where: { id, creatorId: userId } })
  if (!todo) {
    return getTodoState(userId)
  }

  await prisma.todo.update({
    where: { id },
    data: { completed: !todo.completed, completedAt: todo.completed ? null : new Date() },
  })

  return getTodoState(userId)
}

export async function deleteTodo(userId: string, id: string): Promise<TodoState> {
  await ensureUserData(userId)
  const todo = await prisma.todo.findFirst({ where: { id, creatorId: userId } })
  if (!todo) {
    return getTodoState(userId)
  }

  await prisma.todo.delete({ where: { id } })
  return getTodoState(userId)
}

// ----- Tags API -----
export async function listTags(userId: string): Promise<TodoState> {
  await ensureUserData(userId)
  return getTodoState(userId)
}

export async function addTag(userId: string, name: string): Promise<TodoState> {
  const trimmed = name.trim()
  if (!trimmed) return getTodoState(userId)
  await ensureUserData(userId)
  const maxPosition = await prisma.tag.findFirst({ where: { userId }, orderBy: { position: 'desc' } })
  const position = (maxPosition?.position ?? -1) + 1
  const isSystem = trimmed === 'Проект' || trimmed === 'Раздел'
  await prisma.tag.create({ data: { name: trimmed, position, isSystem, userId } })
  return getTodoState(userId)
}

export async function renameTag(userId: string, id: string, name: string): Promise<TodoState> {
  const trimmed = name.trim()
  if (!trimmed) return getTodoState(userId)
  await ensureUserData(userId)
  const tag = await prisma.tag.findFirst({ where: { id, userId } })
  if (!tag) return getTodoState(userId)
  const isSystem = trimmed === 'Проект' || trimmed === 'Раздел'
  await prisma.tag.update({ where: { id }, data: { name: trimmed, isSystem } })
  return getTodoState(userId)
}

export async function deleteTag(userId: string, id: string): Promise<TodoState> {
  await ensureUserData(userId)
  const tag = await prisma.tag.findFirst({ where: { id, userId } })
  if (!tag) return getTodoState(userId)
  await prisma.tag.delete({ where: { id } })
  return getTodoState(userId)
}

export async function reorderTags(userId: string, tagIds: string[]): Promise<TodoState> {
  await ensureUserData(userId)
  const unique = Array.from(new Set(tagIds))
  if (unique.length === 0) {
    return getTodoState(userId)
  }
  const validTags = await prisma.tag.findMany({ where: { userId, id: { in: unique } } })
  const validSet = new Set(validTags.map((tag) => tag.id))
  const ordered = unique.filter((id) => validSet.has(id))
  if (ordered.length > 0) {
    await prisma.$transaction(
      ordered.map((id, index) =>
        prisma.tag.update({
          where: { id },
          data: { position: index },
        }),
      ),
    )
  }
  return getTodoState(userId)
}

export async function attachTagToTodo(userId: string, todoId: string, tagId: string): Promise<TodoState> {
  await ensureUserData(userId)
  const [todo, tag] = await Promise.all([
    prisma.todo.findFirst({ where: { id: todoId, creatorId: userId } }),
    prisma.tag.findFirst({ where: { id: tagId, userId } }),
  ])
  if (!todo || !tag) return getTodoState(userId)

  if (tag.name === 'Проект') {
    const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
      WITH RECURSIVE subtree AS (
        SELECT "id" FROM "Todo" WHERE "id" = ${todoId} AND "creatorId" = ${userId}
        UNION ALL
        SELECT t."id" FROM "Todo" t
        JOIN subtree ON t."parentId" = subtree."id"
        WHERE t."creatorId" = ${userId}
      )
      SELECT EXISTS(
        SELECT 1 FROM "Todo" tt
        JOIN "_TagToTodo" j ON j."B" = tt."id"
        JOIN "Tag" tg ON tg."id" = j."A"
        WHERE tg."name" = 'Раздел'
          AND tg."userId" = ${userId}
          AND tt."id" IN (SELECT "id" FROM subtree)
      ) AS exists;
    `
    if (rows[0]?.exists) return getTodoState(userId)
  }

  if (tag.name === 'Раздел') {
    const rows = await prisma.$queryRaw<{ hasProject: boolean }[]>`
      WITH RECURSIVE ancestors AS (
        SELECT "id", "parentId" FROM "Todo" WHERE "id" = ${todoId} AND "creatorId" = ${userId}
        UNION ALL
        SELECT t."id", t."parentId" FROM "Todo" t
        JOIN ancestors a ON a."parentId" = t."id"
        WHERE t."creatorId" = ${userId}
      )
      SELECT EXISTS(
        SELECT 1 FROM ancestors anc
        JOIN "_TagToTodo" j ON j."B" = anc."id"
        JOIN "Tag" tg ON tg."id" = j."A"
        WHERE tg."name" = 'Проект'
          AND tg."userId" = ${userId}
      ) AS "hasProject";
    `
    if (!rows[0]?.hasProject) return getTodoState(userId)
  }

  await prisma.todo.update({ where: { id: todoId }, data: { tags: { connect: { id: tagId } } } })
  return getTodoState(userId)
}

export async function detachTagFromTodo(userId: string, todoId: string, tagId: string): Promise<TodoState> {
  await ensureUserData(userId)
  const todo = await prisma.todo.findFirst({ where: { id: todoId, creatorId: userId } })
  if (!todo) return getTodoState(userId)
  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } })
  if (!tag) return getTodoState(userId)

  await prisma.todo.update({ where: { id: todoId }, data: { tags: { disconnect: { id: tagId } } } })
  return getTodoState(userId)
}

export async function moveTodo(
  userId: string,
  id: string,
  targetParentId: string | null,
  targetIndex: number,
): Promise<TodoState> {
  await ensureUserData(userId)
  const todo = await prisma.todo.findFirst({ where: { id, creatorId: userId } })
  if (!todo) {
    return getTodoState(userId)
  }

  if (targetParentId) {
    const parentExists = await prisma.todo.findFirst({ where: { id: targetParentId, creatorId: userId } })
    if (!parentExists) {
      return getTodoState(userId)
    }

    if (parentExists.id === id) {
      return getTodoState(userId)
    }

    const parentDepth = await getTodoDepth(userId, targetParentId)
    const subtreeDepth = await getSubtreeDepth(userId, id)
    if (parentDepth + 1 + subtreeDepth > MAX_DEPTH) {
      return getTodoState(userId)
    }

    const descendantRows = await prisma.$queryRaw<{ exists: boolean }[]>`
      WITH RECURSIVE subtree AS (
        SELECT "id" FROM "Todo" WHERE "id" = ${id} AND "creatorId" = ${userId}
        UNION ALL
        SELECT t."id" FROM "Todo" t
        JOIN subtree ON t."parentId" = subtree."id"
        WHERE t."creatorId" = ${userId}
      )
      SELECT EXISTS(SELECT 1 FROM subtree WHERE "id" = ${targetParentId}) AS exists;
    `
    if (descendantRows[0]?.exists) {
      return getTodoState(userId)
    }
  } else {
    const subtreeDepth = await getSubtreeDepth(userId, id)
    if (subtreeDepth > MAX_DEPTH) {
      return getTodoState(userId)
    }
  }

  const sourceParentId = todo.parentId

  const sourceSiblings = await prisma.todo.findMany({
    where: { parentId: sourceParentId, creatorId: userId },
    orderBy: { position: 'asc' },
  })

  const targetSiblings = targetParentId === sourceParentId
    ? sourceSiblings
    : await prisma.todo.findMany({
      where: { parentId: targetParentId, creatorId: userId },
      orderBy: { position: 'asc' },
    })

  const currentIndex = sourceSiblings.findIndex((item) => item.id === id)
  if (currentIndex === -1) {
    return getTodoState(userId)
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

    const rows = order.map((todoId, index) =>
      Prisma.sql`(${todoId}, ${sourceParentId}, ${index})`,
    )

    await prisma.$executeRaw`UPDATE "Todo" AS t
      SET "parentId" = v.parent_id,
          "position" = v.position
      FROM (VALUES ${Prisma.join(rows)}) AS v(id, parent_id, position)
      WHERE t."id" = v.id;`

    return getTodoState(userId)
  }

  const sourceOrder = sourceSiblings.filter((item) => item.id !== id).map((item) => item.id)
  const targetOrder = targetSiblings.map((item) => item.id)
  const bounded = Math.min(Math.max(nextIndex, 0), targetOrder.length)
  targetOrder.splice(bounded, 0, id)

  const rows = [
    ...sourceOrder.map((todoId, index) =>
      Prisma.sql`(${todoId}, ${sourceParentId}, ${index})`,
    ),
    ...targetOrder.map((todoId, index) =>
      Prisma.sql`(${todoId}, ${targetParentId}, ${index})`,
    ),
  ]

  if (rows.length > 0) {
    await prisma.$executeRaw`UPDATE "Todo" AS t
      SET "parentId" = v.parent_id,
          "position" = v.position
      FROM (VALUES ${Prisma.join(rows)}) AS v(id, parent_id, position)
      WHERE t."id" = v.id;`
  }

  return getTodoState(userId)
}

export async function togglePinned(userId: string, id: string): Promise<TodoState> {
  await ensureUserData(userId)
  const todo = await prisma.todo.findFirst({ where: { id, creatorId: userId } })
  if (!todo) {
    return getTodoState(userId)
  }

  if (todo.pinned) {
    await prisma.$transaction([
      prisma.todo.update({ where: { id }, data: { pinned: false } }),
      prisma.pinnedTodo.deleteMany({ where: { todoId: id, pinnedList: { userId } } }),
    ])
  } else {
    const active = await getActiveList(userId)
    const position = await getNextPinnedTodoPosition(userId, active.id)
    await prisma.$transaction([
      prisma.todo.update({ where: { id }, data: { pinned: true } }),
      prisma.pinnedTodo.create({
        data: {
          todoId: id,
          pinnedListId: active.id,
          position,
        },
      }),
    ])
  }

  return getTodoState(userId)
}

export async function movePinnedTodo(
  userId: string,
  todoId: string,
  targetListId: string,
  targetIndex: number,
): Promise<TodoState> {
  await ensureUserData(userId)
  const entry = await prisma.pinnedTodo.findFirst({ where: { todoId, pinnedList: { userId } } })
  if (!entry) {
    return getTodoState(userId)
  }

  const targetList = await prisma.pinnedList.findFirst({ where: { id: targetListId, userId } })
  if (!targetList) {
    return getTodoState(userId)
  }

  const sourceListId = entry.pinnedListId
  const sameList = sourceListId === targetListId

  const sourceEntries = await prisma.pinnedTodo.findMany({
    where: { pinnedListId: sourceListId, pinnedList: { userId } },
    orderBy: { position: 'asc' },
  })

  const targetEntries = sameList
    ? sourceEntries
    : await prisma.pinnedTodo.findMany({
      where: { pinnedListId: targetListId, pinnedList: { userId } },
      orderBy: { position: 'asc' },
    })

  const boundedIndex = Math.min(Math.max(targetIndex, 0), targetEntries.length)

  if (sameList) {
    const todoIndex = sourceEntries.findIndex((item) => item.todoId === todoId)
    if (todoIndex === -1) {
      return getTodoState(userId)
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

  return getTodoState(userId)
}

export async function addPinnedList(userId: string, title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState(userId)
  }

  await ensureUserData(userId)

  const position = await getNextPinnedListPosition(userId)
  const hasActive = await prisma.pinnedList.findFirst({ where: { userId, isActive: true } })
  await prisma.pinnedList.create({
    data: {
      title: trimmed,
      position,
      isPrimary: position === 0,
      isActive: hasActive ? false : true,
      userId,
    },
  })

  return getTodoState(userId)
}

export async function renamePinnedList(userId: string, id: string, title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState(userId)
  }

  await ensureUserData(userId)

  const list = await prisma.pinnedList.findFirst({ where: { id, userId } })
  if (!list) {
    return getTodoState(userId)
  }

  await prisma.pinnedList.update({
    where: { id },
    data: { title: trimmed },
  })

  return getTodoState(userId)
}

export async function deletePinnedList(userId: string, id: string): Promise<TodoState> {
  await ensureUserData(userId)
  const list = await prisma.pinnedList.findFirst({ where: { id, userId } })
  if (!list) {
    return getTodoState(userId)
  }

  if (list.isPrimary) {
    return getTodoState(userId)
  }

  const primary = await getPrimaryList(userId)

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
    const wasActive = list.isActive
    await tx.pinnedList.delete({ where: { id } })
    if (wasActive) {
      await tx.pinnedList.update({ where: { id: primary.id }, data: { isActive: true } })
    }
  })

  return getTodoState(userId)
}

export async function setActivePinnedList(userId: string, id: string): Promise<TodoState> {
  await ensureUserData(userId)
  const list = await prisma.pinnedList.findFirst({ where: { id, userId } })
  if (!list) return getTodoState(userId)
  await prisma.$transaction(async (tx) => {
    await tx.pinnedList.updateMany({ where: { userId }, data: { isActive: false } })
    await tx.pinnedList.update({ where: { id }, data: { isActive: true } })
  })
  return getTodoState(userId)
}
