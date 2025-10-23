import { NextResponse } from 'next/server'
import { getCurrentSessionUser } from '@/lib/auth'
import { addPinnedList, getTodoState } from '@/lib/todoService'

export async function GET() {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const state = await getTodoState(user.id)
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const { title } = await request.json()
  const state = await addPinnedList(user.id, title ?? '')
  return NextResponse.json(state)
}
