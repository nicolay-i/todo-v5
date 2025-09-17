import { NextResponse } from 'next/server'
import { addPinnedList, getTodoState } from '@/lib/todoService'

export async function GET() {
  const state = await getTodoState()
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const { title } = await request.json()
  const state = await addPinnedList(title ?? '')
  return NextResponse.json(state)
}
