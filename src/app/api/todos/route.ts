import { NextResponse } from 'next/server'
import { addTodo, getTodoState } from '@/lib/todoService'

export async function GET() {
  const state = await getTodoState()
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const { parentId = null, title } = await request.json()
  const state = await addTodo(parentId, title ?? '')
  return NextResponse.json(state)
}
