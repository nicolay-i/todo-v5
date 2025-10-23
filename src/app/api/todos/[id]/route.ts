import { NextResponse } from 'next/server'
import { getCurrentSessionUser } from '@/lib/auth'
import {
  deleteTodo,
  moveTodo,
  togglePinned,
  toggleTodoCompleted,
  updateTodoTitle,
} from '@/lib/todoService'

interface PatchBody {
  action: 'rename' | 'toggleCompleted' | 'move' | 'togglePinned'
  title?: string
  targetParentId?: string | null
  targetIndex?: number
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as PatchBody
  const { id } = params
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

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
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentSessionUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const state = await deleteTodo(user.id, params.id)
  return NextResponse.json(state)
}
