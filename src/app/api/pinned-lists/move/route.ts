import { NextResponse } from 'next/server'
import { getCurrentSessionUser } from '@/lib/auth'
import { movePinnedTodo } from '@/lib/todoService'

interface Body {
  todoId: string
  targetListId: string
  targetIndex: number
}

export async function POST(request: Request) {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const { todoId, targetListId, targetIndex } = (await request.json()) as Body
  const state = await movePinnedTodo(user.id, todoId, targetListId, targetIndex)
  return NextResponse.json(state)
}
