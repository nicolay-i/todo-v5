import { NextResponse } from 'next/server'
import { addPinnedList, getTodoStateForUser } from '@/lib/todoService'
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
    const { title } = await request.json()
    const state = await addPinnedList(user.id, title ?? '')
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to add pinned list', error)
    return NextResponse.json({ message: 'Не удалось добавить список' }, { status: 400 })
  }
}
