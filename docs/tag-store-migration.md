# Вынесение TagStore из TodoStore

## Обзор изменений

Логика управления тегами была вынесена из `TodoStore` в отдельный `TagStore` для улучшения архитектуры и оптимизации загрузки данных.

## Новые файлы

### `src/stores/TagStore.ts`
Отдельный store для управления тегами с поддержкой:
- CRUD операций (add, rename, delete, reorder)
- Оптимистичных обновлений
- Синхронизации с сервером через RPC API

### `src/stores/TagStoreContext.tsx`
React Context для доступа к `TagStore` из компонентов через хук `useTagStore()`.

## Изменённые файлы

### `src/stores/TodoStore.ts`
**Удалено:**
- Поле `tags: Tag[]`
- Геттер `selectedSearchTags`
- Методы: `addTag`, `renameTag`, `deleteTag`, `reorderTags`

**Добавлено:**
- Поле `tagStore` для синхронизации
- Метод `setTagStore()` для привязки TagStore
- Обновлённый `setState()` автоматически синхронизирует теги с TagStore

**Сохранено:**
- Методы `attachTag` и `detachTag` для связи todo с тегами (без оптимистичных обновлений)
- Поиск по тегам через `searchTagIds`

### `src/components/TodoApp.tsx`
- Добавлен импорт `TagStore` и `TagStoreProvider`
- Создаётся экземпляр `TagStore` при инициализации
- `TagStore` связывается с `TodoStore` через `setTagStore()`
- Все компоненты обёрнуты в `TagStoreProvider`
- `SettingsTab` и модальное окно используют `useTagStore()` вместо `store.tags`

### `src/components/TodoSearchBar.tsx`
- Добавлен импорт `useTagStore`
- Теги берутся из `tagStore.tags` вместо `store.tags`
- `selectedSearchTags` вычисляется локально через `useMemo`

### `src/components/TodoItem.tsx`
- Добавлен импорт `useTagStore`
- `availableTags` использует `tagStore.tags`

## Оптимизация загрузки

Теги загружаются один раз при инициализации приложения и автоматически обновляются только при:
1. Явных операциях с тегами (add, rename, delete, reorder)
2. Обновлении состояния через `TodoStore.setState()` (после любого RPC вызова)

Это исключает лишние запросы к БД и сетевые операции.

## Миграция для других компонентов

Если в будущем появятся новые компоненты, использующие теги:

```tsx
import { useTagStore } from '@/stores/TagStoreContext'

const MyComponent = () => {
  const tagStore = useTagStore()
  
  // Получение списка тегов
  const tags = tagStore.tags
  
  // CRUD операции
  await tagStore.addTag('Новый тег')
  await tagStore.renameTag(id, 'Новое имя')
  await tagStore.deleteTag(id)
  await tagStore.reorderTags([id1, id2, id3])
}
```

Для связи задач с тегами используйте методы из `TodoStore`:
```tsx
const store = useTodoStore()
await store.attachTag(todoId, tagId)
await store.detachTag(todoId, tagId)
```
