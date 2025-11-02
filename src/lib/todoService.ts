import { randomUUID } from 'node:crypto'
import type { Todo, Tag } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { getUserIdOrThrow } from './auth/userContext'
import { MAX_DEPTH } from './constants'
import { prisma } from './prisma'
import type { PinnedListState, TodoNode, TodoState } from './types'

let schemaInitialized = false
const initializedUsers = new Set<string>()

// Определение текущего типа БД (простая эвристика по DATABASE_URL)
const isSQLite = process.env.DATABASE_URL?.startsWith('file:') ?? false

interface NormalizedTodoRecord {
  id: string
  title: string
  completed: boolean
  pinned: boolean
  alias: string | null
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

async function ensureDatabase() {
  // No-op: schema is managed by Prisma migrations for Postgres
  if (schemaInitialized) return
  schemaInitialized = true
}

async function prepareUser(): Promise<string> {
  await ensureSeedData()
  return getUserIdOrThrow()
}

async function ensureSeedData() {
  await ensureDatabase()
  const userId = getUserIdOrThrow()
  if (initializedUsers.has(userId)) return

  await prisma.$transaction(async (tx) => {
    let primary = await tx.pinnedList.findFirst({
      where: { userId },
      orderBy: { position: 'asc' },
    })

    if (!primary) {
      primary = await tx.pinnedList.create({
        data: {
          userId,
          title: 'Главное',
          isPrimary: true,
          isActive: true,
          position: 0,
        },
      })
    } else {
      if (!primary.isPrimary) {
        await tx.pinnedList.update({ where: { id: primary.id }, data: { isPrimary: true } })
      }

      const active = await tx.pinnedList.findFirst({
        where: { userId, isActive: true },
        orderBy: { position: 'asc' },
      })

      if (!active) {
        await tx.pinnedList.update({ where: { id: primary.id }, data: { isActive: true } })
      }
    }
  })

  initializedUsers.add(userId)
}

async function getPrimaryList() {
  const userId = await prepareUser()
  const primary = await prisma.pinnedList.findFirst({
    where: { userId },
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

async function getActiveList() {
  const userId = await prepareUser()
  let active = await prisma.pinnedList.findFirst({
    where: { userId, isActive: true },
    orderBy: { position: 'asc' },
  })
  if (!active) {
    const primary = await getPrimaryList()
    active = await prisma.pinnedList.update({ where: { id: primary.id }, data: { isActive: true } })
  }
  return active
}

async function getNextTodoPosition(parentId: string | null) {
  const userId = await prepareUser()
  const lastTodo = await prisma.todo.findFirst({
    where: { parentId, userId },
    orderBy: { position: 'desc' },
  })
  return (lastTodo?.position ?? -1) + 1
}

async function getNextPinnedListPosition() {
  const userId = await prepareUser()
  const lastList = await prisma.pinnedList.findFirst({
    where: { userId },
    orderBy: { position: 'desc' },
  })
  return (lastList?.position ?? -1) + 1
}

async function getNextPinnedTodoPosition(listId: string) {
  const userId = await prepareUser()
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

async function composePinnedLists(): Promise<PinnedListState[]> {
  const userId = getUserIdOrThrow()
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
    isActive: (list as any).isActive ?? false,
  }))
}

export async function getTodoState(): Promise<TodoState> {
  const userId = await prepareUser()

  const [todos, tags] = await Promise.all([
    prisma.todo.findMany({ where: { userId }, include: { tags: true } }),
    prisma.tag.findMany({ where: { userId }, orderBy: { position: 'asc' } }),
  ])
  const tree = buildTree(todos)
  const pinnedLists = await composePinnedLists()

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
    const aliasValue = typeof raw.alias === 'string' ? raw.alias.trim() : null
    const alias = aliasValue && aliasValue.length > 0 ? aliasValue : null

    result.push({
      id,
      title,
      completed,
      pinned,
      alias,
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

export async function replaceTodoState(state: unknown): Promise<TodoState> {
  const userId = await prepareUser()
  const todos: NormalizedTodoRecord[] = []
  const idSet = new Set<string>()
  const parsed = (state as Partial<TodoState>) ?? {}
  normalizeTodos(parsed.todos ?? [], null, 0, todos, idSet)

  // normalize tags (top-level)
  const tagRecords: { id: string; name: string; position: number }[] = []
  const tagIdSet = new Set<string>()
  if (Array.isArray((parsed as any).tags)) {
    for (const [index, raw] of (parsed as any).tags.entries()) {
      if (!raw || typeof raw !== 'object') continue
      const rid = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : randomUUID()
      const id = tagIdSet.has(rid) ? randomUUID() : rid
      tagIdSet.add(id)
      const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Без имени'
      const position = typeof raw.position === 'number' ? raw.position : index
      tagRecords.push({ id, name, position })
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
    await tx.todo.deleteMany({ where: { userId } })

    if (tagRecords.length > 0) {
      await tx.tag.createMany({ data: tagRecords.map((tag) => ({ ...tag, userId })) })
    }

    for (const todo of todos) {
      await tx.todo.create({
        data: {
          id: todo.id,
          title: todo.title,
          completed: todo.completed,
          pinned: todo.pinned,
          alias: todo.alias,
          parentId: todo.parentId,
          position: todo.position,
          userId,
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

  return getTodoState()
}

async function getTodoDepth(id: string, userId: string): Promise<number> {
  // Унифицированный CTE без Postgres-специфичного кастинга (::int), работает и в SQLite
  const rows = await prisma.$queryRaw<{ depth: number | null }[]>`
    WITH RECURSIVE ancestors AS (
      SELECT "parentId", 0 AS depth FROM "Todo" WHERE "id" = ${id} AND "userId" = ${userId}
      UNION ALL
      SELECT t."parentId", ancestors.depth + 1
      FROM "Todo" t
      JOIN ancestors ON t."id" = ancestors."parentId"
      WHERE t."userId" = ${userId}
    )
    SELECT COALESCE(MAX(depth), 0) AS depth FROM ancestors;
  `
  return Number(rows[0]?.depth ?? 0)
}

async function getSubtreeDepth(id: string, userId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ maxDepth: number | null }[]>`
    WITH RECURSIVE tree AS (
      SELECT "id", "parentId", 0 AS depth FROM "Todo" WHERE "id" = ${id} AND "userId" = ${userId}
      UNION ALL
      SELECT t."id", t."parentId", tree.depth + 1
      FROM "Todo" t
      JOIN tree ON t."parentId" = tree."id"
      WHERE t."userId" = ${userId}
    )
    SELECT COALESCE(MAX(depth), 0) AS "maxDepth" FROM tree;
  `
  return Number(rows[0]?.maxDepth ?? 0)
}

export async function addTodo(parentId: string | null, title: string, tagIds?: string[]): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState()
  }

  const userId = await prepareUser()

  if (parentId) {
    const parent = await prisma.todo.findFirst({ where: { id: parentId, userId } })
    if (!parent) {
      return getTodoState()
    }
    const parentDepth = await getTodoDepth(parentId, userId)
    if (parentDepth >= MAX_DEPTH) {
      return getTodoState()
    }
  }

  // Insert new todo at the top (position = 0) and shift siblings down
  await prisma.$transaction(async (tx) => {
    // Shift positions of existing siblings (including roots when parentId is null)
    await tx.todo.updateMany({
      where: { parentId, userId },
      data: { position: { increment: 1 } },
    })

    // Create the new todo at position 0
    const created = await tx.todo.create({
      data: {
        title: trimmed,
        parentId,
        position: 0,
        userId,
        ...(Array.isArray(tagIds) && tagIds.length > 0
          ? {
              tags: {
                connect: (
                  await tx.tag.findMany({
                    where: { userId, id: { in: Array.from(new Set(tagIds)) } },
                    select: { id: true },
                  })
                ).map((tag) => ({ id: tag.id })),
              },
            }
          : {}),
      },
    })

    // If adding as pinned (later via togglePinned), do nothing here.
  })

  return getTodoState()
}

export async function updateTodoDetails(
  id: string,
  details: { title?: string; alias?: string | null },
): Promise<TodoState> {
  const data: Prisma.TodoUpdateInput = {}

  if (typeof details.title === 'string') {
    const trimmed = details.title.trim()
    if (!trimmed) {
      return getTodoState()
    }
    data.title = trimmed
  }

  if (Object.prototype.hasOwnProperty.call(details, 'alias')) {
    const aliasValue = details.alias
    if (typeof aliasValue === 'string') {
      const trimmedAlias = aliasValue.trim()
      data.alias = trimmedAlias.length === 0 ? null : trimmedAlias
    } else {
      data.alias = null
    }
  }

  if (Object.keys(data).length === 0) {
    return getTodoState()
  }

  const userId = await prepareUser()

  const existing = await prisma.todo.findFirst({ where: { id, userId } })
  if (!existing) {
    return getTodoState()
  }

  await prisma.todo.update({
    where: { id },
    data,
  })

  return getTodoState()
}

export async function updateTodoTitle(id: string, title: string): Promise<TodoState> {
  return updateTodoDetails(id, { title })
}

export async function toggleTodoCompleted(id: string): Promise<TodoState> {
  const userId = await prepareUser()
  const todo = await prisma.todo.findFirst({ where: { id, userId } })
  if (!todo) {
    return getTodoState()
  }

  await prisma.todo.update({
    where: { id },
  data: { completed: !todo.completed, completedAt: todo.completed ? null : new Date() },
  })

  return getTodoState()
}

export async function deleteTodo(id: string): Promise<TodoState> {
  const userId = await prepareUser()
  await prisma.todo.deleteMany({ where: { id, userId } })
  return getTodoState()
}

// ----- Tags API -----
export async function listTags(): Promise<TodoState> {
  await prepareUser()
  return getTodoState()
}

export async function addTag(name: string): Promise<TodoState> {
  const trimmed = name.trim()
  if (!trimmed) return getTodoState()
  const userId = await prepareUser()
  const maxPosition = await prisma.tag.findFirst({ where: { userId }, orderBy: { position: 'desc' } })
  const position = (maxPosition?.position ?? -1) + 1
  const isSystem = trimmed === 'Проект' || trimmed === 'Раздел'
  await prisma.tag.create({ data: { name: trimmed, position, isSystem, userId } })
  return getTodoState()
}

export async function renameTag(id: string, name: string): Promise<TodoState> {
  const trimmed = name.trim()
  if (!trimmed) return getTodoState()
  const userId = await prepareUser()
  const existing = await prisma.tag.findFirst({ where: { id, userId } })
  if (!existing) return getTodoState()
  const isSystem = trimmed === 'Проект' || trimmed === 'Раздел'
  await prisma.tag.update({ where: { id }, data: { name: trimmed, isSystem } })
  return getTodoState()
}

export async function deleteTag(id: string): Promise<TodoState> {
  const userId = await prepareUser()
  await prisma.tag.deleteMany({ where: { id, userId } })
  return getTodoState()
}

export async function reorderTags(tagIds: string[]): Promise<TodoState> {
  const userId = await prepareUser()
  const allowedIds = new Set(
    (
      await prisma.tag.findMany({
        where: { userId, id: { in: tagIds } },
        select: { id: true },
      })
    ).map((tag) => tag.id),
  )

  await prisma.$transaction(
    tagIds
      .filter((id) => allowedIds.has(id))
      .map((id, index) =>
        prisma.tag.update({
          where: { id },
          data: { position: index },
        }),
      ),
  )
  return getTodoState()
}

export async function attachTagToTodo(todoId: string, tagId: string): Promise<TodoState> {
  const userId = await prepareUser()
  const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } })
  if (!todo) return getTodoState()

  // Ограничения системных тегов: "Проект" и "Раздел"
  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } })
  if (!tag) return getTodoState()

  if (tag.name === 'Проект') {
    // Нельзя если на этом узле или у потомков есть "Раздел"
    if (isSQLite) {
      // Для SQLite используем короткий SELECT 1 ... LIMIT 1
      const rows = await prisma.$queryRaw<{ found: number }[]>`
        WITH RECURSIVE subtree AS (
          SELECT "id" FROM "Todo" WHERE "id" = ${todoId} AND "userId" = ${userId}
          UNION ALL
          SELECT t."id" FROM "Todo" t
          JOIN subtree ON t."parentId" = subtree."id"
          WHERE t."userId" = ${userId}
        )
        SELECT 1 AS found
        FROM "Todo" tt
        JOIN "_TagToTodo" j ON j."B" = tt."id"
        JOIN "Tag" tg ON tg."id" = j."A"
        WHERE tg."name" = 'Раздел' AND tt."userId" = ${userId} AND tg."userId" = ${userId}
          AND tt."id" IN (SELECT "id" FROM subtree)
        LIMIT 1;
      `
      if (rows.length > 0) return getTodoState()
    } else {
      const rows = await prisma.$queryRaw<{ found: number }[]>`
        WITH RECURSIVE subtree AS (
          SELECT "id" FROM "Todo" WHERE "id" = ${todoId} AND "userId" = ${userId}
          UNION ALL
          SELECT t."id" FROM "Todo" t
          JOIN subtree ON t."parentId" = subtree."id"
          WHERE t."userId" = ${userId}
        )
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS found
        FROM "Todo" tt
        JOIN "_TagToTodo" j ON j."B" = tt."id"
        JOIN "Tag" tg ON tg."id" = j."A"
        WHERE tg."name" = 'Раздел' AND tt."userId" = ${userId} AND tg."userId" = ${userId}
          AND tt."id" IN (SELECT "id" FROM subtree);
      `
      if (rows[0]?.found) return getTodoState()
    }
  }

  if (tag.name === 'Раздел') {
    // Разрешен только если в иерархии вверх есть "Проект"
    const rows = await prisma.$queryRaw<{ hasProject: number }[]>`
      WITH RECURSIVE ancestors AS (
        SELECT "id", "parentId" FROM "Todo" WHERE "id" = ${todoId} AND "userId" = ${userId}
        UNION ALL
        SELECT t."id", t."parentId" FROM "Todo" t
        JOIN ancestors a ON a."parentId" = t."id"
        WHERE t."userId" = ${userId}
      )
      SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS "hasProject"
      FROM ancestors anc
      JOIN "_TagToTodo" j ON j."B" = anc."id"
      JOIN "Tag" tg ON tg."id" = j."A"
      WHERE tg."name" = 'Проект' AND tg."userId" = ${userId};
    `
    if (!rows[0]?.hasProject) return getTodoState()
  }

  await prisma.todo.update({ where: { id: todoId }, data: { tags: { connect: { id: tagId } } } })
  return getTodoState()
}

export async function detachTagFromTodo(todoId: string, tagId: string): Promise<TodoState> {
  const userId = await prepareUser()
  const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } })
  if (!todo) return getTodoState()
  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } })
  if (!tag) return getTodoState()
  await prisma.todo.update({ where: { id: todoId }, data: { tags: { disconnect: { id: tagId } } } })
  return getTodoState()
}

export async function moveTodo(
  id: string,
  targetParentId: string | null,
  targetIndex: number,
): Promise<TodoState> {
  const userId = await prepareUser()
  const todo = await prisma.todo.findFirst({ where: { id, userId } })
  if (!todo) {
    return getTodoState()
  }

  if (targetParentId) {
    const parentExists = await prisma.todo.findFirst({ where: { id: targetParentId, userId } })
    if (!parentExists || parentExists.id === id) {
      return getTodoState()
    }

    const parentDepth = Number(await getTodoDepth(targetParentId, userId))
    const subtreeDepth = Number(await getSubtreeDepth(id, userId))
    if (parentDepth + 1 + subtreeDepth > MAX_DEPTH) {
      return getTodoState()
    }

    if (isSQLite) {
      const descendantRows = await prisma.$queryRaw<{ id: string }[]>`
        WITH RECURSIVE subtree AS (
          SELECT "id" FROM "Todo" WHERE "id" = ${id} AND "userId" = ${userId}
          UNION ALL
          SELECT t."id" FROM "Todo" t
          JOIN subtree ON t."parentId" = subtree."id"
          WHERE t."userId" = ${userId}
        )
        SELECT "id" FROM subtree WHERE "id" = ${targetParentId} LIMIT 1;
      `
      if (descendantRows.length > 0) {
        return getTodoState()
      }
    } else {
      const descendantRows = await prisma.$queryRaw<{ found: number }[]>`
        WITH RECURSIVE subtree AS (
          SELECT "id" FROM "Todo" WHERE "id" = ${id} AND "userId" = ${userId}
          UNION ALL
          SELECT t."id" FROM "Todo" t
          JOIN subtree ON t."parentId" = subtree."id"
          WHERE t."userId" = ${userId}
        )
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS found
        FROM subtree
        WHERE "id" = ${targetParentId};
      `
      if (descendantRows[0]?.found) {
        return getTodoState()
      }
    }
  } else {
    const subtreeDepth = Number(await getSubtreeDepth(id, userId))
    if (subtreeDepth > MAX_DEPTH) {
      return getTodoState()
    }
  }

  const sourceParentId = todo.parentId

  const sourceSiblings = await prisma.todo.findMany({
    where: { parentId: sourceParentId, userId },
    orderBy: { position: 'asc' },
  })

  const targetSiblings = targetParentId === sourceParentId
    ? sourceSiblings
    : await prisma.todo.findMany({
      where: { parentId: targetParentId, userId },
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

    const rows = order.map((todoId, index) => ({ id: todoId, parentId: sourceParentId, position: index }))
    await bulkRepositionTodos(rows, userId)

    return getTodoState()
  }

  const sourceOrder = sourceSiblings.filter((item) => item.id !== id).map((item) => item.id)
  const targetOrder = targetSiblings.map((item) => item.id)
  const bounded = Math.min(Math.max(nextIndex, 0), targetOrder.length)
  targetOrder.splice(bounded, 0, id)

  const rows = [
    ...sourceOrder.map((todoId, index) => ({ id: todoId, parentId: sourceParentId, position: index })),
    ...targetOrder.map((todoId, index) => ({ id: todoId, parentId: targetParentId, position: index })),
  ]

  await bulkRepositionTodos(rows, userId)

  return getTodoState()
}

export async function togglePinned(id: string): Promise<TodoState> {
  const userId = await prepareUser()
  const todo = await prisma.todo.findFirst({ where: { id, userId } })
  if (!todo) {
    return getTodoState()
  }

  if (todo.pinned) {
    await prisma.$transaction([
      prisma.todo.update({ where: { id }, data: { pinned: false } }),
      prisma.pinnedTodo.deleteMany({ where: { todoId: id, pinnedList: { userId } } }),
    ])
  } else {
    // Choose active list if set, otherwise primary
    const active = await getActiveList()
    const position = await getNextPinnedTodoPosition(active.id)
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

  return getTodoState()
}

export async function movePinnedTodo(
  todoId: string,
  targetListId: string,
  targetIndex: number,
): Promise<TodoState> {
  const userId = await prepareUser()
  const entry = await prisma.pinnedTodo.findFirst({ where: { todoId, pinnedList: { userId } } })
  if (!entry) {
    return getTodoState()
  }

  const targetList = await prisma.pinnedList.findFirst({ where: { id: targetListId, userId } })
  if (!targetList) {
    return getTodoState()
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

// ---- Вспомогательные функции специфичные для БД ----

interface RepositionRow { id: string; parentId: string | null; position: number }

/**
 * Массовое обновление parentId/position для набора Todo.
 * Postgres: один UPDATE ... FROM (VALUES ...)
 * SQLite: батч updateMany (обычно количество элементов невелико -> допустимо)
 */
async function bulkRepositionTodos(rows: RepositionRow[], userId: string) {
  if (rows.length === 0) return
  if (isSQLite) {
    // Последовательные апдейты в транзакции
    await prisma.$transaction(
      rows.map((r) =>
        prisma.todo.updateMany({
          where: { id: r.id, userId },
          data: { parentId: r.parentId, position: r.position },
        }),
      ),
    )
  } else {
    const values = rows.map((r) => Prisma.sql`(${r.id}, ${r.parentId}, ${r.position})`)
    await prisma.$executeRaw`UPDATE "Todo" AS t
      SET "parentId" = v.parent_id,
          "position" = v.position
      FROM (VALUES ${Prisma.join(values)}) AS v(id, parent_id, position)
      WHERE t."id" = v.id AND t."userId" = ${userId};`
  }
}

export async function addPinnedList(title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState()
  }

  const userId = await prepareUser()

  const position = await getNextPinnedListPosition()
  const hasActive = await prisma.pinnedList.findFirst({ where: { userId, isActive: true } })
  await prisma.pinnedList.create({
    data: {
      userId,
      title: trimmed,
      position,
      isPrimary: position === 0,
      isActive: position === 0 && !hasActive,
    },
  })

  return getTodoState()
}

export async function renamePinnedList(id: string, title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState()
  }

  const userId = await prepareUser()

  const list = await prisma.pinnedList.findFirst({ where: { id, userId } })
  if (!list) {
    return getTodoState()
  }

  await prisma.pinnedList.update({
    where: { id },
    data: { title: trimmed },
  })

  return getTodoState()
}

export async function deletePinnedList(id: string): Promise<TodoState> {
  const userId = await prepareUser()
  const list = await prisma.pinnedList.findFirst({ where: { id, userId } })
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

    await tx.pinnedTodo.deleteMany({ where: { pinnedListId: id, pinnedList: { userId } } })
    // If the deleted list was active, switch active to primary
    const wasActive = list.isActive
    await tx.pinnedList.delete({ where: { id } })
    if (wasActive) {
      await tx.pinnedList.update({ where: { id: primary.id }, data: { isActive: true } })
    }
  })

  return getTodoState()
}

export async function setActivePinnedList(id: string): Promise<TodoState> {
  const userId = await prepareUser()
  const list = await prisma.pinnedList.findFirst({ where: { id, userId } })
  if (!list) return getTodoState()
  await prisma.$transaction(async (tx) => {
    await tx.pinnedList.updateMany({ where: { userId }, data: { isActive: false } })
    await tx.pinnedList.update({ where: { id }, data: { isActive: true } })
  })
  return getTodoState()
}
