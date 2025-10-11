import { NextResponse } from 'next/server'
import { addTodo, getTodoStateForUser } from '@/lib/todoService'
import { requireUser, UnauthorizedError } from '@/lib/auth/session'

export async function GET() {
  try {
    const user = await requireUser()
    const state = await getTodoStateForUser(user.id)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const { parentId = null, title, tagIds } = await request.json()
    const state = await addTodo(user.id, parentId, title ?? '', Array.isArray(tagIds) ? tagIds : undefined)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to add todo', error)
    return NextResponse.json({ message: 'Не удалось добавить задачу' }, { status: 400 })
  }
}
