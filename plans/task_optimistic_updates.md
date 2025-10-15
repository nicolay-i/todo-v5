# План: Реализация оптимистичных обновлений UI

**Дата создания**: 15 октября 2025 г.

## Цель
Реализовать немедленное обновление UI при пользовательских действиях с последующей синхронизацией с бэкендом. При ошибке бэкенда откатывать изменения и показывать уведомление об ошибке.

## Охватываемые действия
1. Создание / переименование todo
2. Добавление / удаление тегов
3. Отметка выполненным
4. Закрепление / открепление todo

---

## Архитектурные изменения

### 1. Новая система уведомлений

**Файл**: `src/stores/NotificationStore.ts` (новый)

**Описание**: Создать стор для управления уведомлениями об ошибках и успешных операциях.

```typescript
export type NotificationType = 'success' | 'error' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export class NotificationStore {
  notifications: Notification[] = []
  
  // Методы:
  - show(type, message, duration = 3000)
  - dismiss(id)
  - clear()
}
```

**Компонент UI**: `src/components/NotificationContainer.tsx` (новый)
- Отображение уведомлений в правом верхнем углу
- Автоматическое скрытие через заданный timeout
- Анимация появления/исчезновения

---

### 2. Расширение TodoStore для оптимистичных обновлений

**Файл**: `src/stores/TodoStore.ts`

#### 2.1 Новые свойства

```typescript
// Снэпшот состояния для отката при ошибке
private stateSnapshot: TodoState | null = null

// Счетчик pending операций (для индикатора загрузки)
pendingOperations = 0

// Ссылка на NotificationStore
notifications: NotificationStore
```

#### 2.2 Новые вспомогательные методы

```typescript
/**
 * Создает снэпшот текущего состояния перед оптимистичным обновлением
 */
private createSnapshot() {
  this.stateSnapshot = {
    todos: JSON.parse(JSON.stringify(this.todos)),
    pinnedLists: JSON.parse(JSON.stringify(this.pinnedLists)),
    tags: JSON.parse(JSON.stringify(this.tags)),
  }
}

/**
 * Откатывает состояние к предыдущему снэпшоту
 */
private rollbackToSnapshot() {
  if (this.stateSnapshot) {
    this.todos = this.stateSnapshot.todos
    this.pinnedLists = this.stateSnapshot.pinnedLists
    this.tags = this.stateSnapshot.tags
    this.stateSnapshot = null
  }
}

/**
 * Очищает снэпшот после успешной операции
 */
private clearSnapshot() {
  this.stateSnapshot = null
}

/**
 * Обертка для оптимистичных мутаций
 * @param optimisticUpdate - функция для немедленного обновления UI
 * @param serverUpdate - промис с запросом на сервер
 * @param errorMessage - сообщение об ошибке для пользователя
 */
private async optimisticMutate(
  optimisticUpdate: () => void,
  serverUpdate: () => Promise<void>,
  errorMessage: string
) {
  this.createSnapshot()
  this.pendingOperations++
  
  try {
    // Немедленно обновляем UI
    optimisticUpdate()
    
    // Отправляем запрос на сервер
    await serverUpdate()
    
    // Успех - очищаем снэпшот
    this.clearSnapshot()
  } catch (error) {
    // Ошибка - откатываем изменения
    this.rollbackToSnapshot()
    
    // Показываем уведомление
    this.notifications.show('error', errorMessage)
    
    // Перезагружаем актуальное состояние с сервера
    await this.refresh()
  } finally {
    this.pendingOperations--
  }
}
```

#### 2.3 Рефакторинг метода mutate

Текущий метод `mutate` будет использоваться внутри `optimisticMutate` как `serverUpdate`:

```typescript
private async serverMutate(url: string, init: RequestInit): Promise<TodoState> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `Request failed: ${response.status}`)
  }

  return await response.json() as TodoState
}

// Старый метод mutate - оставить для обратной совместимости,
// но использовать только там, где оптимистичные обновления не нужны
private async mutate(url: string, init: RequestInit) {
  try {
    const data = await this.serverMutate(url, init)
    this.setState(data)
  } catch (error) {
    console.error('Failed to update state', error)
    await this.refresh()
  }
}
```

---

## Детальный план реализации по действиям

### Действие 1: Создание todo

**Текущий метод**: `addTodo(parentId: string | null, title: string)`

**Новая реализация**:

```typescript
async addTodo(parentId: string | null, title: string) {
  const tempId = `temp_${Date.now()}_${Math.random()}`
  const now = new Date()
  
  await this.optimisticMutate(
    // Оптимистичное обновление
    () => {
      const newTodo: TodoNode = {
        id: tempId,
        title,
        completed: false,
        completedAt: null,
        pinned: false,
        alias: null,
        parentId,
        position: 0,
        createdAt: now,
        updatedAt: now,
        children: [],
        tags: [],
      }
      
      if (parentId) {
        const parent = this.findTodo(parentId)
        if (parent) {
          // Добавляем в начало списка детей
          parent.node.children = [newTodo, ...parent.node.children]
          // Обновляем позиции остальных
          parent.node.children.forEach((child, idx) => {
            if (child.id !== tempId) {
              child.position = idx
            }
          })
        }
      } else {
        // Добавляем в корень
        this.todos = [newTodo, ...this.todos]
        this.todos.forEach((todo, idx) => {
          if (todo.id !== tempId) {
            todo.position = idx
          }
        })
      }
    },
    // Запрос на сервер
    async () => {
      const data = await this.serverMutate('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ parentId, title }),
      })
      this.setState(data)
    },
    'Не удалось создать задачу'
  )
}
```

**Изменения UI**: 
- `src/components/TodoItem.tsx`: Добавить индикатор загрузки для задач с `id.startsWith('temp_')`
- Показывать серый/полупрозрачный вид для временных задач

---

### Действие 2: Переименование todo

**Текущий метод**: `updateTitle(id: string, title: string)`

**Новая реализация**:

```typescript
async updateTitle(id: string, title: string) {
  let oldTitle = ''
  
  await this.optimisticMutate(
    // Оптимистичное обновление
    () => {
      const info = this.findTodo(id)
      if (info) {
        oldTitle = info.node.title
        info.node.title = title
        info.node.updatedAt = new Date()
      }
    },
    // Запрос на сервер
    async () => {
      const data = await this.serverMutate(`/api/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'rename', title }),
      })
      this.setState(data)
    },
    'Не удалось переименовать задачу'
  )
}
```

**Изменения UI**: Никаких дополнительных - переименование происходит inline

---

### Действие 3: Отметка выполненным

**Текущий метод**: `toggleCompleted(id: string)`

**Новая реализация**:

```typescript
async toggleCompleted(id: string) {
  let oldCompleted = false
  let oldCompletedAt: Date | null = null
  
  await this.optimisticMutate(
    // Оптимистичное обновление
    () => {
      const info = this.findTodo(id)
      if (info) {
        oldCompleted = info.node.completed
        oldCompletedAt = info.node.completedAt
        
        info.node.completed = !info.node.completed
        info.node.completedAt = info.node.completed ? new Date() : null
        info.node.updatedAt = new Date()
        
        // Рекурсивно обновляем детей
        this.updateChildrenCompleted(info.node, info.node.completed)
      }
    },
    // Запрос на сервер
    async () => {
      const data = await this.serverMutate(`/api/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'toggleCompleted' }),
      })
      this.setState(data)
    },
    'Не удалось изменить статус задачи'
  )
}

// Вспомогательный метод (уже существует, но нужно сделать observable)
private updateChildrenCompleted(node: TodoNode, completed: boolean) {
  node.children.forEach((child) => {
    child.completed = completed
    child.completedAt = completed ? new Date() : null
    child.updatedAt = new Date()
    this.updateChildrenCompleted(child, completed)
  })
}
```

**Изменения UI**: 
- Добавить анимацию перехода (fade) при изменении статуса
- Показывать индикатор загрузки на чекбоксе во время pending операции

---

### Действие 4: Добавление тега

**Текущий метод**: `attachTag(todoId: string, tagId: string)`

**Новая реализация**:

```typescript
async attachTag(todoId: string, tagId: string) {
  await this.optimisticMutate(
    // Оптимистичное обновление
    () => {
      const todoInfo = this.findTodo(todoId)
      const tag = this.tags.find((t) => t.id === tagId)
      
      if (todoInfo && tag) {
        if (!todoInfo.node.tags) {
          todoInfo.node.tags = []
        }
        // Проверяем, что тег еще не добавлен
        if (!todoInfo.node.tags.some((t) => t.id === tagId)) {
          todoInfo.node.tags.push(tag)
        }
      }
    },
    // Запрос на сервер
    async () => {
      const data = await this.serverMutate(`/api/todos/${todoId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tagId }),
      })
      this.setState(data)
    },
    'Не удалось добавить тег'
  )
}
```

---

### Действие 5: Удаление тега

**Текущий метод**: `detachTag(todoId: string, tagId: string)`

**Новая реализация**:

```typescript
async detachTag(todoId: string, tagId: string) {
  await this.optimisticMutate(
    // Оптимистичное обновление
    () => {
      const todoInfo = this.findTodo(todoId)
      if (todoInfo && todoInfo.node.tags) {
        todoInfo.node.tags = todoInfo.node.tags.filter((t) => t.id !== tagId)
      }
    },
    // Запрос на сервер
    async () => {
      const data = await this.serverMutate(`/api/todos/${todoId}/tags`, {
        method: 'DELETE',
        body: JSON.stringify({ tagId }),
      })
      this.setState(data)
    },
    'Не удалось удалить тег'
  )
}
```

**Изменения UI**: 
- Добавить анимацию появления/исчезновения тега
- Показывать индикатор загрузки во время pending операции

---

### Действие 6: Закрепление / открепление todo

**Текущий метод**: `togglePinned(id: string)`

**Новая реализация**:

```typescript
async togglePinned(id: string) {
  let oldPinned = false
  let removedFromListId: string | null = null
  let addedToListId: string | null = null
  
  await this.optimisticMutate(
    // Оптимистичное обновление
    () => {
      const info = this.findTodo(id)
      if (!info) return
      
      oldPinned = info.node.pinned
      info.node.pinned = !info.node.pinned
      
      if (info.node.pinned) {
        // Закрепляем - добавляем в активный список
        const activeList = this.pinnedLists.find((list) => list.isActive)
        if (activeList) {
          addedToListId = activeList.id
          activeList.order = [id, ...activeList.order]
        }
      } else {
        // Открепляем - удаляем из всех списков
        this.pinnedLists.forEach((list) => {
          if (list.order.includes(id)) {
            removedFromListId = list.id
            list.order = list.order.filter((todoId) => todoId !== id)
          }
        })
      }
    },
    // Запрос на сервер
    async () => {
      const data = await this.serverMutate(`/api/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'togglePinned' }),
      })
      this.setState(data)
    },
    'Не удалось изменить закрепление задачи'
  )
}
```

**Изменения UI**: 
- Анимация появления задачи в закрепленном списке
- Индикатор загрузки на кнопке закрепления

---

## Дополнительные улучшения UI

### 1. Глобальный индикатор загрузки

**Файл**: `src/components/LoadingIndicator.tsx` (новый)

Показывать индикатор в верхней части экрана, когда `store.pendingOperations > 0`

```typescript
export const LoadingIndicator = observer(() => {
  const store = useTodoStore()
  
  if (store.pendingOperations === 0) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse z-50" />
  )
})
```

### 2. Визуальная индикация временных элементов

В `src/components/TodoItem.tsx`:

```typescript
const isTemporary = todo.id.startsWith('temp_')
const isPending = store.pendingOperations > 0 && /* ... условие для конкретной задачи */

// Применить класс opacity-50 для временных задач
className={`${isTemporary ? 'opacity-50' : ''} ...`}
```

### 3. Анимации переходов

Добавить в `src/app/globals.css`:

```css
/* Анимация для появления/исчезновения тегов */
.tag-enter {
  animation: fadeIn 0.2s ease-in;
}

.tag-exit {
  animation: fadeOut 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}

/* Анимация для статуса выполненной задачи */
.todo-completed {
  transition: opacity 0.3s ease-in-out;
}
```

---

## План внедрения (поэтапный)

### Этап 1: Инфраструктура (1-2 часа)
1. ✅ Создать `NotificationStore`
2. ✅ Создать компонент `NotificationContainer`
3. ✅ Добавить в `TodoStore` методы для снэпшотов и `optimisticMutate`
4. ✅ Рефакторинг метода `mutate` → `serverMutate`
5. ✅ Интегрировать `NotificationStore` в `TodoApp`

### Этап 2: Базовые операции (2-3 часа)
1. ✅ Переименование todo (самое простое)
2. ✅ Отметка выполненным
3. ✅ Тестирование и отладка

### Этап 3: Операции с тегами (1-2 часа)
1. ✅ Добавление тега
2. ✅ Удаление тега
3. ✅ Добавить анимации для тегов

### Этап 4: Создание и закрепление (2-3 часа)
1. ✅ Создание todo с временным ID
2. ✅ Закрепление/открепление
3. ✅ Обработка временных ID в UI

### Этап 5: UI улучшения (1-2 часа)
1. ✅ Глобальный индикатор загрузки
2. ✅ Визуальная индикация pending состояний
3. ✅ Финальное тестирование и полировка

**Общее время**: 7-12 часов работы

---

## Тестовые сценарии

Для каждого действия необходимо протестировать:

1. ✅ **Успешный сценарий**: Действие выполняется, UI обновляется немедленно, сервер подтверждает
2. ✅ **Сетевая ошибка**: Потеря соединения → откат изменений + уведомление
3. ✅ **Валидационная ошибка**: Сервер отклоняет запрос → откат + уведомление с причиной
4. ✅ **Множественные операции**: Несколько действий подряд → все корректно обрабатываются
5. ✅ **Быстрые повторные клики**: Защита от дублирования запросов

---

## Возможные проблемы и решения

### Проблема 1: Конфликт временных ID
**Решение**: Использовать уникальные ID с timestamp + random: `temp_${Date.now()}_${Math.random()}`

### Проблема 2: Несоответствие между оптимистичным и серверным состоянием
**Решение**: Всегда перезаписывать состояние данными с сервера после успешного ответа

### Проблема 3: Race conditions при множественных операциях
**Решение**: 
- Использовать счетчик `pendingOperations`
- Каждая операция работает со своим снэпшотом
- Последний успешный ответ с сервера становится истиной

### Проблема 4: Сложные операции (перемещение, изменение порядка)
**Решение**: Эти операции пока оставить с текущей логикой (без оптимистичных обновлений), т.к. они требуют сложных пересчетов позиций

---

## API изменения

### Обновление формата ошибок

Все API endpoints должны возвращать единообразный формат ошибок:

```typescript
// При ошибке (статус 4xx или 5xx)
{
  "error": "Понятное пользователю сообщение об ошибке",
  "code": "VALIDATION_ERROR" | "NOT_FOUND" | "SERVER_ERROR",
  "details": { /* дополнительные данные */ }
}
```

Обновить все роуты в `src/app/api/`:
- `/api/todos/route.ts`
- `/api/todos/[id]/route.ts`
- `/api/todos/[id]/tags/route.ts`
- `/api/pinned-lists/*/`

---

## Заметки по производительности

1. **Снэпшоты**: Используем `JSON.parse(JSON.stringify())` для глубокого копирования. Для больших деревьев (>1000 задач) может быть медленно. Альтернатива: библиотека `immer` для иммутабельных обновлений.

2. **MobX реактивность**: Оптимистичные обновления напрямую мутируют наблюдаемые объекты, что может вызвать множественные ре-рендеры. Решение: использовать `runInAction` для группировки изменений.

3. **Анимации**: Использовать CSS transitions/animations, а не JavaScript для лучшей производительности.

---

## Дальнейшие улучшения (вне скоупа текущей задачи)

1. **Offline mode**: Сохранение операций в IndexedDB и синхронизация при восстановлении соединения
2. **Undo/Redo**: История изменений с возможностью отмены
3. **Конфликт-резолюшн**: Обработка ситуаций, когда несколько пользователей редактируют одну задачу
4. **WebSocket**: Реал-тайм синхронизация между вкладками/устройствами
5. **Батчинг запросов**: Группировка нескольких операций в один запрос

---

## Чеклист готовности

- [ ] Создан `NotificationStore`
- [ ] Создан `NotificationContainer` компонент
- [ ] Реализованы методы снэпшотов в `TodoStore`
- [ ] Реализован `optimisticMutate` метод
- [ ] Переписан `addTodo` с оптимистичным обновлением
- [ ] Переписан `updateTitle` с оптимистичным обновлением
- [ ] Переписан `toggleCompleted` с оптимистичным обновлением
- [ ] Переписан `attachTag` с оптимистичным обновлением
- [ ] Переписан `detachTag` с оптимистичным обновлением
- [ ] Переписан `togglePinned` с оптимистичным обновлением
- [ ] Добавлен глобальный индикатор загрузки
- [ ] Добавлена визуальная индикация временных элементов
- [ ] Добавлены анимации переходов
- [ ] Обновлены API endpoints с единообразным форматом ошибок
- [ ] Проведено тестирование всех сценариев
- [ ] Документация обновлена

