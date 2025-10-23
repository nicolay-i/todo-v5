import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { getTodoState, replaceTodoState } from '@/lib/todoService'

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
  try {
    const payload = await request.json()
    const state = await replaceTodoState(user.id, payload)
    return NextResponse.json(state)
  } catch (error) {
    console.error('Failed to import todo state', error)
    return NextResponse.json(
      { message: 'Не удалось импортировать данные. Проверьте содержимое файла.' },
      { status: 400 },
    )
  }
}
