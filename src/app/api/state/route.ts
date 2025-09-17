import { NextResponse } from 'next/server'
import { getTodoState, replaceTodoState } from '@/lib/todoService'

export async function GET() {
  const state = await getTodoState()
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const state = await replaceTodoState(payload)
    return NextResponse.json(state)
  } catch (error) {
    console.error('Failed to import todo state', error)
    return NextResponse.json(
      { message: 'Не удалось импортировать данные. Проверьте содержимое файла.' },
      { status: 400 },
    )
  }
}
