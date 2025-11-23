## Цель
Добавить HTML описание (TinyMCE) к задачам Todo: серверное хранение, RPC обновление, UI редактор (Drawer на desktop, fullscreen на mobile), хоткеи открытия/закрытия, скрытие текущих пунктов редактирования/удаления.

## Шаги реализации
1. Схема БД: добавить поле `description String?` в модель `Todo` (`prisma/schema.prisma`). Создать миграцию `add_description_to_todo`.
2. Типы: обновить `src/lib/types.ts` (интерфейс `Todo`) + все места, где перечисляются поля (если есть ручные списки).
3. Сервис: 
   - Расширить интерфейс нормализации (в начале `todoService.ts`) полем `description`.
   - В `replaceTodoState`, `normalizeTodos`, `createMany`, `addTodo` — включить поле.
   - Добавить функцию `updateTodoDescription(userId, todoId, html)` по паттерну `updateTodoDetails`.
4. RPC: 
   - В `rpcTypes.ts`: добавить `todo.updateDescription` в `RpcParamsMap`, `RpcReturnMap`, `ALL_RPC_METHODS`.
   - В `src/app/api/rpc/route.ts`: добавить обработчик в `rpcHandlers`.
5. Store (`TodoStore.ts`): 
   - При создании новой задачи выставлять `description: null`.
   - Добавить метод `updateTodoDescription(id, html)` (оптимистично меняет локально, затем RPC, откат при ошибке).
6. UI компонент `TodoItem.tsx`:
   - Добавить иконку (например `FiFileText`) слева для открытия описания.
   - Состояния: `isEditingDescription`, `descriptionDraft`.
   - Скрыть кнопки редактирования названия и удаления при активном режиме описания.
   - Клавиатура: в обработчике — открытие по `o` и русской `щ`, закрытие по `Esc`.
7. Новый компонент `TodoDescriptionEditor.tsx`:
   - Определяет layout: desktop — правый Drawer (fixed right panel), mobile — fullscreen modal.
   - Внутри TinyMCE (инициализация, value = `descriptionDraft`).
   - Кнопки: Сохранить (Ctrl/Cmd+Enter, отдельная кнопка), Отмена (Esc).
   - Перед сохранением trim; пустую строку -> `null`.
8. Глобальные хоткеи (опционально): если нужно открывать описание для текущего «фокусного» todo из любого места — добавить в `TabLayout.tsx` ловлю `o`/`щ` и диспатч кастомного события; `TodoItem` слушает при фокусе. (Пока можно оставить локально.)
9. Импорт/Экспорт состояния: в `replaceTodoState` — учитывать `description`; при формировании JSON экспорта включить поле без изменений.
11. Поиск: учитывать в поиске по todo, подсвечивать иконку открыватия модала описания.

## Детализация врезок кода (референсы)
- `prisma/schema.prisma`: после строки с последним пользовательским полем добавить `description String?`.
- `todoService.ts`:
  - Интерфейс нормализации (начало файла) — добавить поле.
  - `normalizeTodos()` — извлечь `description`.
  - `replaceTodoState()` — при сборке вставок добавить поле.
  - `createMany()` батч — включить столбец.
  - `addTodo()` — установить `description: null`.
  - Новая функция `updateTodoDescription()` после `updateTodoDetails()`.
- `rpcTypes.ts`: добавить структуры параметров `{ id: string; description: string | null }`.
- `route.ts`: внедрить обработчик `todo.updateDescription`.
- `TodoStore.ts`: метод `updateTodoDescription` + включение поля при создании.
- `TodoItem.tsx`: кнопка, состояния, JSX редактора, хоткеи.
- Новый файл: `src/components/TodoDescriptionEditor.tsx`.

## UX детали
- Отсутствует режим «просмотр» — всегда редактирование.
- Закрытие без сохранения: Esc.
- Сохранение: кнопка + Ctrl/Cmd+Enter.
- Автофокус TinyMCE при открытии.
- Удаление/редактирование названия временно скрыты в режиме описания.
- Визуальное отображение наличия описания (иконка выделена жирным).

## Проверка готовности
1. Миграция прошла: поле в БД.
2. RPC типы компилируются, нет пропущенных шагов.
3. Открытие/закрытие редактора по хоткеям и иконке.
4. Сохранение изменяет описание и возвращает обновлённое состояние.
5. Импорт/экспорт не теряет поле.

