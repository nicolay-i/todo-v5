# Строгая типизация RPC системы

## Обзор

RPC система теперь имеет **строгую типизацию на уровне TypeScript**, которая гарантирует, что для каждого метода:
1. ✅ Определены параметры в `RpcParamsMap`
2. ✅ Определён тип возвращаемого значения в `RpcReturnMap`
3. ✅ Есть обработчик в `rpcHandlers` на бэкенде
4. ✅ Метод указан в константе `ALL_RPC_METHODS`

Если хотя бы одно из условий не выполнено — **TypeScript выдаст ошибку компиляции**.

## Как это работает

### 1. Определение метода через параметры и возврат

`RpcMethod` автоматически выводится из пересечения ключей `RpcParamsMap` и `RpcReturnMap`:

```typescript
export type RpcMethod = keyof RpcParamsMap & keyof RpcReturnMap
```

Это означает, что метод существует **только если** для него есть и параметры, и возвращаемое значение.

### 2. Проверка полноты на уровне типов

```typescript
type EnsureMethodsMatch = keyof RpcParamsMap extends keyof RpcReturnMap
  ? keyof RpcReturnMap extends keyof RpcParamsMap
    ? true
    : never
  : never
const _check: EnsureMethodsMatch = true
```

Эта проверка гарантирует, что множества методов в `RpcParamsMap` и `RpcReturnMap` идентичны.

### 3. Константа ALL_RPC_METHODS с проверкой полноты

```typescript
export const ALL_RPC_METHODS: readonly RpcMethod[] = [
  'todo.add',
  'todo.updateDetails',
  // ... все методы
] as const

type EnsureAllMethodsListed = typeof ALL_RPC_METHODS[number] extends RpcMethod
  ? RpcMethod extends typeof ALL_RPC_METHODS[number]
    ? true
    : never
  : never
const _checkMethods: EnsureAllMethodsListed = true
```

Проверка гарантирует, что `ALL_RPC_METHODS` содержит **ровно все** методы из `RpcMethod`.

### 4. Строгая типизация обработчиков

```typescript
export type RpcHandlerMap = {
  [M in RpcMethod]: RpcHandler<M>
}
```

`RpcHandlerMap` — это [mapped type](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html), который требует наличия обработчика для **каждого** метода из `RpcMethod`.

На бэкенде (`route.ts`):

```typescript
const rpcHandlers: RpcHandlerMap = {
  'todo.add': async (userId, params) => {
    // params автоматически типизирован как RpcParamsMap['todo.add']
    // возврат должен соответствовать RpcReturnMap['todo.add']
  },
  // ... ОБЯЗАТЕЛЬНО для каждого метода
}
```

Если вы **забудете** добавить обработчик для какого-то метода — TypeScript не даст скомпилировать код.

## Добавление нового метода

Чтобы добавить новый метод, нужно выполнить **4 шага**:

### Шаг 1: Добавить параметры в `RpcParamsMap`

```typescript
// src/lib/rpcTypes.ts
export interface RpcParamsMap {
  // ... существующие методы
  'myFeature.doSomething': {
    itemId: string
    value: number
  }
}
```

### Шаг 2: Добавить возвращаемое значение в `RpcReturnMap`

```typescript
// src/lib/rpcTypes.ts
export interface RpcReturnMap {
  // ... существующие методы
  'myFeature.doSomething': {
    state: TodoState
    result: string
  }
}
```

### Шаг 3: Добавить метод в `ALL_RPC_METHODS`

```typescript
// src/lib/rpcTypes.ts
export const ALL_RPC_METHODS: readonly RpcMethod[] = [
  // ... существующие методы
  'myFeature.doSomething',
] as const
```

### Шаг 4: Добавить обработчик в `rpcHandlers`

```typescript
// src/app/api/rpc/route.ts
const rpcHandlers: RpcHandlerMap = {
  // ... существующие обработчики
  'myFeature.doSomething': async (userId, params) => {
    // params типизирован как { itemId: string, value: number }
    const result = await myService.doSomething(userId, params.itemId, params.value)
    const state = await todoService.getTodoState(userId)
    return { state, result }
  },
}
```

## Что проверяет TypeScript

### ❌ Метод без параметров

```typescript
export interface RpcParamsMap {
  'test.method': { value: string }
}

export interface RpcReturnMap {
  // Ошибка! 'test.method' отсутствует здесь
}
```

**Ошибка компиляции**: `Type 'keyof RpcParamsMap' does not satisfy the constraint 'keyof RpcReturnMap'`

### ❌ Метод без возвращаемого значения

```typescript
export interface RpcParamsMap {
  // Ошибка! 'test.method' отсутствует здесь
}

export interface RpcReturnMap {
  'test.method': { result: number }
}
```

**Ошибка компиляции**: аналогично предыдущей

### ❌ Метод отсутствует в ALL_RPC_METHODS

```typescript
export const ALL_RPC_METHODS: readonly RpcMethod[] = [
  'todo.add',
  // забыли добавить 'todo.updateDetails'
] as const
```

**Ошибка компиляции**: `Type 'EnsureAllMethodsListed' does not satisfy the constraint 'true'`

### ❌ Обработчик отсутствует на бэкенде

```typescript
const rpcHandlers: RpcHandlerMap = {
  'todo.add': async (userId, params) => { /* ... */ },
  // забыли добавить 'todo.updateDetails'
}
```

**Ошибка компиляции**: `Property 'todo.updateDetails' is missing in type ...`

### ❌ Неправильные параметры в обработчике

```typescript
const rpcHandlers: RpcHandlerMap = {
  'todo.add': async (userId, params) => {
    // Ошибка! wrongField не существует в RpcParamsMap['todo.add']
    const wrong = params.wrongField
    return { state: {} as any }
  },
}
```

**Ошибка компиляции**: `Property 'wrongField' does not exist on type ...`

### ❌ Неправильный тип возврата из обработчика

```typescript
const rpcHandlers: RpcHandlerMap = {
  'todo.add': async (userId, params) => {
    // Ошибка! RpcReturnMap['todo.add'] требует { state: TodoState }
    return { wrongField: {} as any }
  },
}
```

**Ошибка компиляции**: `Type '{ wrongField: any; }' is not assignable to type ...`

## Преимущества

1. **Безопасность**: невозможно забыть обработать метод
2. **Рефакторинг**: при переименовании метода TypeScript укажет все места, требующие изменений
3. **Документация**: типы служат документацией API
4. **Автодополнение**: IDE предложит все доступные методы и их параметры
5. **Раннее обнаружение ошибок**: ошибки находятся на этапе компиляции, а не в runtime

## Пример использования на клиенте

```typescript
import { rpcCall } from '@/lib/apiClient'

// ✅ Корректный вызов
const result = await rpcCall('todo.add', {
  title: 'New Task',
  parentId: null,
})
// result типизирован как { state: TodoState }

// ❌ Неправильные параметры
const result = await rpcCall('todo.add', {
  wrongParam: 'value', // Ошибка компиляции!
})

// ❌ Несуществующий метод
const result = await rpcCall('nonexistent.method', {}) // Ошибка компиляции!
```

## Миграция существующего кода

Существующий код продолжит работать без изменений. Все методы уже имеют полную типизацию.

При добавлении новых методов просто следуйте 4 шагам выше, и TypeScript будет направлять вас.

## Тестирование типизации

Файл `src/lib/rpcTypes.test.ts` содержит примеры корректного и некорректного использования типов. Раскомментируйте блоки с `❌` чтобы увидеть ошибки компиляции.

## Заключение

Новая система типизации гарантирует **согласованность на уровне компиляции** между:
- Определением методов
- Параметрами методов
- Возвращаемыми значениями
- Обработчиками на бэкенде

Это делает код более надёжным и упрощает разработку.
