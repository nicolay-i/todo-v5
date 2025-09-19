import { randomUUID } from 'node:crypto'
import type { Todo, Tag } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { MAX_DEPTH } from './constants'
import { prisma } from './prisma'
import type { PinnedListState, TodoNode, TodoState } from './types'

let schemaInitialized = false
let seedInitialized = false

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

async function ensureDatabase() {
  // No-op: schema is managed by Prisma migrations for Postgres
  if (schemaInitialized) return
  schemaInitialized = true
}

async function ensureSeedData() {
  await ensureDatabase()
  if (seedInitialized) return

  // Ensure primary pinned list exists once
  let primary = await prisma.pinnedList.findFirst({ orderBy: { position: 'asc' } })
  if (!primary) {
    primary = await prisma.pinnedList.create({
      data: { title: 'Главное', isPrimary: true, isActive: true, position: 0 },
    })
  } else {
    if (!primary.isPrimary) {
      await prisma.pinnedList.update({ where: { id: primary.id }, data: { isPrimary: true } })
    }
    // Ensure there is exactly one active list; default to primary if none
    const active = await prisma.pinnedList.findFirst({ where: { isActive: true } })
    if (!active) {
      await prisma.pinnedList.update({ where: { id: primary.id }, data: { isActive: true } })
    }
  }

  // Seed demo todos only if DB is empty
  const count = await prisma.todo.count()
  if (count === 0) {
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
            completedAt: new Date(),
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

  seedInitialized = true
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

async function getActiveList() {
  await ensureSeedData()
  let active = await prisma.pinnedList.findFirst({ where: { isActive: true }, orderBy: { position: 'asc' } })
  if (!active) {
    const primary = await getPrimaryList()
    active = await prisma.pinnedList.update({ where: { id: primary.id }, data: { isActive: true } })
  }
  return active
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
    isActive: (list as any).isActive ?? false,
  }))
}

export async function getTodoState(): Promise<TodoState> {
  await ensureSeedData()

  const [todos, tags] = await Promise.all([
    prisma.todo.findMany({ include: { tags: true } }),
    prisma.tag.findMany({ orderBy: { name: 'asc' } }),
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

export async function replaceTodoState(state: unknown): Promise<TodoState> {
  const todos: NormalizedTodoRecord[] = []
  const idSet = new Set<string>()
  const parsed = (state as Partial<TodoState>) ?? {}
  normalizeTodos(parsed.todos ?? [], null, 0, todos, idSet)

  // normalize tags (top-level)
  const tagRecords: { id: string; name: string }[] = []
  const tagIdSet = new Set<string>()
  if (Array.isArray((parsed as any).tags)) {
    for (const raw of (parsed as any).tags as any[]) {
      if (!raw || typeof raw !== 'object') continue
      const rid = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : randomUUID()
      const id = tagIdSet.has(rid) ? randomUUID() : rid
      tagIdSet.add(id)
      const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : 'Без имени'
      tagRecords.push({ id, name })
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
    await tx.pinnedTodo.deleteMany()
    await tx.pinnedList.deleteMany()
    await tx.tag.deleteMany()
    await tx.todo.deleteMany()

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

async function getTodoDepth(id: string): Promise<number> {
  await ensureSeedData()
  const rows = await prisma.$queryRaw<{ depth: number | null }[]>`
    WITH RECURSIVE ancestors AS (
      SELECT "parentId", 0::int AS depth FROM "Todo" WHERE "id" = ${id}
      UNION ALL
      SELECT t."parentId", ancestors.depth + 1
      FROM "Todo" t
      JOIN ancestors ON t."id" = ancestors."parentId"
    )
    SELECT COALESCE(MAX(depth), 0) AS depth FROM ancestors;
  `
  return rows[0]?.depth ?? 0
}

async function getSubtreeDepth(id: string): Promise<number> {
  await ensureSeedData()
  const rows = await prisma.$queryRaw<{ maxDepth: number | null }[]>`
    WITH RECURSIVE tree AS (
      SELECT "id", "parentId", 0::int AS depth FROM "Todo" WHERE "id" = ${id}
      UNION ALL
      SELECT t."id", t."parentId", tree.depth + 1
      FROM "Todo" t
      JOIN tree ON t."parentId" = tree."id"
    )
    SELECT COALESCE(MAX(depth), 0) AS "maxDepth" FROM tree;
  `
  return rows[0]?.maxDepth ?? 0
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

  // Insert new todo at the top (position = 0) and shift siblings down
  await prisma.$transaction(async (tx) => {
    // Shift positions of existing siblings (including roots when parentId is null)
    await tx.todo.updateMany({
      where: { parentId },
      data: { position: { increment: 1 } },
    })

    // Create the new todo at position 0
    const created = await tx.todo.create({
      data: {
        title: trimmed,
        parentId,
        position: 0,
      },
    })

    // If adding as pinned (later via togglePinned), do nothing here.
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
  data: { completed: !todo.completed, completedAt: todo.completed ? null : new Date() },
  })

  return getTodoState()
}

export async function deleteTodo(id: string): Promise<TodoState> {
  await ensureSeedData()
  await prisma.todo.delete({ where: { id } })
  return getTodoState()
}

// ----- Tags API -----
export async function listTags(): Promise<TodoState> {
  await ensureSeedData()
  return getTodoState()
}

export async function addTag(name: string): Promise<TodoState> {
  const trimmed = name.trim()
  if (!trimmed) return getTodoState()
  await ensureSeedData()
  await prisma.tag.create({ data: { name: trimmed } })
  return getTodoState()
}

export async function renameTag(id: string, name: string): Promise<TodoState> {
  const trimmed = name.trim()
  if (!trimmed) return getTodoState()
  await ensureSeedData()
  await prisma.tag.update({ where: { id }, data: { name: trimmed } })
  return getTodoState()
}

export async function deleteTag(id: string): Promise<TodoState> {
  await ensureSeedData()
  await prisma.tag.delete({ where: { id } })
  return getTodoState()
}

export async function attachTagToTodo(todoId: string, tagId: string): Promise<TodoState> {
  await ensureSeedData()
  await prisma.todo.update({ where: { id: todoId }, data: { tags: { connect: { id: tagId } } } })
  return getTodoState()
}

export async function detachTagFromTodo(todoId: string, tagId: string): Promise<TodoState> {
  await ensureSeedData()
  await prisma.todo.update({ where: { id: todoId }, data: { tags: { disconnect: { id: tagId } } } })
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

    // ensure not moving into descendant (single query via recursive CTE)
    const descendantRows = await prisma.$queryRaw<{ exists: boolean }[]>`
      WITH RECURSIVE subtree AS (
        SELECT "id" FROM "Todo" WHERE "id" = ${id}
        UNION ALL
        SELECT t."id" FROM "Todo" t
        JOIN subtree ON t."parentId" = subtree."id"
      )
      SELECT EXISTS(SELECT 1 FROM subtree WHERE "id" = ${targetParentId}) AS exists;
    `
    if (descendantRows[0]?.exists) {
      return getTodoState()
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

    // Single SQL UPDATE for all affected rows (same parent)
    const rows = order.map((todoId, index) =>
      Prisma.sql`(${todoId}, ${sourceParentId}, ${index})`,
    )

    await prisma.$executeRaw`UPDATE "Todo" AS t
      SET "parentId" = v.parent_id,
          "position" = v.position
      FROM (VALUES ${Prisma.join(rows)}) AS v(id, parent_id, position)
      WHERE t."id" = v.id;`

    return getTodoState()
  }

  const sourceOrder = sourceSiblings.filter((item) => item.id !== id).map((item) => item.id)
  const targetOrder = targetSiblings.map((item) => item.id)
  const bounded = Math.min(Math.max(nextIndex, 0), targetOrder.length)
  targetOrder.splice(bounded, 0, id)

  // Single SQL UPDATE for both source and target lists (cross-parent move)
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
      isActive: position === 0 && !(await prisma.pinnedList.findFirst({ where: { isActive: true } })),
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
  await ensureSeedData()
  const list = await prisma.pinnedList.findUnique({ where: { id } })
  if (!list) return getTodoState()
  await prisma.$transaction(async (tx) => {
    await tx.pinnedList.updateMany({ data: { isActive: false } })
    await tx.pinnedList.update({ where: { id }, data: { isActive: true } })
  })
  return getTodoState()
}
