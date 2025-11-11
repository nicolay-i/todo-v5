# RPC API - Руководство по использованию

## Обзор

RPC (Remote Procedure Call) слой — это единая точка входа для всех серверных операций в приложении. Все запросы проходят через `/api/rpc` endpoint.

## Преимущества

- **Строгая типизация**: TypeScript гарантирует полноту реализации каждого метода (см. [rpc-strict-typing.md](./rpc-strict-typing.md))
- **Типобезопасность**: Полная типизация запросов и ответов
- **Единообразие**: Все операции используют единый формат
- **Обработка ошибок**: Автоматическое возвращение актуального состояния при ошибках
- **Простота**: Один endpoint вместо множества REST маршрутов
- **Безопасность при рефакторинге**: При добавлении метода TypeScript потребует полную реализацию

## Структура запроса

```typescript
{
  method: string,    // Имя метода (формат: domain.action)
  params: object     // Параметры метода
}
```

## Структура ответа

### Успешный ответ
```typescript
{
  ok: true,
  method: string,
  data: {
    state: TodoState  // Полное состояние приложения
  }
}
```

### Ошибка
```typescript
{
  ok: false,
  error: string,
  state?: TodoState  // Актуальное состояние, если удалось извлечь
}
```

## Доступные методы

### Todo операции

#### `todo.add`
Создание новой задачи
```typescript
{
  method: 'todo.add',
  params: {
    parentId?: string | null,
    title: string,
    alias?: string | null,
    tagIds?: string[]
  }
}
```

#### `todo.updateDetails`
Обновление заголовка и/или alias задачи
```typescript
{
  method: 'todo.updateDetails',
  params: {
    id: string,
    title?: string,
    alias?: string | null
  }
}
```

#### `todo.toggleCompleted`
Переключение статуса выполнения
```typescript
{
  method: 'todo.toggleCompleted',
  params: {
    id: string
  }
}
```

#### `todo.move`
Перемещение задачи в дереве
```typescript
{
  method: 'todo.move',
  params: {
    id: string,
    targetParentId: string | null,
    targetPosition: number
  }
}
```

#### `todo.togglePinned`
Закрепление/открепление задачи
```typescript
{
  method: 'todo.togglePinned',
  params: {
    id: string
  }
}
```

#### `todo.delete`
Удаление задачи
```typescript
{
  method: 'todo.delete',
  params: {
    id: string
  }
}
```

### Tag операции

#### `tag.add`
Создание тега
```typescript
{
  method: 'tag.add',
  params: {
    name: string
  }
}
```

#### `tag.rename`
Переименование тега
```typescript
{
  method: 'tag.rename',
  params: {
    id: string,
    name: string
  }
}
```

#### `tag.delete`
Удаление тега
```typescript
{
  method: 'tag.delete',
  params: {
    id: string
  }
}
```

#### `tag.reorder`
Изменение порядка тегов
```typescript
{
  method: 'tag.reorder',
  params: {
    tagIds: string[]
  }
}
```

#### `tag.attach`
Привязка тега к задаче
```typescript
{
  method: 'tag.attach',
  params: {
    todoId: string,
    tagId: string
  }
}
```

#### `tag.detach`
Отвязка тега от задачи
```typescript
{
  method: 'tag.detach',
  params: {
    todoId: string,
    tagId: string
  }
}
```

### Pinned List операции

#### `pinnedList.add`
Создание закрепленного списка
```typescript
{
  method: 'pinnedList.add',
  params: {
    title: string
  }
}
```

#### `pinnedList.rename`
Переименование списка
```typescript
{
  method: 'pinnedList.rename',
  params: {
    id: string,
    title: string
  }
}
```

#### `pinnedList.delete`
Удаление списка
```typescript
{
  method: 'pinnedList.delete',
  params: {
    id: string
  }
}
```

#### `pinnedList.setActive`
Установка активного списка
```typescript
{
  method: 'pinnedList.setActive',
  params: {
    id: string
  }
}
```

#### `pinnedTodo.move`
Перемещение закрепленной задачи между списками
```typescript
{
  method: 'pinnedTodo.move',
  params: {
    todoId: string,
    toListId: string,
    toPosition: number
  }
}
```

### State операции

#### `state.get`
Получение текущего состояния
```typescript
{
  method: 'state.get',
  params: {}
}
```

#### `state.replace`
Замена всего состояния (импорт)
```typescript
{
  method: 'state.replace',
  params: {
    state: unknown  // JSON структура, будет нормализована
  }
}
```

### Random операции

#### `random.todo`
Получение случайной задачи
```typescript
{
  method: 'random.todo',
  params: {
    tagIds?: string[],
    includeCompleted?: boolean
  }
}
```

Возвращает:
```typescript
{
  ok: true,
  data: {
    todo: Todo | null,
    state: TodoState
  }
}
```

#### `random.chain`
Получение цепочки задач (от корня до указанной или случайной)
```typescript
{
  method: 'random.chain',
  params: {
    todoId?: string  // Если не указан, возвращает случайную цепочку
  }
}
```

Возвращает:
```typescript
{
  ok: true,
  data: {
    chain: (Todo & { tags: Tag[] })[],  // Массив задач от корня до целевой
    state: TodoState
  }
}
```

## Примеры использования

### Клиентский код (TodoStore)

```typescript
// Добавление задачи через RPC
async addTodo(parentId: string | null, title: string, tagIds?: string[]) {
  const response = await ApiClient.rpc('todo.add', {
    parentId,
    title,
    tagIds,
  })
  
  if (response.ok) {
    this.setState(response.data.state)
  } else {
    // Даже при ошибке обновляем состояние
    if (response.state) {
      this.setState(response.state)
    }
    console.error('Failed to add todo:', response.error)
  }
}
```

### Прямой вызов fetch

```typescript
const response = await fetch('/api/rpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'todo.add',
    params: {
      parentId: null,
      title: 'Новая задача',
    }
  })
})

const result = await response.json()

if (result.ok) {
  console.log('Success:', result.data.state)
} else {
  console.error('Error:', result.error)
}
```

## Коды ошибок

- `UNKNOWN_METHOD` — Неизвестный метод
- `INVALID_PARAMS` — Неверные параметры
- `DEPTH_LIMIT` — Превышена максимальная глубина дерева
- `NOT_FOUND` — Объект не найден
- `VALIDATION_ERROR` — Ошибка валидации
- `INTERNAL_ERROR` — Внутренняя ошибка сервера
- `UNAUTHORIZED` — Не авторизован

## Инварианты

1. **Все мутации возвращают полное состояние** — после любой операции клиент получает актуальный `TodoState`
2. **Ошибки не ломают состояние** — даже при ошибке возвращается актуальное состояние (если удалось извлечь)
3. **Типобезопасность** — все методы, параметры и ответы строго типизированы
4. **Атомарность** — каждая операция выполняется атомарно в рамках транзакции

## Добавление нового метода

1. Добавить метод в `RpcMethod` в `rpcTypes.ts`
2. Добавить параметры в `RpcParamsMap`
3. Добавить возвращаемое значение в `RpcReturnMap`
4. Добавить case в `dispatchRpcMethod` в `route.ts`
5. Добавить функцию в `todoService.ts` (если нужна)
6. Обновить список валидных методов в `isValidRpcMethod`

## Производительность

- Операции выполняются в одной транзакции базы данных
- Батч-позиционирование минимизирует round-trip к БД
- Все мутации возвращают целостное состояние за один запрос

## Будущие расширения

- **Batch RPC**: выполнение нескольких операций в одной транзакции
- **WebSocket/SSE**: push-обновления состояния для multi-client sync
- **Версионирование**: поддержка `method@version` для эволюции API
- **OpenAPI генерация**: автоматическая документация из типов
