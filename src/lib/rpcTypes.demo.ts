/**
 * 🧪 ДЕМОНСТРАЦИЯ СТРОГОЙ ТИПИЗАЦИИ
 * 
 * Этот файл показывает, что происходит при попытке добавить
 * неполный RPC метод. Раскомментируйте секции, чтобы увидеть
 * ошибки компиляции TypeScript.
 */

/* ═══════════════════════════════════════════════════════════════════════
 * СЦЕНАРИЙ 1: Добавили параметры, но забыли возвращаемое значение
 * ═══════════════════════════════════════════════════════════════════════

import type { RpcParamsMap, RpcReturnMap, RpcMethod } from './rpcTypes'

// Расширяем RpcParamsMap новым методом
declare module './rpcTypes' {
  interface RpcParamsMap {
    'test.incomplete1': {
      value: string
    }
  }
}

// НЕ добавляем в RpcReturnMap

// Попытка использовать метод
const method: RpcMethod = 'test.incomplete1'
//                         ^^^^^^^^^^^^^^^^^^^
// ❌ ОШИБКА: Type '"test.incomplete1"' is not assignable to type 'RpcMethod'
// Потому что 'test.incomplete1' есть в RpcParamsMap, но НЕТ в RpcReturnMap

*/

/* ═══════════════════════════════════════════════════════════════════════
 * СЦЕНАРИЙ 2: Добавили возвращаемое значение, но забыли параметры
 * ═══════════════════════════════════════════════════════════════════════

import type { RpcParamsMap, RpcReturnMap, RpcMethod } from './rpcTypes'

// Расширяем RpcReturnMap новым методом
declare module './rpcTypes' {
  interface RpcReturnMap {
    'test.incomplete2': {
      result: number
    }
  }
}

// НЕ добавляем в RpcParamsMap

// Попытка использовать метод
const method: RpcMethod = 'test.incomplete2'
//                         ^^^^^^^^^^^^^^^^^^^
// ❌ ОШИБКА: Type '"test.incomplete2"' is not assignable to type 'RpcMethod'
// Потому что 'test.incomplete2' есть в RpcReturnMap, но НЕТ в RpcParamsMap

*/

/* ═══════════════════════════════════════════════════════════════════════
 * СЦЕНАРИЙ 3: Добавили метод в типы, но забыли в ALL_RPC_METHODS
 * ═══════════════════════════════════════════════════════════════════════

import type { RpcParamsMap, RpcReturnMap } from './rpcTypes'
import { ALL_RPC_METHODS } from './rpcTypes'

// Добавляем в оба места
declare module './rpcTypes' {
  interface RpcParamsMap {
    'test.incomplete3': { value: string }
  }
  interface RpcReturnMap {
    'test.incomplete3': { result: number }
  }
}

// НЕ добавляем в ALL_RPC_METHODS

// В файле rpcTypes.ts будет ошибка:
// ❌ ОШИБКА: Type 'EnsureAllMethodsListed' does not satisfy the constraint 'true'
// Потому что ALL_RPC_METHODS не содержит 'test.incomplete3'

*/

/* ═══════════════════════════════════════════════════════════════════════
 * СЦЕНАРИЙ 4: Добавили метод везде, но забыли обработчик на бэкенде
 * ═══════════════════════════════════════════════════════════════════════

// В src/lib/rpcTypes.ts:
export interface RpcParamsMap {
  'test.incomplete4': { value: string }
}
export interface RpcReturnMap {
  'test.incomplete4': { result: number }
}
export const ALL_RPC_METHODS = [
  'test.incomplete4',
  // ... другие методы
] as const

// В src/app/api/rpc/route.ts НЕ добавили обработчик:
const rpcHandlers: RpcHandlerMap = {
  'todo.add': async (userId, params) => { ... },
  // НЕТ 'test.incomplete4'
}
// ❌ ОШИБКА: Property 'test.incomplete4' is missing in type
// TypeScript требует обработчик для КАЖДОГО метода из RpcMethod

*/

/* ═══════════════════════════════════════════════════════════════════════
 * СЦЕНАРИЙ 5: Обработчик с неправильными параметрами
 * ═══════════════════════════════════════════════════════════════════════

import type { RpcHandlerMap } from './rpcTypes'

const rpcHandlers: RpcHandlerMap = {
  'todo.add': async (userId, params) => {
    // Попытка использовать несуществующее поле
    const wrong = params.wrongField
    //                   ^^^^^^^^^^
    // ❌ ОШИБКА: Property 'wrongField' does not exist on type
    // Потому что params типизирован как RpcParamsMap['todo.add']
    
    return { state: {} as any }
  },
  // ... другие обработчики
}

*/

/* ═══════════════════════════════════════════════════════════════════════
 * СЦЕНАРИЙ 6: Обработчик с неправильным возвращаемым значением
 * ═══════════════════════════════════════════════════════════════════════

import type { RpcHandlerMap } from './rpcTypes'

const rpcHandlers: RpcHandlerMap = {
  'todo.add': async (userId, params) => {
    // Неправильная структура возврата
    return { wrongField: {} as any }
    //     ^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ❌ ОШИБКА: Type '{ wrongField: any; }' is not assignable to type
    // Потому что должен возвращать { state: TodoState }
  },
  // ... другие обработчики
}

*/

/* ═══════════════════════════════════════════════════════════════════════
 * СЦЕНАРИЙ 7: Использование несуществующего метода на клиенте
 * ═══════════════════════════════════════════════════════════════════════

import { rpcCall } from '@/lib/apiClient'

async function test() {
  // Попытка вызвать несуществующий метод
  const result = await rpcCall('nonexistent.method', {})
  //                            ^^^^^^^^^^^^^^^^^^^^^
  // ❌ ОШИБКА: Argument of type '"nonexistent.method"' is not assignable to parameter
  // Потому что метод не существует в RpcMethod
}

*/

/* ═══════════════════════════════════════════════════════════════════════
 * ✅ ПРАВИЛЬНЫЙ СПОСОБ: Все шаги выполнены
 * ═══════════════════════════════════════════════════════════════════════

// 1. В src/lib/rpcTypes.ts добавляем параметры:
export interface RpcParamsMap {
  'myFeature.doSomething': {
    itemId: string
    value: number
  }
}

// 2. Добавляем возвращаемое значение:
export interface RpcReturnMap {
  'myFeature.doSomething': {
    state: TodoState
    result: string
  }
}

// 3. Добавляем в ALL_RPC_METHODS:
export const ALL_RPC_METHODS = [
  'myFeature.doSomething',
  // ... другие методы
] as const

// 4. В src/app/api/rpc/route.ts добавляем обработчик:
const rpcHandlers: RpcHandlerMap = {
  'myFeature.doSomething': async (userId, params) => {
    // params автоматически типизирован!
    const { itemId, value } = params
    const result = await myService.doSomething(userId, itemId, value)
    const state = await todoService.getTodoState(userId)
    return { state, result }
  },
  // ... другие обработчики
}

// 5. Использование на клиенте:
import { rpcCall } from '@/lib/apiClient'

async function useMethod() {
  const result = await rpcCall('myFeature.doSomething', {
    itemId: '123',
    value: 42,
  })
  // result типизирован как { state: TodoState, result: string }
  console.log(result.state, result.result)
}

✅ TypeScript не выдаёт ошибок!

*/

export const DEMO_MESSAGE = `
🎯 Этот файл демонстрирует строгую типизацию RPC системы.
Раскомментируйте любой сценарий, чтобы увидеть, как TypeScript
предотвращает добавление неполных методов.
`
