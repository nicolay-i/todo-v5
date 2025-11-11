import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth/session'
import {
  type RpcMethod,
  type RpcRequest,
  type RpcResponse,
  type RpcParamsMap,
  type RpcReturnMap,
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
 */
function isValidRpcMethod(method: string): method is RpcMethod {
  const validMethods: RpcMethod[] = [
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
  ]
  return validMethods.includes(method as RpcMethod)
}

/**
 * Диспетчер RPC методов
 * Маппит method на соответствующую функцию todoService
 */
async function dispatchRpcMethod<M extends RpcMethod>(
  userId: string,
  method: M,
  params: RpcParamsMap[M]
): Promise<RpcReturnMap[M]> {
  switch (method) {
    // Todo операции
    case 'todo.add': {
      const p = params as RpcParamsMap['todo.add']
      const state = await todoService.addTodo(
        userId,
        p.parentId ?? null,
        p.title,
        p.tagIds
      )
      return { state } as RpcReturnMap[M]
    }

    case 'todo.updateDetails': {
      const p = params as RpcParamsMap['todo.updateDetails']
      const details: { title?: string; alias?: string | null } = {}
      if (p.title !== undefined) details.title = p.title
      if (p.alias !== undefined) details.alias = p.alias
      const state = await todoService.updateTodoDetails(userId, p.id, details)
      return { state } as RpcReturnMap[M]
    }

    case 'todo.toggleCompleted': {
      const p = params as RpcParamsMap['todo.toggleCompleted']
      const state = await todoService.toggleTodoCompleted(userId, p.id)
      return { state } as RpcReturnMap[M]
    }

    case 'todo.move': {
      const p = params as RpcParamsMap['todo.move']
      const state = await todoService.moveTodo(userId, p.id, p.targetParentId, p.targetPosition)
      return { state } as RpcReturnMap[M]
    }

    case 'todo.togglePinned': {
      const p = params as RpcParamsMap['todo.togglePinned']
      const state = await todoService.togglePinned(userId, p.id)
      return { state } as RpcReturnMap[M]
    }

    case 'todo.delete': {
      const p = params as RpcParamsMap['todo.delete']
      const state = await todoService.deleteTodo(userId, p.id)
      return { state } as RpcReturnMap[M]
    }

    // Tag операции
    case 'tag.add': {
      const p = params as RpcParamsMap['tag.add']
      const state = await todoService.addTag(userId, p.name)
      return { state } as RpcReturnMap[M]
    }

    case 'tag.rename': {
      const p = params as RpcParamsMap['tag.rename']
      const state = await todoService.renameTag(userId, p.id, p.name)
      return { state } as RpcReturnMap[M]
    }

    case 'tag.delete': {
      const p = params as RpcParamsMap['tag.delete']
      const state = await todoService.deleteTag(userId, p.id)
      return { state } as RpcReturnMap[M]
    }

    case 'tag.reorder': {
      const p = params as RpcParamsMap['tag.reorder']
      const state = await todoService.reorderTags(userId, p.tagIds)
      return { state } as RpcReturnMap[M]
    }

    case 'tag.attach': {
      const p = params as RpcParamsMap['tag.attach']
      const state = await todoService.attachTagToTodo(userId, p.todoId, p.tagId)
      return { state } as RpcReturnMap[M]
    }

    case 'tag.detach': {
      const p = params as RpcParamsMap['tag.detach']
      const state = await todoService.detachTagFromTodo(userId, p.todoId, p.tagId)
      return { state } as RpcReturnMap[M]
    }

    // Pinned List операции
    case 'pinnedList.add': {
      const p = params as RpcParamsMap['pinnedList.add']
      const state = await todoService.addPinnedList(userId, p.title)
      return { state } as RpcReturnMap[M]
    }

    case 'pinnedList.rename': {
      const p = params as RpcParamsMap['pinnedList.rename']
      const state = await todoService.renamePinnedList(userId, p.id, p.title)
      return { state } as RpcReturnMap[M]
    }

    case 'pinnedList.delete': {
      const p = params as RpcParamsMap['pinnedList.delete']
      const state = await todoService.deletePinnedList(userId, p.id)
      return { state } as RpcReturnMap[M]
    }

    case 'pinnedList.setActive': {
      const p = params as RpcParamsMap['pinnedList.setActive']
      const state = await todoService.setActivePinnedList(userId, p.id)
      return { state } as RpcReturnMap[M]
    }

    case 'pinnedTodo.move': {
      const p = params as RpcParamsMap['pinnedTodo.move']
      const state = await todoService.movePinnedTodo(
        userId,
        p.todoId,
        p.toListId,
        p.toPosition
      )
      return { state } as RpcReturnMap[M]
    }

    // State операции
    case 'state.get': {
      const state = await todoService.getTodoState(userId)
      return { state } as RpcReturnMap[M]
    }

    case 'state.replace': {
      const p = params as RpcParamsMap['state.replace']
      const state = await todoService.replaceTodoState(userId, p.state)
      return { state } as RpcReturnMap[M]
    }

    // Random операции
    case 'random.todo': {
      const p = params as RpcParamsMap['random.todo']
      const chain = await todoService.getRandomTodoChain(userId)
      const state = await todoService.getTodoState(userId)
      const todo = chain.length > 0 ? chain[chain.length - 1] : null
      return { todo, state } as RpcReturnMap[M]
    }

    case 'random.chain': {
      const p = params as RpcParamsMap['random.chain']
      const chain = p.todoId
        ? await todoService.getTodoChainById(userId, p.todoId)
        : await todoService.getRandomTodoChain(userId)
      const state = await todoService.getTodoState(userId)
      return { chain, state } as RpcReturnMap[M]
    }

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = method
      throw new Error(`Unhandled method: ${_exhaustive}`)
  }
}
