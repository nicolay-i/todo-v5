import { NextResponse } from 'next/server'
import { getCurrentSessionUser } from '@/lib/auth'
import { attachTagToTodo, detachTagFromTodo } from '@/lib/todoService'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const { tagId } = await request.json()
  const state = await attachTagToTodo(user.id, params.id, tagId)
  return NextResponse.json(state)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const { tagId } = await request.json()
  const state = await detachTagFromTodo(user.id, params.id, tagId)
  return NextResponse.json(state)
}
