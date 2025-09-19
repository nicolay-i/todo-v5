import { NextResponse } from 'next/server'
import { deletePinnedList, renamePinnedList, setActivePinnedList } from '@/lib/todoService'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  if (body && typeof body === 'object' && body.action === 'setActive') {
    const state = await setActivePinnedList(params.id)
    return NextResponse.json(state)
  }
  const title = (body?.title as string) ?? ''
  const state = await renamePinnedList(params.id, title)
  return NextResponse.json(state)
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const state = await deletePinnedList(params.id)
  return NextResponse.json(state)
}
