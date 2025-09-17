import { NextResponse } from 'next/server'
import { getAppStateFromDb, moveTodo } from '@/lib/database'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const targetParentId = typeof body?.targetParentId === 'string' ? body.targetParentId : null
  const targetIndex =
    typeof body?.targetIndex === 'number' && Number.isInteger(body.targetIndex)
      ? (body.targetIndex as number)
      : null

  if (targetIndex === null) {
    return new NextResponse('Не указан индекс вставки', { status: 400 })
  }

  try {
    moveTodo(id, targetParentId, targetIndex)
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Ошибка перемещения задачи', { status: 400 })
  }

  const state = getAppStateFromDb()
  return NextResponse.json(state)
}
