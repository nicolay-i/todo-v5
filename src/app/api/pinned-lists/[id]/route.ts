import { NextResponse } from 'next/server'
import { deletePinnedList, renamePinnedList, setActivePinnedList } from '@/lib/todoService'
import { requireUser, UnauthorizedError } from '@/lib/auth/session'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const body = await request.json()
    if (body && typeof body === 'object' && body.action === 'setActive') {
      const state = await setActivePinnedList(user.id, params.id)
      return NextResponse.json(state)
    }
    const title = (body?.title as string) ?? ''
    const state = await renamePinnedList(user.id, params.id, title)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to update pinned list', error)
    return NextResponse.json({ message: 'Не удалось обновить список' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const state = await deletePinnedList(user.id, params.id)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to delete pinned list', error)
    return NextResponse.json({ message: 'Не удалось удалить список' }, { status: 400 })
  }
}
