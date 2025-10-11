import { NextResponse } from 'next/server'
import { movePinnedTodo } from '@/lib/todoService'
import { requireUser, UnauthorizedError } from '@/lib/auth/session'

interface Body {
  todoId: string
  targetListId: string
  targetIndex: number
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const { todoId, targetListId, targetIndex } = (await request.json()) as Body
    const state = await movePinnedTodo(user.id, todoId, targetListId, targetIndex)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to move pinned todo', error)
    return NextResponse.json({ message: 'Не удалось переместить задачу' }, { status: 400 })
  }
}
