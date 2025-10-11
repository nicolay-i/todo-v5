import { NextResponse } from 'next/server'
import { attachTagToTodo, detachTagFromTodo } from '@/lib/todoService'
import { requireUser, UnauthorizedError } from '@/lib/auth/session'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const { tagId } = await request.json()
    const state = await attachTagToTodo(user.id, params.id, tagId)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to attach tag', error)
    return NextResponse.json({ message: 'Не удалось добавить тег' }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const { tagId } = await request.json()
    const state = await detachTagFromTodo(user.id, params.id, tagId)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to remove tag', error)
    return NextResponse.json({ message: 'Не удалось удалить тег' }, { status: 400 })
  }
}
