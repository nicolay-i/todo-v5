import { NextResponse } from 'next/server'
import { exportTodoState } from '@/lib/todoService'

export async function GET() {
  const state = await exportTodoState()
  const body = JSON.stringify(state, null, 2)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="todo-export-${timestamp}.json"`,
    },
  })
}
