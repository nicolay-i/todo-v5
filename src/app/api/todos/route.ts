import { NextResponse } from 'next/server'
import { addTodo, getTodoState } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const state = await getTodoState(user.id)
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { parentId = null, title, tagIds } = await request.json()
  const state = await addTodo(user.id, parentId, title ?? '', Array.isArray(tagIds) ? tagIds : undefined)
  return NextResponse.json(state)
}
