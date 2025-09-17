import { NextResponse } from 'next/server'
import {
  deletePinnedList,
  getAppStateFromDb,
  isPrimaryList,
  renamePinnedList,
} from '@/lib/database'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  if (!title) {
    return new NextResponse('Название списка не может быть пустым', { status: 400 })
  }

  try {
    renamePinnedList(id, title)
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Ошибка обновления списка', { status: 404 })
  }

  const state = getAppStateFromDb()
  return NextResponse.json(state)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (isPrimaryList(id)) {
    return new NextResponse('Первый список нельзя удалить', { status: 400 })
  }

  try {
    deletePinnedList(id)
  } catch (error) {
    return new NextResponse(error instanceof Error ? error.message : 'Ошибка удаления списка', { status: 404 })
  }

  const state = getAppStateFromDb()
  return NextResponse.json(state)
}
