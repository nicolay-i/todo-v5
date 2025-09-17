import { NextResponse } from 'next/server'
import { getAppStateFromDb, insertTodo } from '@/lib/database'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const parentId = typeof body?.parentId === 'string' ? body.parentId : null

  if (!title) {
    return new NextResponse('Укажите название задачи', { status: 400 })
  }

  try {
    insertTodo(title, parentId)
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Ошибка при создании задачи', { status: 400 })
  }

  const state = getAppStateFromDb()
  return NextResponse.json(state)
}
