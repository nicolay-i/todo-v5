# ✅ Чеклист: Добавление нового RPC метода

## Быстрый старт

При добавлении нового RPC метода выполните эти 4 шага в указанном порядке:

### ☐ Шаг 1: Определить параметры
**Файл:** `src/lib/rpcTypes.ts`

```typescript
export interface RpcParamsMap {
  // ... существующие методы
  
  'domain.action': {
    // Определите параметры вашего метода
    id: string
    value?: number
  }
}
```

### ☐ Шаг 2: Определить возвращаемое значение
**Файл:** `src/lib/rpcTypes.ts`

```typescript
export interface RpcReturnMap {
  // ... существующие методы
  
  'domain.action': {
    state: TodoState
    // Можно добавить дополнительные поля
    result?: SomeType
  }
}
```

### ☐ Шаг 3: Добавить в список методов
**Файл:** `src/lib/rpcTypes.ts`

```typescript
export const ALL_RPC_METHODS: readonly RpcMethod[] = [
  // ... существующие методы
  'domain.action',
] as const
```

### ☐ Шаг 4: Реализовать обработчик
**Файл:** `src/app/api/rpc/route.ts`

```typescript
const rpcHandlers: RpcHandlerMap = {
  // ... существующие обработчики
  
  'domain.action': async (userId, params) => {
    // params автоматически типизирован!
    // IDE покажет: { id: string, value?: number }
    
    const result = await yourService.doSomething(
      userId, 
      params.id, 
      params.value
    )
    
    const state = await todoService.getTodoState(userId)
    
    // Возврат должен соответствовать RpcReturnMap['domain.action']
    return { state, result }
  },
}
```

## Проверка

После выполнения всех шагов:

```bash
# Проверить типизацию
pnpm tsc --noEmit

# Запустить линтер
pnpm lint

# Запустить dev сервер
pnpm dev
```

## Что проверит TypeScript

- ✅ Метод есть в `RpcParamsMap`
- ✅ Метод есть в `RpcReturnMap`
- ✅ Метод есть в `ALL_RPC_METHODS`
- ✅ Обработчик есть в `rpcHandlers`
- ✅ Параметры обработчика корректны
- ✅ Возвращаемое значение обработчика корректно

**Если что-то забыли — код не скомпилируется!**

## Использование на клиенте

```typescript
import { rpcCall } from '@/lib/apiClient'

// TypeScript знает все методы и их параметры
const result = await rpcCall('domain.action', {
  id: '123',
  value: 42,
})

// result автоматически типизирован как RpcReturnMap['domain.action']
console.log(result.state, result.result)
```

## Частые ошибки

### ❌ Забыли шаг 1 или 2
```
Type '"domain.action"' is not assignable to type 'RpcMethod'
```
**Решение:** Добавьте метод и в `RpcParamsMap`, и в `RpcReturnMap`

### ❌ Забыли шаг 3
```
Type 'EnsureAllMethodsListed' does not satisfy the constraint 'true'
```
**Решение:** Добавьте метод в `ALL_RPC_METHODS`

### ❌ Забыли шаг 4
```
Property 'domain.action' is missing in type
```
**Решение:** Добавьте обработчик в `rpcHandlers`

### ❌ Неправильные параметры в обработчике
```
Property 'wrongField' does not exist on type
```
**Решение:** Используйте только поля из `RpcParamsMap['domain.action']`

### ❌ Неправильный возврат из обработчика
```
Type '{ wrongField: any }' is not assignable to type
```
**Решение:** Возвращайте структуру, соответствующую `RpcReturnMap['domain.action']`

## Дополнительная информация

- 📖 [Подробная документация](./rpc-strict-typing.md)
- 🧪 [Демонстрация ошибок](../src/lib/rpcTypes.demo.ts)
- 📚 [RPC API справка](./rpc-api.md)

---

**Помните:** TypeScript — ваш друг! Он не даст вам забыть ни один шаг.
