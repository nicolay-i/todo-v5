import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import type { PinnedEntry, PinnedList, Todo } from '@prisma/client'
import { MAX_DEPTH } from '@/lib/constants'
import {
  buildChildrenMap,
  buildParentMap,
  composeAppState,
  getDepth,
  getSubtreeDepth,
  isDescendant,
} from '@/lib/state'
import type { AppState } from '@/types/state'

const databasePath = path.resolve(process.cwd(), 'prisma/dev.db')

if (!fs.existsSync(databasePath)) {
  throw new Error(`Database not found at ${databasePath}. Run the migration SQL to create it.`)
}

const db = new Database(databasePath)
db.pragma('foreign_keys = ON')

type TodoRow = Omit<Todo, 'completed' | 'pinned'> & { completed: number; pinned: number }
type PinnedListRow = PinnedList
type PinnedEntryRow = PinnedEntry

type PinnedListWithEntries = PinnedList & {
  entries: Array<PinnedEntry & { todo: Todo }>
}

const mapTodo = (row: TodoRow): Todo => ({
  ...row,
  completed: Boolean(row.completed),
  pinned: Boolean(row.pinned),
})

function fetchTodos(): Todo[] {
  const stmt = db.prepare('SELECT * FROM "Todo" ORDER BY position ASC')
  return (stmt.all() as TodoRow[]).map(mapTodo)
}

function fetchPinnedLists(): PinnedListWithEntries[] {
  const listsStmt = db.prepare('SELECT * FROM "PinnedList" ORDER BY position ASC')
  const lists = listsStmt.all() as PinnedListRow[]

  const entryStmt = db.prepare('SELECT * FROM "PinnedEntry" WHERE listId = ? ORDER BY position ASC')
  const todoStmt = db.prepare('SELECT * FROM "Todo" WHERE id = ?')

  return lists.map((list) => {
    const entries = (entryStmt.all(list.id) as PinnedEntryRow[]).map((entry) => ({
      ...entry,
      todo: mapTodo(todoStmt.get(entry.todoId) as TodoRow),
    }))
    return { ...list, entries }
  })
}

export function getAppStateFromDb(): AppState {
  const todos = fetchTodos()
  let pinnedLists = fetchPinnedLists()
  if (pinnedLists.length === 0) {
    ensurePrimaryList()
    pinnedLists = fetchPinnedLists()
  }
  return composeAppState(todos, pinnedLists)
}

function getMaxPosition(parentId: string | null): number {
  if (parentId) {
    const stmt = db.prepare('SELECT COALESCE(MAX(position), -1) AS maxPos FROM "Todo" WHERE parentId = ?')
    return (stmt.get(parentId) as { maxPos: number } | undefined)?.maxPos ?? -1
  }
  const stmt = db.prepare('SELECT COALESCE(MAX(position), -1) AS maxPos FROM "Todo" WHERE parentId IS NULL')
  return (stmt.get() as { maxPos: number } | undefined)?.maxPos ?? -1
}

export function insertTodo(title: string, parentId: string | null) {
  const trimmed = title.trim()
  if (!trimmed) return

  if (parentId) {
    const todos = fetchTodos()
    const parent = todos.find((todo) => todo.id === parentId)
    if (!parent) {
      throw new Error('Родительская задача не найдена')
    }
    const parentMap = buildParentMap(todos)
    const parentDepth = getDepth(parentId, parentMap)
    if (parentDepth + 1 > MAX_DEPTH) {
      throw new Error('Превышена максимальная вложенность задач')
    }
  }

  const position = getMaxPosition(parentId) + 1
  const stmt = db.prepare('INSERT INTO "Todo" (id, title, completed, pinned, parentId, position) VALUES (lower(hex(randomblob(16))), ?, 0, 0, ?, ?)')
  stmt.run(trimmed, parentId, position)
}

export function updateTodoTitle(id: string, title: string) {
  const trimmed = title.trim()
  if (!trimmed) return
  const stmt = db.prepare('UPDATE "Todo" SET title = ? WHERE id = ?')
  const result = stmt.run(trimmed, id)
  if (result.changes === 0) {
    throw new Error('Задача не найдена')
  }
}

export function updateTodoCompleted(id: string, completed: boolean) {
  const stmt = db.prepare('UPDATE "Todo" SET completed = ? WHERE id = ?')
  const result = stmt.run(completed ? 1 : 0, id)
  if (result.changes === 0) {
    throw new Error('Задача не найдена')
  }
}

export function deleteTodo(id: string) {
  const stmt = db.prepare('DELETE FROM "Todo" WHERE id = ?')
  const result = stmt.run(id)
  if (result.changes === 0) {
    throw new Error('Задача не найдена')
  }
}

function ensurePrimaryList(): PinnedList {
  const stmt = db.prepare('SELECT * FROM "PinnedList" ORDER BY position ASC LIMIT 1')
  const list = stmt.get() as PinnedListRow | undefined
  if (list) return list
  const insert = db.prepare('INSERT INTO "PinnedList" (id, title, position) VALUES (lower(hex(randomblob(16))), ?, 0)')
  const info = insert.run('Главное')
  const created = db.prepare('SELECT * FROM "PinnedList" WHERE rowid = ?')
  return created.get(info.lastInsertRowid) as PinnedListRow
}

export function togglePinned(id: string, pinned: boolean) {
  const todoStmt = db.prepare('SELECT * FROM "Todo" WHERE id = ?')
  const row = todoStmt.get(id) as TodoRow | undefined
  if (!row) {
    throw new Error('Задача не найдена')
  }

  const update = db.prepare('UPDATE "Todo" SET pinned = ? WHERE id = ?')

  if (pinned) {
    const primary = ensurePrimaryList()
    const entryStmt = db.prepare('SELECT * FROM "PinnedEntry" WHERE todoId = ?')
    const existing = entryStmt.get(id) as PinnedEntryRow | undefined
    const maxPositionStmt = db.prepare('SELECT COALESCE(MAX(position), -1) AS maxPos FROM "PinnedEntry" WHERE listId = ?')
    const nextPosition = (maxPositionStmt.get(primary.id) as { maxPos: number } | undefined)?.maxPos ?? -1

    const insertEntry = db.prepare(
      'INSERT INTO "PinnedEntry" (id, position, todoId, listId) VALUES (lower(hex(randomblob(16))), ?, ?, ?)',
    )
    const updateEntry = db.prepare('UPDATE "PinnedEntry" SET listId = ?, position = ? WHERE id = ?')

    db.transaction(() => {
      update.run(1, id)
      if (!existing) {
        insertEntry.run(nextPosition + 1, id, primary.id)
      } else {
        updateEntry.run(primary.id, nextPosition + 1, existing.id)
      }
    })()
  } else {
    const deleteEntry = db.prepare('DELETE FROM "PinnedEntry" WHERE todoId = ?')
    db.transaction(() => {
      update.run(0, id)
      deleteEntry.run(id)
    })()
  }
}

export function moveTodo(id: string, targetParentId: string | null, targetIndex: number) {
  const todos = fetchTodos()
  const todo = todos.find((item) => item.id === id)
  if (!todo) {
    throw new Error('Задача не найдена')
  }

  if (targetParentId) {
    const parent = todos.find((item) => item.id === targetParentId)
    if (!parent) {
      throw new Error('Родительская задача не найдена')
    }
  }

  if (targetParentId === id) {
    throw new Error('Нельзя переместить задачу внутрь самой себя')
  }

  const parentMap = buildParentMap(todos)
  const childrenMap = buildChildrenMap(todos)

  if (targetParentId && isDescendant(id, targetParentId, childrenMap)) {
    throw new Error('Нельзя переместить задачу внутрь самой себя')
  }

  const subtreeDepth = getSubtreeDepth(id, childrenMap)
  const targetDepth = targetParentId ? getDepth(targetParentId, parentMap) + 1 : 0
  if (targetDepth + subtreeDepth > MAX_DEPTH) {
    throw new Error('Превышена максимальная вложенность задач')
  }

  const sourceParentId = todo.parentId ?? null
  const sourceSiblings = [...(childrenMap.get(sourceParentId) ?? [])]
  const targetSiblingsRaw = targetParentId === sourceParentId ? sourceSiblings : [...(childrenMap.get(targetParentId) ?? [])]

  const targetSiblings = targetParentId === sourceParentId
    ? targetSiblingsRaw.filter((item) => item.id !== id)
    : targetSiblingsRaw

  const clampedIndex = Math.max(0, Math.min(targetIndex, targetSiblings.length))
  const moved: Todo = { ...todo, parentId: targetParentId ?? null }
  targetSiblings.splice(clampedIndex, 0, moved)

  const remainingSource = targetParentId === sourceParentId
    ? targetSiblings
    : sourceSiblings.filter((item) => item.id !== id)

  const updatePosition = db.prepare('UPDATE "Todo" SET position = ?, parentId = ? WHERE id = ?')

  db.transaction(() => {
    if (targetParentId !== sourceParentId) {
      remainingSource.forEach((sibling, index) => {
        updatePosition.run(index, sibling.parentId ?? null, sibling.id)
      })
    }

    targetSiblings.forEach((sibling, index) => {
      const parentId = sibling.id === id ? targetParentId : sibling.parentId ?? null
      updatePosition.run(index, parentId, sibling.id)
    })
  })()
}

export function movePinnedTodo(todoId: string, listId: string, targetIndex: number) {
  const listStmt = db.prepare('SELECT * FROM "PinnedList" WHERE id = ?')
  const list = listStmt.get(listId) as PinnedListRow | undefined
  if (!list) {
    throw new Error('Целевой список не найден')
  }

  const entryStmt = db.prepare('SELECT * FROM "PinnedEntry" WHERE todoId = ?')
  const entry = entryStmt.get(todoId) as PinnedEntryRow | undefined
  if (!entry) {
    throw new Error('Закрепленная задача не найдена')
  }

  const sourceEntriesStmt = db.prepare('SELECT * FROM "PinnedEntry" WHERE listId = ? ORDER BY position ASC')
  const sourceEntries = sourceEntriesStmt.all(entry.listId) as PinnedEntryRow[]
  const targetEntriesRaw = listId === entry.listId
    ? sourceEntries
    : (sourceEntriesStmt.all(listId) as PinnedEntryRow[])

  const targetEntries = listId === entry.listId
    ? targetEntriesRaw.filter((item) => item.todoId !== todoId)
    : targetEntriesRaw

  const clampedIndex = Math.max(0, Math.min(targetIndex, targetEntries.length))
  const moved: PinnedEntry = { ...entry, listId }
  targetEntries.splice(clampedIndex, 0, moved)

  const remainingSource = listId === entry.listId
    ? targetEntries
    : sourceEntries.filter((item) => item.todoId !== todoId)

  const updateEntry = db.prepare('UPDATE "PinnedEntry" SET listId = ?, position = ? WHERE id = ?')

  db.transaction(() => {
    if (listId !== entry.listId) {
      remainingSource.forEach((item, index) => {
        updateEntry.run(item.listId, index, item.id)
      })
    }

    targetEntries.forEach((item, index) => {
      const targetListId = item.todoId === todoId ? listId : item.listId
      updateEntry.run(targetListId, index, item.id)
    })
  })()
}

export function addPinnedList(title: string) {
  const trimmed = title.trim()
  if (!trimmed) return
  const maxStmt = db.prepare('SELECT COALESCE(MAX(position), -1) AS maxPos FROM "PinnedList"')
  const max = (maxStmt.get() as { maxPos: number } | undefined)?.maxPos ?? -1
  const stmt = db.prepare('INSERT INTO "PinnedList" (id, title, position) VALUES (lower(hex(randomblob(16))), ?, ?)')
  stmt.run(trimmed, max + 1)
}

export function renamePinnedList(id: string, title: string) {
  const trimmed = title.trim()
  if (!trimmed) return
  const stmt = db.prepare('UPDATE "PinnedList" SET title = ? WHERE id = ?')
  const result = stmt.run(trimmed, id)
  if (result.changes === 0) {
    throw new Error('Список не найден')
  }
}

export function deletePinnedList(id: string) {
  const lists = fetchPinnedLists()
  if (lists.length === 0) {
    throw new Error('Нет списков для удаления')
  }
  const primary = lists[0]
  if (primary.id === id) {
    throw new Error('Первый список нельзя удалить')
  }

  const list = lists.find((item) => item.id === id)
  if (!list) {
    throw new Error('Список не найден')
  }

  const updateEntry = db.prepare('UPDATE "PinnedEntry" SET listId = ?, position = ? WHERE id = ?')
  const deleteListStmt = db.prepare('DELETE FROM "PinnedList" WHERE id = ?')
  const fetchPrimaryEntries = db.prepare('SELECT * FROM "PinnedEntry" WHERE listId = ? ORDER BY position ASC')

  db.transaction(() => {
    const primaryEntries = fetchPrimaryEntries.all(primary.id) as PinnedEntryRow[]
    let position = primaryEntries.length
    list.entries.forEach((entry) => {
      updateEntry.run(primary.id, position, entry.id)
      position += 1
    })
    deleteListStmt.run(id)
  })()
}

export function isPrimaryList(id: string): boolean {
  const stmt = db.prepare('SELECT id FROM "PinnedList" ORDER BY position ASC LIMIT 1')
  const list = stmt.get() as { id: string } | undefined
  return list?.id === id
}
