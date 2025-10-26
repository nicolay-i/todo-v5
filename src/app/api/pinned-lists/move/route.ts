import { NextResponse } from 'next/server'
import { movePinnedTodo } from '@/lib/todoService'

interface Body {
  todoId: string
  targetListId: string
  targetIndex: number
}

export async function POST(request: Request) {
  const { todoId, targetListId, targetIndex } = (await request.json()) as Body
  const state = await movePinnedTodo(todoId, targetListId, targetIndex)
  return NextResponse.json(state)
}
