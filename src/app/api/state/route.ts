import { NextResponse } from 'next/server'
import { getTodoStateForUser, replaceTodoState } from '@/lib/todoService'
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
    const payload = await request.json()
    const state = await replaceTodoState(user.id, payload)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to import todo state', error)
    return NextResponse.json(
      { message: 'Не удалось импортировать данные. Проверьте содержимое файла.' },
      { status: 400 },
    )
  }
}
