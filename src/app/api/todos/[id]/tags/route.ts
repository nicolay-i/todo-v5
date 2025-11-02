import { NextResponse } from 'next/server'
import { attachTagToTodo, detachTagFromTodo } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'
import { runWithUserContext } from '@/lib/auth/userContext'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { tagId } = await request.json()
  const state = await runWithUserContext(user.id, () => attachTagToTodo(params.id, tagId))
  return NextResponse.json(state)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { tagId } = await request.json()
  const state = await runWithUserContext(user.id, () => detachTagFromTodo(params.id, tagId))
  return NextResponse.json(state)
}
