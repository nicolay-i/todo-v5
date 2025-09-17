import { NextResponse } from 'next/server'
import { deleteTodo, getAppStateFromDb, updateTodoCompleted, updateTodoTitle } from '@/lib/database'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const data: { title?: string; completed?: boolean } = {}

  if (typeof body?.title === 'string') {
    const trimmed = body.title.trim()
    if (!trimmed) {
      return new NextResponse('Название не может быть пустым', { status: 400 })
    }
    data.title = trimmed
  }

  if (typeof body?.completed === 'boolean') {
    data.completed = body.completed
  }

  if (Object.keys(data).length === 0) {
    return new NextResponse('Нет данных для обновления', { status: 400 })
  }

  try {
    if (typeof data.title === 'string') {
      updateTodoTitle(id, data.title)
    }
    if (typeof data.completed === 'boolean') {
      updateTodoCompleted(id, data.completed)
    }
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Ошибка обновления задачи', { status: 404 })
  }

  const state = getAppStateFromDb()
  return NextResponse.json(state)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    deleteTodo(id)
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Ошибка удаления задачи', { status: 404 })
  }

  const state = getAppStateFromDb()
  return NextResponse.json(state)
}
