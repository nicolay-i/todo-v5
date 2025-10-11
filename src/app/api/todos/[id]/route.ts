import { NextResponse } from 'next/server'
import {
  deleteTodo,
  moveTodo,
  togglePinned,
  toggleTodoCompleted,
  updateTodoTitle,
} from '@/lib/todoService'
import { requireUser, UnauthorizedError } from '@/lib/auth/session'

interface PatchBody {
  action: 'rename' | 'toggleCompleted' | 'move' | 'togglePinned'
  title?: string
  targetParentId?: string | null
  targetIndex?: number
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const body = (await request.json()) as PatchBody
    const { id } = params

    switch (body.action) {
      case 'rename': {
        const state = await updateTodoTitle(user.id, id, body.title ?? '')
        return NextResponse.json(state)
      }
      case 'toggleCompleted': {
        const state = await toggleTodoCompleted(user.id, id)
        return NextResponse.json(state)
      }
      case 'move': {
        const state = await moveTodo(user.id, id, body.targetParentId ?? null, body.targetIndex ?? 0)
        return NextResponse.json(state)
      }
      case 'togglePinned': {
        const state = await togglePinned(user.id, id)
        return NextResponse.json(state)
      }
      default:
        return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to update todo', error)
    return NextResponse.json({ message: 'Не удалось обновить задачу' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const state = await deleteTodo(user.id, params.id)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to delete todo', error)
    return NextResponse.json({ message: 'Не удалось удалить задачу' }, { status: 400 })
  }
}
