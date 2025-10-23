import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { movePinnedTodo } from '@/lib/todoService'

interface Body {
  todoId: string
  targetListId: string
  targetIndex: number
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { todoId, targetListId, targetIndex } = (await request.json()) as Body
  const state = await movePinnedTodo(user.id, todoId, targetListId, targetIndex)
  return NextResponse.json(state)
}
