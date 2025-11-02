import { NextResponse } from 'next/server'
import { getTodoState, replaceTodoState } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'
import { runWithUserContext } from '@/lib/auth/userContext'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const state = await runWithUserContext(user.id, () => getTodoState())
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const payload = await request.json()
    const state = await runWithUserContext(user.id, () => replaceTodoState(payload))
    return NextResponse.json(state)
  } catch (error) {
    console.error('Failed to import todo state', error)
    return NextResponse.json(
      { message: 'Не удалось импортировать данные. Проверьте содержимое файла.' },
      { status: 400 },
    )
  }
}
