import { NextResponse } from 'next/server'
import { getAppStateFromDb, movePinnedTodo } from '@/lib/database'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const todoId = typeof body?.todoId === 'string' ? body.todoId : null
  const listId = typeof body?.listId === 'string' ? body.listId : null
  const targetIndex =
    typeof body?.targetIndex === 'number' && Number.isInteger(body.targetIndex)
      ? (body.targetIndex as number)
      : null

  if (!todoId || !listId || targetIndex === null) {
    return new NextResponse('Недостаточно данных для перемещения', { status: 400 })
  }

  try {
    movePinnedTodo(todoId, listId, targetIndex)
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Ошибка перемещения закрепленной задачи', {
      status: 400,
    })
  }

  const state = getAppStateFromDb()
  return NextResponse.json(state)
}
