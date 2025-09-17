import { NextResponse } from 'next/server'
import { addPinnedList, getAppStateFromDb } from '@/lib/database'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''

  if (!title) {
    return new NextResponse('Название списка не может быть пустым', { status: 400 })
  }

  addPinnedList(title)
  const state = getAppStateFromDb()
  return NextResponse.json(state)
}
