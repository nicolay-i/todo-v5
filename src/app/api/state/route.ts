import { NextResponse } from 'next/server'
import { getTodoState } from '@/lib/todoService'

export async function GET() {
  const state = await getTodoState()
  return NextResponse.json(state)
}
