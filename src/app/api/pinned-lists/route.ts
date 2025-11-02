import { NextResponse } from 'next/server'
import { addPinnedList, getTodoState } from '@/lib/todoService'
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
  const { title } = await request.json()
  const state = await addPinnedList(user.id, title ?? '')
  return NextResponse.json(state)
}
