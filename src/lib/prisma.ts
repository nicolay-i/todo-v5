import fs from 'node:fs'
import path from 'node:path'

import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

type PrismaSchemaInfo = {
  engineType?: string
  provider?: string
}

const readPrismaSchemaInfo = (): PrismaSchemaInfo => {
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')

  try {
    const schema = fs.readFileSync(schemaPath, 'utf8')
    const engineType = schema.match(/engineType\s*=\s*"(.*?)"/)?.[1]
    const provider = schema.match(/datasource\s+db\s*{[^}]*provider\s*=\s*"(.*?)"/s)?.[1]

    return { engineType, provider }
  } catch (error) {
    console.warn('[prisma] Не удалось прочитать prisma/schema.prisma:', error)
    return {}
  }
}

// Определяем режим из env, но дополнительно сверяемся со схемой, чтобы не промахнуться с provider
const schemaInfo = readPrismaSchemaInfo()
const databaseMode = process.env.DATABASE_MODE || 'prod'
const isDevModeByEnv = databaseMode === 'dev'
const sqliteUrl = process.env.DATABASE_URL_SQLITE || ''
const postgresUrl = process.env.DATABASE_URL || ''

// Предпочитаем PostgreSQL, если схема переключена в режим postgres либо явно задан URL
const shouldUsePostgreSQL =
  schemaInfo.provider === 'postgresql' ||
  (!isDevModeByEnv && !!postgresUrl)

// В dev режиме очищаем глобальный кэш при каждом перезапуске для избежания проблем с кэшированием
// Это гарантирует, что используется свежий экземпляр Prisma Client с правильным engineType
if (process.env.NODE_ENV === 'development' && isDevModeByEnv) {
  globalForPrisma.prisma = undefined
}
if (shouldUsePostgreSQL && !postgresUrl) {
  throw new Error(
    'DATABASE_URL не задан. Для PostgreSQL требуется указать DATABASE_URL (и переключить схему командой pnpm mode:prod).',
  )
}

if (!shouldUsePostgreSQL && !sqliteUrl) {
  throw new Error(
    'DATABASE_URL_SQLITE не задан. Для SQLite укажите DATABASE_URL_SQLITE (и переключите схему командой pnpm mode:dev).',
  )
}

// В Prisma 7 для всех баз данных используются драйверы через adapter API
let adapter: PrismaPg | PrismaBetterSqlite3
if (shouldUsePostgreSQL) {
  const pool = new Pool({ connectionString: postgresUrl })
  adapter = new PrismaPg(pool)
} else {
  adapter = new PrismaBetterSqlite3({
    url: sqliteUrl,
    timestampFormat: 'unixepoch-ms',
  })
}

const prismaConfig: ConstructorParameters<typeof PrismaClient>[0] = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  adapter,
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaConfig)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
