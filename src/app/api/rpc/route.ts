import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import {
  type RpcMethod,
  type RpcRequest,
  type RpcResponse,
  type RpcHandlerMap,
  type RpcParamsMap,
  type RpcReturnMap,
  ALL_RPC_METHODS,
  RPC_ERROR_CODES,
} from '@/lib/rpcTypes'
import * as todoService from '@/lib/todoService'

/**
 * RPC endpoint - единая точка входа для всех серверных операций
 * POST /api/rpc
 * Body: { method: string, params: object }
 */
export async function POST(request: NextRequest): Promise<NextResponse<RpcResponse>> {
  try {
    // Проверка авторизации
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: RPC_ERROR_CODES.UNAUTHORIZED,
        },
        { status: 401 }
      )
    }

    // Парсинг тела запроса
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: RPC_ERROR_CODES.INVALID_PARAMS,
        },
        { status: 400 }
      )
    }

    // Валидация структуры запроса
    if (
      !body ||
      typeof body !== 'object' ||
      !('method' in body) ||
      !('params' in body) ||
      typeof body.method !== 'string'
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: RPC_ERROR_CODES.INVALID_PARAMS,
        },
        { status: 400 }
      )
    }

    const { method, params } = body as RpcRequest

    // Проверка, что метод известен
    if (!isValidRpcMethod(method)) {
      const state = await todoService.getTodoState(userId)
      return NextResponse.json(
        {
          ok: false,
          error: RPC_ERROR_CODES.UNKNOWN_METHOD,
          state,
        },
        { status: 400 }
      )
    }

    // Диспетчеризация и выполнение
    try {
      const result = await dispatchRpcMethod(userId, method, params)
      return NextResponse.json({
        ok: true,
        method,
        data: result,
      })
    } catch (error) {
      // При ошибке возвращаем актуальное состояние
      const state = await todoService.getTodoState(userId)
      return NextResponse.json(
        {
          ok: false,
          error: error instanceof Error ? error.message : RPC_ERROR_CODES.INTERNAL_ERROR,
          state,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    // Критическая ошибка
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : RPC_ERROR_CODES.INTERNAL_ERROR,
      },
      { status: 500 }
    )
  }
}

/**
 * Проверка, что метод является валидным RPC методом
 * Использует константу ALL_RPC_METHODS для гарантии полноты
 */
function isValidRpcMethod(method: string): method is RpcMethod {
  return ALL_RPC_METHODS.includes(method as RpcMethod)
}

/**
 * Карта обработчиков RPC методов
 * ⚠️ TypeScript требует наличия обработчика для КАЖДОГО метода из RpcMethod
 * При добавлении нового метода обязательно добавить обработчик здесь
 */
const rpcHandlers: RpcHandlerMap = {
  // Todo операции
  'todo.add': async (userId, params) => {
    const state = await todoService.addTodo(
      userId,
      params.parentId ?? null,
      params.title,
      params.tagIds
    )
    return { state }
  },

  'todo.updateDetails': async (userId, params) => {
    const details: { title?: string; alias?: string | null } = {}
    if (params.title !== undefined) details.title = params.title
    if (params.alias !== undefined) details.alias = params.alias
    const state = await todoService.updateTodoDetails(userId, params.id, details)
    return { state }
  },

  'todo.toggleCompleted': async (userId, params) => {
    const state = await todoService.toggleTodoCompleted(userId, params.id)
    return { state }
  },

  'todo.move': async (userId, params) => {
    const state = await todoService.moveTodo(
      userId,
      params.id,
      params.targetParentId,
      params.targetPosition
    )
    return { state }
  },

  'todo.togglePinned': async (userId, params) => {
    const state = await todoService.togglePinned(userId, params.id)
    return { state }
  },

  'todo.delete': async (userId, params) => {
    const state = await todoService.deleteTodo(userId, params.id)
    return { state }
  },

  // Tag операции
  'tag.add': async (userId, params) => {
    const state = await todoService.addTag(userId, params.name)
    return { state }
  },

  'tag.rename': async (userId, params) => {
    const state = await todoService.renameTag(userId, params.id, params.name)
    return { state }
  },

  'tag.delete': async (userId, params) => {
    const state = await todoService.deleteTag(userId, params.id)
    return { state }
  },

  'tag.reorder': async (userId, params) => {
    const state = await todoService.reorderTags(userId, params.tagIds)
    return { state }
  },

  'tag.attach': async (userId, params) => {
    const state = await todoService.attachTagToTodo(userId, params.todoId, params.tagId)
    return { state }
  },

  'tag.detach': async (userId, params) => {
    const state = await todoService.detachTagFromTodo(userId, params.todoId, params.tagId)
    return { state }
  },

  // Pinned List операции
  'pinnedList.add': async (userId, params) => {
    const state = await todoService.addPinnedList(userId, params.title)
    return { state }
  },

  'pinnedList.rename': async (userId, params) => {
    const state = await todoService.renamePinnedList(userId, params.id, params.title)
    return { state }
  },

  'pinnedList.delete': async (userId, params) => {
    const state = await todoService.deletePinnedList(userId, params.id)
    return { state }
  },

  'pinnedList.setActive': async (userId, params) => {
    const state = await todoService.setActivePinnedList(userId, params.id)
    return { state }
  },

  'pinnedTodo.move': async (userId, params) => {
    const state = await todoService.movePinnedTodo(
      userId,
      params.todoId,
      params.toListId,
      params.toPosition
    )
    return { state }
  },

  // State операции
  'state.get': async (userId, params) => {
    const state = await todoService.getTodoState(userId)
    return { state }
  },

  'state.replace': async (userId, params) => {
    const state = await todoService.replaceTodoState(userId, params.state)
    return { state }
  },

  // Random операции
  'random.todo': async (userId, params) => {
    const chain = await todoService.getRandomTodoChain(userId)
    const state = await todoService.getTodoState(userId)
    const todo = chain.length > 0 ? chain[chain.length - 1] : null
    return { todo, state }
  },

  'random.chain': async (userId, params) => {
    const chain = params.todoId
      ? await todoService.getTodoChainById(userId, params.todoId)
      : await todoService.getRandomTodoChain(userId)
    const state = await todoService.getTodoState(userId)
    return { chain, state }
  },
}

/**
 * Диспетчер RPC методов
 * Использует строго типизированную карту обработчиков
 */
async function dispatchRpcMethod<M extends RpcMethod>(
  userId: string,
  method: M,
  params: RpcParamsMap[M]
): Promise<RpcReturnMap[M]> {
  const handler = rpcHandlers[method]
  return handler(userId, params as any) as Promise<RpcReturnMap[M]>
}
