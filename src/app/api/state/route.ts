import { NextResponse } from 'next/server'
import { getCurrentSessionUser } from '@/lib/auth'
import { getTodoState, replaceTodoState } from '@/lib/todoService'

export async function GET() {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const state = await getTodoState(user.id)
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentSessionUser()
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
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
