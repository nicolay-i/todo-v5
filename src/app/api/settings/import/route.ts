import { NextResponse } from 'next/server'
import { importTodoState } from '@/lib/todoService'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const state = await importTodoState(payload)
    return NextResponse.json(state)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось импортировать данные'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
