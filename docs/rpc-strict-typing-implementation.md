# Реализация строгой типизации RPC системы

## Выполненные изменения

### 1. Переработана типизация в `src/lib/rpcTypes.ts`

#### До:
- `RpcMethod` был простым union типом перечислением методов
- Не было гарантии, что для каждого метода есть параметры и возврат
- Список методов дублировался в нескольких местах

#### После:
- `RpcMethod` автоматически выводится из пересечения `RpcParamsMap` и `RpcReturnMap`
- Добавлены type-level проверки полноты (`EnsureMethodsMatch`, `EnsureAllMethodsListed`)
- Введён тип `RpcHandlerMap`, требующий обработчик для каждого метода
- Добавлена константа `ALL_RPC_METHODS` с type-level проверкой полноты

### 2. Обновлён бэкенд в `src/app/api/rpc/route.ts`

#### До:
- Switch-case диспетчер с ручной проверкой exhaustiveness
- Список валидных методов дублировался в `isValidRpcMethod`

#### После:
- Объект `rpcHandlers: RpcHandlerMap` с автоматической типизацией каждого обработчика
- TypeScript **требует** наличия обработчика для каждого метода
- `isValidRpcMethod` использует `ALL_RPC_METHODS`
- Автоматическая типизация параметров и возвращаемых значений в каждом обработчике

### 3. Добавлена документация

- `docs/rpc-strict-typing.md` - подробное описание системы типизации
- `src/lib/rpcTypes.demo.ts` - демонстрация ошибок при неполной реализации
- `src/lib/rpcTypes.test.ts` - примеры корректного использования
- Обновлена `docs/rpc-api.md` с упоминанием строгой типизации

## Гарантии TypeScript

При добавлении нового RPC метода TypeScript **гарантирует**:

1. ✅ Наличие параметров в `RpcParamsMap`
2. ✅ Наличие возвращаемого значения в `RpcReturnMap`
3. ✅ Присутствие в константе `ALL_RPC_METHODS`
4. ✅ Наличие обработчика в `rpcHandlers` на бэкенде
5. ✅ Правильную типизацию параметров обработчика
6. ✅ Правильную типизацию возвращаемого значения обработчика

**Если хотя бы одно условие не выполнено — код не скомпилируется.**

## Как добавить новый метод

```typescript
// 1. Добавить в RpcParamsMap (src/lib/rpcTypes.ts)
export interface RpcParamsMap {
  'myFeature.action': { id: string; value: number }
}

// 2. Добавить в RpcReturnMap (src/lib/rpcTypes.ts)
export interface RpcReturnMap {
  'myFeature.action': { state: TodoState }
}

// 3. Добавить в ALL_RPC_METHODS (src/lib/rpcTypes.ts)
export const ALL_RPC_METHODS = [
  'myFeature.action',
  // ... остальные
] as const

// 4. Добавить обработчик (src/app/api/rpc/route.ts)
const rpcHandlers: RpcHandlerMap = {
  'myFeature.action': async (userId, params) => {
    // params автоматически типизирован!
    const state = await myService.action(userId, params.id, params.value)
    return { state }
  },
  // ... остальные
}
```

TypeScript проверит все 4 шага на этапе компиляции.

## Преимущества

1. **Невозможно забыть реализацию** - TypeScript не даст скомпилировать код
2. **Безопасный рефакторинг** - при переименовании метода ошибки появятся во всех местах
3. **Автодополнение** - IDE знает все методы и их параметры
4. **Самодокументируемость** - типы служат документацией
5. **Раннее обнаружение ошибок** - на этапе разработки, а не в runtime

## Обратная совместимость

Все существующие методы продолжают работать без изменений. Изменения касаются только системы типов и не влияют на runtime поведение.

## Тестирование

Файлы для проверки типизации:
- `src/lib/rpcTypes.test.ts` - примеры использования
- `src/lib/rpcTypes.demo.ts` - демонстрация ошибок (раскомментируйте секции)

Для проверки типов: `pnpm tsc --noEmit`

## Дополнительные материалы

- [Подробная документация по строгой типизации](./docs/rpc-strict-typing.md)
- [RPC API справка](./docs/rpc-api.md)
- [TypeScript Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
