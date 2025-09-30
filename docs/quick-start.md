# Быстрый старт

## Первоначальная настройка

### 1. Установите зависимости
```bash
pnpm install
```

### 2. Инициализируйте базу данных SQLite
```bash
# Создайте .env файл (или используйте .env.local.example)
cp .env.local.example .env

# Синхронизируйте схему БД
pnpm db:push:dev

# Запустите приложение
pnpm dev
```

Приложение будет доступно на `http://localhost:3000`

## Полезные команды

```bash
# Запустить dev-сервер
pnpm dev

# Открыть Prisma Studio для просмотра данных
pnpm db:studio

# Синхронизировать схему БД (без миграций)
pnpm db:push:dev

# Проверить линтер
pnpm lint

# Собрать для production
pnpm build

# Запустить production сборку
pnpm start
```

## Примечания

- Проект использует **SQLite** для разработки - простая файловая БД, не требует установки сервера
- База данных хранится в файле `dev.db` в корне проекта
- Для продакшена используется PostgreSQL (настройки деплоя в отдельной документации)

## Структура файлов БД

- `prisma/schema.prisma` - единая схема с автоматически обновляемым datasource блоком
  - Блок между маркерами `DATASOURCE_START` и `DATASOURCE_END` автоматически заменяется скриптом
- `prisma/dev.db` - файл SQLite базы данных (создаётся автоматически)
- `scripts/switch-db.js` - скрипт для переключения между SQLite и PostgreSQL

## Решение проблем

### "Database does not exist"
```bash
# Для PostgreSQL создайте БД:
createdb todo_app
createdb todo_app_shadow

# Для SQLite просто запустите:
pnpm db:push:dev
```

### "Prisma Client не сгенерирован"
```bash
pnpm prisma:generate
```

### "Миграции не применены"
```bash
# Для dev (SQLite)
pnpm db:push:dev

# Для prod (PostgreSQL)
pnpm db:migrate:deploy
```
