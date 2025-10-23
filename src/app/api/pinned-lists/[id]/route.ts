import { NextResponse } from 'next/server'
import { getCurrentSessionUser } from '@/lib/auth'
import { deletePinnedList, renamePinnedList, setActivePinnedList } from '@/lib/todoService'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  if (body && typeof body === 'object' && body.action === 'setActive') {
    const state = await setActivePinnedList(user.id, params.id)
    return NextResponse.json(state)
  }
  const title = (body?.title as string) ?? ''
  const state = await renamePinnedList(user.id, params.id, title)
  return NextResponse.json(state)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const state = await deletePinnedList(user.id, params.id)
  return NextResponse.json(state)
}
