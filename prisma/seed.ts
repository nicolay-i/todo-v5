import Database from 'better-sqlite3'
import path from 'path'

const databasePath = path.resolve(process.cwd(), 'prisma/dev.db')
const db = new Database(databasePath)
db.pragma('foreign_keys = OFF')

db.exec(`
  DELETE FROM "PinnedEntry";
  DELETE FROM "Todo";
  DELETE FROM "PinnedList";
`)

db.pragma('foreign_keys = ON')

const insertList = db.prepare('INSERT INTO "PinnedList" (id, title, position) VALUES (lower(hex(randomblob(16))), ?, ?)')
const insertTodo = db.prepare(
  'INSERT INTO "Todo" (id, title, completed, pinned, parentId, position) VALUES (lower(hex(randomblob(16))), ?, ?, 0, ?, ?)',
)

const createTodo = (
  title: string,
  options: { completed?: boolean; parentId?: string | null; position: number },
): string => {
  const info = insertTodo.run(title, options.completed ? 1 : 0, options.parentId ?? null, options.position)
  const idStmt = db.prepare('SELECT id FROM "Todo" WHERE rowid = ?')
  return (idStmt.get(Number(info.lastInsertRowid)) as { id: string } | undefined)?.id as string
}

const listInfo = insertList.run('Главное', 0)
const listIdSelect = db.prepare('SELECT id FROM "PinnedList" WHERE rowid = ?')
const primaryListId = (listIdSelect.get(Number(listInfo.lastInsertRowid)) as { id: string } | undefined)?.id as string

const firstRoot = createTodo('Проверка перед релизом', { position: 0 })
createTodo('Прогнать авто-тесты', { position: 0, parentId: firstRoot, completed: true })
createTodo('Проверить ручные сценарии', { position: 1, parentId: firstRoot })
createTodo('Согласовать список изменений', { position: 2, parentId: firstRoot })

const secondRoot = createTodo('Прототип интерфейса', { position: 1 })
createTodo('Скетч основных экранов', { position: 0, parentId: secondRoot })
const feedback = createTodo('Собрать обратную связь', { position: 1, parentId: secondRoot })
createTodo('Созвон с командой продукта', { position: 0, parentId: feedback })

console.log('Database seeded. Primary list id:', primaryListId)
