import { randomUUID } from 'node:crypto'
import type { Todo, Tag } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { MAX_DEPTH } from './constants'
import { prisma } from './prisma'
import type { PinnedListState, TodoNode, TodoState } from './types'

let schemaInitialized = false
const userSeedPromises = new Map<string, Promise<void>>()

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

async function ensureSeedData(userId: string) {
  await ensureDatabase()
  const existingPromise = userSeedPromises.get(userId)
  if (existingPromise) {
    return existingPromise
  }

  const promise = (async () => {
    try {
      let primary = await prisma.pinnedList.findFirst({
        where: { userId },
        orderBy: { position: 'asc' },
      })

      if (!primary) {
        primary = await prisma.pinnedList.create({
          data: {
            title: 'Главное',
            isPrimary: true,
            isActive: true,
            position: 0,
            userId,
          },
        })
      } else {
        if (!primary.isPrimary) {
          await prisma.pinnedList.update({ where: { id: primary.id }, data: { isPrimary: true } })
        }
        const active = await prisma.pinnedList.findFirst({ where: { userId, isActive: true } })
        if (!active) {
          await prisma.pinnedList.update({ where: { id: primary.id }, data: { isActive: true } })
        }
      }

      const todoCount = await prisma.todo.count({ where: { userId } })
      if (todoCount === 0) {
        await prisma.$transaction(async (tx) => {
          const qaChecklist = await tx.todo.create({
            data: {
              title: 'Проверка перед релизом',
              completed: false,
              pinned: false,
              position: 0,
              userId,
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
                userId,
              },
              {
                title: 'Проверить ручные сценарии',
                completed: false,
                pinned: false,
                parentId: qaChecklist.id,
                position: 1,
                userId,
              },
              {
                title: 'Согласовать список изменений',
                completed: false,
                pinned: false,
                parentId: qaChecklist.id,
                position: 2,
                userId,
              },
            ],
          })

          const designIteration = await tx.todo.create({
            data: {
              title: 'Прототип интерфейса',
              completed: false,
              pinned: false,
              position: 1,
              userId,
            },
          })

          const feedback = await tx.todo.create({
            data: {
              title: 'Собрать обратную связь',
              completed: false,
              pinned: false,
              parentId: designIteration.id,
              position: 1,
              userId,
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
                userId,
              },
              {
                title: 'Созвон с командой продукта',
                completed: false,
                pinned: false,
                parentId: feedback.id,
                position: 0,
                userId,
              },
            ],
          })
        })
      }
    } finally {
      // noop
    }
  })()

  userSeedPromises.set(userId, promise)
  try {
    await promise
  } catch (error) {
    userSeedPromises.delete(userId)
    throw error
  }
}

async function getPrimaryList(userId: string) {
  await ensureSeedData(userId)
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

async function getActiveList(userId: string) {
  await ensureSeedData(userId)
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
  await ensureSeedData(userId)
  const lastTodo = await prisma.todo.findFirst({
    where: { parentId, userId },
    orderBy: { position: 'desc' },
  })
  return (lastTodo?.position ?? -1) + 1
}

async function getNextPinnedListPosition(userId: string) {
  await ensureSeedData(userId)
  const lastList = await prisma.pinnedList.findFirst({
    where: { userId },
    orderBy: { position: 'desc' },
  })
  return (lastList?.position ?? -1) + 1
}

async function getNextPinnedTodoPosition(userId: string, listId: string) {
  await ensureSeedData(userId)
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
    isActive: (list as any).isActive ?? false,
  }))
}

export async function getTodoState(userId: string): Promise<TodoState> {
  await ensureSeedData(userId)

  const [todos, tags] = await Promise.all([
    prisma.todo.findMany({ where: { userId }, include: { tags: true } }),
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

export async function replaceTodoState(userId: string, state: unknown): Promise<TodoState> {
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
      await tx.tag.createMany({ data: tagRecords.map((record) => ({ ...record, userId })) })
    }

    // Batch create todos instead of one by one
    if (todos.length > 0) {
      await tx.todo.createMany({
        data: todos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          completed: todo.completed,
          pinned: todo.pinned,
          alias: todo.alias,
          parentId: todo.parentId,
          position: todo.position,
          userId,
        })),
      })
    }

    // connect tags to todos in batches
    if (todoTagMap.size > 0) {
      const tagUpdates = Array.from(todoTagMap.entries())
      // Process in chunks to avoid too many sequential updates
      const CHUNK_SIZE = 50
      for (let i = 0; i < tagUpdates.length; i += CHUNK_SIZE) {
        const chunk = tagUpdates.slice(i, i + CHUNK_SIZE)
        await Promise.all(
          chunk.map(([todoId, tagIds]) =>
            tx.todo.update({
              where: { id: todoId },
              data: { tags: { set: [], connect: tagIds.map((id) => ({ id })) } },
            })
          )
        )
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
  }, {
    maxWait: 30000, // Максимум 30 секунд ожидания начала транзакции
    timeout: 600000, // Максимум 600 секунд на выполнение транзакции
  })

  return getTodoState(userId)
}

async function getTodoDepth(userId: string, id: string): Promise<number> {
  await ensureSeedData(userId)
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

async function getSubtreeDepth(userId: string, id: string): Promise<number> {
  await ensureSeedData(userId)
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

  await ensureSeedData(userId)

  if (parentId) {
    const parent = await prisma.todo.findFirst({ where: { id: parentId, userId } })
    if (!parent) {
      return getTodoState(userId)
    }
    const parentDepth = await getTodoDepth(userId, parentId)
    if (parentDepth >= MAX_DEPTH) {
      return getTodoState(userId)
    }
  }

  let connectTagIds: { id: string }[] = []
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    const uniqueTagIds = Array.from(new Set(tagIds))
    const allowedTags = await prisma.tag.findMany({
      where: { id: { in: uniqueTagIds }, userId },
      select: { id: true },
    })
    connectTagIds = allowedTags.map((tag) => ({ id: tag.id }))
  }

  // Insert new todo at the top (position = 0) and shift siblings down
  await prisma.$transaction(async (tx) => {
    // Shift positions of existing siblings (including roots when parentId is null)
    await tx.todo.updateMany({
      where: { parentId, userId },
      data: { position: { increment: 1 } },
    })

    // Create the new todo at position 0
    await tx.todo.create({
      data: {
        title: trimmed,
        parentId,
        position: 0,
        userId,
        ...(connectTagIds.length > 0 ? { tags: { connect: connectTagIds } } : {}),
      },
    })

    // If adding as pinned (later via togglePinned), do nothing here.
  })

  return getTodoState(userId)
}

export async function updateTodoDetails(
  userId: string,
  id: string,
  details: { title?: string; alias?: string | null },
): Promise<TodoState> {
  const data: Prisma.TodoUpdateInput = {}

  if (typeof details.title === 'string') {
    const trimmed = details.title.trim()
    if (!trimmed) {
      return getTodoState(userId)
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
    return getTodoState(userId)
  }

  await ensureSeedData(userId)

  const result = await prisma.todo.updateMany({
    where: { id, userId },
    data,
  })

  if (result.count === 0) {
    return getTodoState(userId)
  }

  return getTodoState(userId)
}

export async function updateTodoTitle(userId: string, id: string, title: string): Promise<TodoState> {
  return updateTodoDetails(userId, id, { title })
}

export async function toggleTodoCompleted(userId: string, id: string): Promise<TodoState> {
  await ensureSeedData(userId)
  const todo = await prisma.todo.findFirst({ where: { id, userId } })
  if (!todo) {
    return getTodoState(userId)
  }

  await prisma.todo.updateMany({
    where: { id, userId },
    data: { completed: !todo.completed, completedAt: todo.completed ? null : new Date() },
  })

  return getTodoState(userId)
}

export async function deleteTodo(userId: string, id: string): Promise<TodoState> {
  await ensureSeedData(userId)
  await prisma.todo.deleteMany({ where: { id, userId } })
  return getTodoState(userId)
}

// ----- Tags API -----
export async function listTags(userId: string): Promise<TodoState> {
  await ensureSeedData(userId)
  return getTodoState(userId)
}

export async function addTag(userId: string, name: string): Promise<TodoState> {
  const trimmed = name.trim()
  if (!trimmed) return getTodoState(userId)
  await ensureSeedData(userId)
  const maxPosition = await prisma.tag.findFirst({ where: { userId }, orderBy: { position: 'desc' } })
  const position = (maxPosition?.position ?? -1) + 1
  const isSystem = trimmed === 'Проект' || trimmed === 'Раздел'
  await prisma.tag.create({ data: { name: trimmed, position, isSystem, userId } })
  return getTodoState(userId)
}

export async function renameTag(userId: string, id: string, name: string): Promise<TodoState> {
  const trimmed = name.trim()
  if (!trimmed) return getTodoState(userId)
  await ensureSeedData(userId)
  const isSystem = trimmed === 'Проект' || trimmed === 'Раздел'
  await prisma.tag.updateMany({ where: { id, userId }, data: { name: trimmed, isSystem } })
  return getTodoState(userId)
}

export async function deleteTag(userId: string, id: string): Promise<TodoState> {
  await ensureSeedData(userId)
  await prisma.tag.deleteMany({ where: { id, userId } })
  return getTodoState(userId)
}

export async function reorderTags(userId: string, tagIds: string[]): Promise<TodoState> {
  await ensureSeedData(userId)
  await prisma.$transaction(
    tagIds.map((id, index) =>
      prisma.tag.updateMany({
        where: { id, userId },
        data: { position: index },
      }),
    ),
  )
  return getTodoState(userId)
}

export async function attachTagToTodo(userId: string, todoId: string, tagId: string): Promise<TodoState> {
  await ensureSeedData(userId)
  const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } })
  if (!todo) return getTodoState(userId)

  const tag = await prisma.tag.findFirst({ where: { id: tagId, userId } })
  if (!tag) return getTodoState(userId)

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
        WHERE tg."name" = 'Раздел'
          AND tt."id" IN (SELECT "id" FROM subtree)
          AND tt."userId" = ${userId}
          AND tg."userId" = ${userId}
        LIMIT 1;
      `
      if (rows.length > 0) return getTodoState(userId)
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
        WHERE tg."name" = 'Раздел'
          AND tt."id" IN (SELECT "id" FROM subtree)
          AND tt."userId" = ${userId}
          AND tg."userId" = ${userId};
      `
      if (rows[0]?.found) return getTodoState(userId)
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
    if (!rows[0]?.hasProject) return getTodoState(userId)
  }

  await prisma.todo.update({ where: { id: todoId }, data: { tags: { connect: { id: tagId } } } })
  return getTodoState(userId)
}

export async function detachTagFromTodo(userId: string, todoId: string, tagId: string): Promise<TodoState> {
  await ensureSeedData(userId)
  const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } })
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
  await ensureSeedData(userId)
  const todo = await prisma.todo.findFirst({ where: { id, userId } })
  if (!todo) {
    return getTodoState(userId)
  }

  if (targetParentId) {
    const parentExists = await prisma.todo.findFirst({ where: { id: targetParentId, userId } })
    if (!parentExists) {
      return getTodoState(userId)
    }

    if (parentExists.id === id) {
      return getTodoState(userId)
    }

    const parentDepth = Number(await getTodoDepth(userId, targetParentId))
    const subtreeDepth = Number(await getSubtreeDepth(userId, id))
    if (parentDepth + 1 + subtreeDepth > MAX_DEPTH) {
      return getTodoState(userId)
    }

    // ensure not moving into descendant (single query via recursive CTE)
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
        return getTodoState(userId)
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
        return getTodoState(userId)
      }
    }
  } else {
    const subtreeDepth = Number(await getSubtreeDepth(userId, id))
    if (subtreeDepth > MAX_DEPTH) {
      return getTodoState(userId)
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

    // Single SQL UPDATE for all affected rows (same parent)
    const rows = order.map((todoId, index) => ({ id: todoId, parentId: sourceParentId, position: index }))
    await bulkRepositionTodos(userId, rows)

    return getTodoState(userId)
  }

  const sourceOrder = sourceSiblings.filter((item) => item.id !== id).map((item) => item.id)
  const targetOrder = targetSiblings.map((item) => item.id)
  const bounded = Math.min(Math.max(nextIndex, 0), targetOrder.length)
  targetOrder.splice(bounded, 0, id)

  // Single SQL UPDATE for both source and target lists (cross-parent move)
  const rows = [
    ...sourceOrder.map((todoId, index) => ({ id: todoId, parentId: sourceParentId, position: index })),
    ...targetOrder.map((todoId, index) => ({ id: todoId, parentId: targetParentId, position: index })),
  ]

  await bulkRepositionTodos(userId, rows)

  return getTodoState(userId)
}

export async function togglePinned(userId: string, id: string): Promise<TodoState> {
  await ensureSeedData(userId)
  const todo = await prisma.todo.findFirst({ where: { id, userId } })
  if (!todo) {
    return getTodoState(userId)
  }

  if (todo.pinned) {
    await prisma.$transaction([
      prisma.todo.update({ where: { id }, data: { pinned: false } }),
      prisma.pinnedTodo.deleteMany({ where: { todoId: id, pinnedList: { userId } } }),
    ])
  } else {
    // Choose active list if set, otherwise primary
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
  await ensureSeedData(userId)
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

// ---- Вспомогательные функции специфичные для БД ----

interface RepositionRow { id: string; parentId: string | null; position: number }

/**
 * Массовое обновление parentId/position для набора Todo.
 * Postgres: один UPDATE ... FROM (VALUES ...)
 * SQLite: батч updateMany (обычно количество элементов невелико -> допустимо)
 */
async function bulkRepositionTodos(userId: string, rows: RepositionRow[]) {
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
    const values = rows.map((r) => Prisma.sql`(${r.id}, ${r.parentId}, ${r.position}, ${userId})`)
    await prisma.$executeRaw`UPDATE "Todo" AS t
      SET "parentId" = v.parent_id,
          "position" = v.position
      FROM (VALUES ${Prisma.join(values)}) AS v(id, parent_id, position, user_id)
      WHERE t."id" = v.id AND t."userId" = user_id;`
  }
}

export async function addPinnedList(userId: string, title: string): Promise<TodoState> {
  const trimmed = title.trim()
  if (!trimmed) {
    return getTodoState(userId)
  }

  await ensureSeedData(userId)

  const position = await getNextPinnedListPosition(userId)
  await prisma.pinnedList.create({
    data: {
      title: trimmed,
      position,
      isPrimary: position === 0,
      isActive: position === 0 && !(await prisma.pinnedList.findFirst({ where: { userId, isActive: true } })),
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

  await ensureSeedData(userId)

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
  await ensureSeedData(userId)
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
      where: { pinnedListId: id, pinnedList: { userId } },
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

  return getTodoState(userId)
}

export async function setActivePinnedList(userId: string, id: string): Promise<TodoState> {
  await ensureSeedData(userId)
  const list = await prisma.pinnedList.findFirst({ where: { id, userId } })
  if (!list) return getTodoState(userId)
  await prisma.$transaction(async (tx) => {
    await tx.pinnedList.updateMany({ where: { userId }, data: { isActive: false } })
    await tx.pinnedList.update({ where: { id }, data: { isActive: true } })
  })
  return getTodoState(userId)
}

/**
 * Получить случайную цепочку todo (от корня до листового незавершённого элемента)
 * Возвращает массив todo от корня до листа
 */
export async function getRandomTodoChain(userId: string): Promise<(Todo & { tags: Tag[] })[]> {
  await ensureSeedData(userId)
  
  // Получаем все незавершённые листовые todo (у которых нет детей и completed = false) с тегами
  const allTodos = await prisma.todo.findMany({
    where: { completed: false, userId },
    include: { tags: true },
    orderBy: { position: 'asc' }
  })
  
  // Находим листовые элементы (у которых нет детей)
  const leafTodos = allTodos.filter(todo => {
    return !allTodos.some(t => t.parentId === todo.id)
  })
  
  if (leafTodos.length === 0) {
    return []
  }
  
  // Выбираем случайный листовой элемент
  const randomLeaf = leafTodos[Math.floor(Math.random() * leafTodos.length)]
  
  // Строим цепочку от корня до листа
  const chain: (Todo & { tags: Tag[] })[] = [randomLeaf]
  let currentId = randomLeaf.parentId
  
  while (currentId) {
    const parent = allTodos.find(t => t.id === currentId)
    if (!parent) break
    chain.unshift(parent)
    currentId = parent.parentId
  }
  
  return chain
}
