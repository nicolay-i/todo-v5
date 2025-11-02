import { NextResponse } from 'next/server'
import { deletePinnedList, renamePinnedList, setActivePinnedList } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'
import { runWithUserContext } from '@/lib/auth/userContext'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await request.json()
  if (body && typeof body === 'object' && body.action === 'setActive') {
    const state = await runWithUserContext(user.id, () => setActivePinnedList(params.id))
    return NextResponse.json(state)
  }
  const title = (body?.title as string) ?? ''
  const state = await runWithUserContext(user.id, () => renamePinnedList(params.id, title))
  return NextResponse.json(state)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const state = await runWithUserContext(user.id, () => deletePinnedList(params.id))
  return NextResponse.json(state)
}
