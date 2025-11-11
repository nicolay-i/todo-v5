# Copilot / AI Agent Guide

Цель: быстрый онбординг ИИ в ключевые инварианты и паттерны проекта.

## Архитектура
Next.js (App Router) + Prisma (SQLite) + MobX + Tailwind. Все бизнес‑операции строго в `src/lib/todoService.ts`; API роуты — тонкие прокси возвращающие полный `TodoState`.

Структура также описывается в файле plans/Техническое описание системы.md

### Структура компонентов
- **`src/pages/`** — компоненты-экраны/вкладки приложения:
  - `AllTasksTab.tsx` — вкладка со списком всех задач
  - `PinnedTab.tsx` — вкладка с закреплёнными слотами
  - `SettingsTab.tsx` — настройки, профиль, управление тегами, импорт/экспорт
  - `RandomTodoTab.tsx` — случайная задача
- **`src/components/`** — переиспользуемые компоненты UI:
  - `TabLayout.tsx` — базовый layout с навигацией по вкладкам, управлением URL и глобальными хоткеями
  - `AddTodoModal.tsx` — модальное окно добавления задачи с выбором тегов
  - `TodoItem.tsx`, `TodoTreeView.tsx`, `PinnedList.tsx` и др.
- **`src/stores/`** — MobX стейт менеджмент (TodoStore, TagStore, RandomTodoStore, NotificationStore)

## База данных
Проект использует **SQLite** для разработки — простая файловая БД, не требует установки сервера. База данных хранится в файле `dev.db` в корне проекта.

Схема находится в `prisma/schema.prisma`.

## Домен
`TodoState { todos, pinnedLists, tags }`. Дерево строится из плоских `Todo` по `parentId` + `position`. Глубина ограничена `MAX_DEPTH=3` (серверные проверки `getTodoDepth/getSubtreeDepth`, клиент `TodoStore.canDrop`).

## Инварианты
1 primary pinned list (isPrimary=true). Ровно 1 active (isActive=true) — если нет, активируется primary. Все мутации возвращают целостное состояние, без частичных патчей / ошибок наружу (в ошибках просто текущее состояние).

## Позиционирование
Добавление: новая задача всегда вставляется на позицию 0, остальные сдвигаются (`updateMany increment`). Перемещения: пересобираем порядки и выполняем 1 батч SQL (`UPDATE ... FROM (VALUES ...)`) для минимизации round‑trip.

## Pinned Lists
`togglePinned(id)` меняет флаг + создаёт/удаляет `PinnedTodo` в активном списке (позиция через `getNextPinnedTodoPosition`). `movePinnedTodo` поддерживает внутри / между списками с переиндексацией.

## Импорт / нормализация
`replaceTodoState` атомарно очищает БД и заливает новое состояние: нормализует id, глубину, pinned lists (гарантирует единственность primary/active), синхронизирует `pinned` признак с фактом присутствия в списках.

## Клиентский store
`TodoStore` хранит дерево, pinned lists, теги, фильтры завершённых (`VisibilityMode`), поиск (fuzzy + строгая интерсекция тегов). Любой вызов мутации = fetch → полная замена состояния. Collapse/фильтры в localStorage: `todoCollapsedIds_v1`, `pinnedCollapsedIds_v1`, `listFilterMode_v1`, `pinnedFilterMode_v1`.

## Навигация и хоткеи
`TabLayout` управляет переключением между вкладками (pinned, all, random, settings):
- **Alt + ←/→** — переключение между вкладками
- **Alt + ↑/↓** — переключение активного pinned list (на вкладке pinned)
- **n** — открыть модал добавления задачи (на вкладке all)
- **↑/↓** — фокус на первую/последнюю задачу в списке/pinned
- URL синхронизация через `?tab=...` параметр с поддержкой browser history

## Утилиты
Чистые функции для работы с деревом задач вынесены в `src/lib/todoUtils.ts`: `findTodo`, `filterTreeByMode`, `getMaxDepth`, `containsNode`, `shouldIncludeTodo`, `matchesSelectedTags`, `flattenNodes`, `findFirstAtDepth`, `findFirstChildAtMaxDepthInSubtree`. Типы: `VisibilityMode`, `SearchHighlight`, `ListViewResult`, `TodoLookup`.

## RPC API (Строгая типизация)
**Единая точка входа**: `POST /api/rpc` с `{ method, params }`. Все методы строго типизированы через `RpcMethod`, `RpcParamsMap`, `RpcReturnMap` и `RpcHandlerMap`. TypeScript **гарантирует** полноту реализации каждого метода на уровне компиляции.

**Добавление нового RPC метода** (4 обязательных шага):
1. Параметры в `RpcParamsMap` (`src/lib/rpcTypes.ts`)
2. Возврат в `RpcReturnMap` (`src/lib/rpcTypes.ts`)
3. Метод в `ALL_RPC_METHODS` (`src/lib/rpcTypes.ts`)
4. Обработчик в `rpcHandlers: RpcHandlerMap` (`src/app/api/rpc/route.ts`)

Если пропустить хотя бы один шаг — **код не скомпилируется**. См. `docs/rpc-checklist.md` и `docs/rpc-strict-typing.md`.

Доменные методы: `todo.*`, `tag.*`, `pinnedList.*`, `pinnedTodo.*`, `state.*`, `random.*`. Все возвращают полный `TodoState`.

## Расширение функционала
Новая бизнес‑операция: добавь функцию в `todoService.ts`, следуй 4-шаговому чеклисту для RPC метода (выше), клиентский метод вызывает `rpcCall`, TypeScript проверит полноту реализации. При добавлении новых полей обнови Prisma модель, `types.ts`, агрегацию в `getTodoState`.

## Не делать
Частичных ответов; множественных последовательных UPDATE где возможен батч; нарушения единственности active/primary; обхода глубинных проверок.

## Скрипты
Dev: `pnpm dev`; build: `pnpm build` + `pnpm start` (standalone). 

БД команды:
- Синхронизация без миграций: `pnpm db:push:dev`
- Миграции: `pnpm db:migrate:dev` (создание и применение)
- Studio: `pnpm db:studio`

Генерация клиента: `pnpm prisma:generate`. 
Проверка типов ts: `pnpm check`.

Нужны дополнительные разделы (deployment env vars, экспорт состояния, стратегия фильтров)? — дайте знать.
