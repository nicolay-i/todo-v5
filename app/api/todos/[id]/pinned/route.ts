import { NextResponse } from 'next/server'
import { getAppStateFromDb, togglePinned } from '@/lib/database'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  if (typeof body?.pinned !== 'boolean') {
    return new NextResponse('Не указано состояние закрепления', { status: 400 })
  }

  try {
    togglePinned(id, body.pinned)
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Ошибка при обновлении закрепления', {
      status: 400,
    })
  }

  const state = getAppStateFromDb()
  return NextResponse.json(state)
}
