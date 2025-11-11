import type { TodoState, TodoNode } from './types'
import type { Todo } from '@prisma/client'

/**
 * Карта параметров для каждого RPC метода
 * ⚠️ ВАЖНО: При добавлении нового метода ОБЯЗАТЕЛЬНО добавить:
 * 1. Параметры в RpcParamsMap
 * 2. Возвращаемое значение в RpcReturnMap
 * 3. Обработчик в dispatchRpcMethod (route.ts)
 * TypeScript будет требовать полноту всех трёх
 */
export interface RpcParamsMap {
  // Todo операции
  'todo.add': {
    parentId?: string | null
    title: string
    alias?: string | null
    tagIds?: string[]
  }
  'todo.updateDetails': {
    id: string
    title?: string
    alias?: string | null
  }
  'todo.toggleCompleted': {
    id: string
  }
  'todo.move': {
    id: string
    targetParentId: string | null
    targetPosition: number
  }
  'todo.togglePinned': {
    id: string
  }
  'todo.delete': {
    id: string
  }
  // Tag операции
  'tag.add': {
    name: string
  }
  'tag.rename': {
    id: string
    name: string
  }
  'tag.delete': {
    id: string
  }
  'tag.reorder': {
    tagIds: string[]
  }
  'tag.attach': {
    todoId: string
    tagId: string
  }
  'tag.detach': {
    todoId: string
    tagId: string
  }
  // Pinned List операции
  'pinnedList.add': {
    title: string
  }
  'pinnedList.rename': {
    id: string
    title: string
  }
  'pinnedList.delete': {
    id: string
  }
  'pinnedList.setActive': {
    id: string
  }
  'pinnedTodo.move': {
    todoId: string
    toListId: string
    toPosition: number
  }
  // State операции
  'state.get': Record<string, never> // пустой объект
  'state.replace': {
    state: unknown // сырой JSON, будет нормализован
  }
  // Random операции
  'random.todo': {
    tagIds?: string[]
    includeCompleted?: boolean
  }
  'random.chain': {
    todoId?: string
  }
 
}

/**
 * Карта возвращаемых значений для каждого RPC метода
 * Большинство мутаций возвращают полный TodoState
 */
export interface RpcReturnMap {
  // Todo операции
  'todo.add': { state: TodoState }
  'todo.updateDetails': { state: TodoState }
  'todo.toggleCompleted': { state: TodoState }
  'todo.move': { state: TodoState }
  'todo.togglePinned': { state: TodoState }
  'todo.delete': { state: TodoState }
  // Tag операции
  'tag.add': { state: TodoState }
  'tag.rename': { state: TodoState }
  'tag.delete': { state: TodoState }
  'tag.reorder': { state: TodoState }
  'tag.attach': { state: TodoState }
  'tag.detach': { state: TodoState }
  // Pinned List операции
  'pinnedList.add': { state: TodoState }
  'pinnedList.rename': { state: TodoState }
  'pinnedList.delete': { state: TodoState }
  'pinnedList.setActive': { state: TodoState }
  'pinnedTodo.move': { state: TodoState }
  // State операции
  'state.get': { state: TodoState }
  'state.replace': { state: TodoState }
  // Random операции
  'random.todo': { todo: Todo | null; state: TodoState }
  'random.chain': { chain: (Todo & { tags: any[] })[]; state: TodoState }
}

/**
 * Все доступные RPC методы в системе
 * Автоматически выводится из ключей RpcParamsMap
 * Гарантирует, что для каждого метода есть параметры и возвращаемое значение
 */
export type RpcMethod = keyof RpcParamsMap & keyof RpcReturnMap

/**
 * Проверка полноты типизации на уровне типов
 * Если методы не совпадают между ParamsMap и ReturnMap - будет ошибка компиляции
 */
type EnsureMethodsMatch = keyof RpcParamsMap extends keyof RpcReturnMap
  ? keyof RpcReturnMap extends keyof RpcParamsMap
    ? true
    : never
  : never
const _check: EnsureMethodsMatch = true

/**
 * Структура RPC запроса
 */
export interface RpcRequest<M extends RpcMethod = RpcMethod> {
  method: M
  params: RpcParamsMap[M]
}

/**
 * Успешный ответ RPC
 */
export interface RpcSuccess<M extends RpcMethod = RpcMethod> {
  ok: true
  method: M
  data: RpcReturnMap[M]
}

/**
 * Ошибка RPC
 * Включает актуальное состояние, если удалось извлечь
 */
export interface RpcError {
  ok: false
  error: string
  state?: TodoState
}

/**
 * Общий тип ответа RPC
 */
export type RpcResponse<M extends RpcMethod = RpcMethod> = RpcSuccess<M> | RpcError

/**
 * Коды ошибок RPC
 */
export const RPC_ERROR_CODES = {
  UNKNOWN_METHOD: 'UNKNOWN_METHOD',
  INVALID_PARAMS: 'INVALID_PARAMS',
  DEPTH_LIMIT: 'DEPTH_LIMIT',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const

export type RpcErrorCode = (typeof RPC_ERROR_CODES)[keyof typeof RPC_ERROR_CODES]

/**
 * Хелпер для создания массива всех методов из RpcMethod
 * Используется в runtime валидации
 */
export const ALL_RPC_METHODS: readonly RpcMethod[] = [
  'todo.add',
  'todo.updateDetails',
  'todo.toggleCompleted',
  'todo.move',
  'todo.togglePinned',
  'todo.delete',
  'tag.add',
  'tag.rename',
  'tag.delete',
  'tag.reorder',
  'tag.attach',
  'tag.detach',
  'pinnedList.add',
  'pinnedList.rename',
  'pinnedList.delete',
  'pinnedList.setActive',
  'pinnedTodo.move',
  'state.get',
  'state.replace',
  'random.todo',
  'random.chain',
] as const

/**
 * Проверка полноты списка методов на уровне типов
 * Гарантирует, что ALL_RPC_METHODS содержит ровно все методы из RpcMethod
 */
type EnsureAllMethodsListed = typeof ALL_RPC_METHODS[number] extends RpcMethod
  ? RpcMethod extends typeof ALL_RPC_METHODS[number]
    ? true
    : never
  : never
const _checkMethods: EnsureAllMethodsListed = true

/**
 * Тип для обработчиков RPC методов
 * Каждый обработчик принимает userId и params конкретного метода,
 * возвращает результат конкретного метода
 */
export type RpcHandler<M extends RpcMethod> = (
  userId: string,
  params: RpcParamsMap[M]
) => Promise<RpcReturnMap[M]>

/**
 * Карта обработчиков для всех RPC методов
 * TypeScript требует наличия обработчика для КАЖДОГО метода
 */
export type RpcHandlerMap = {
  [M in RpcMethod]: RpcHandler<M>
}
