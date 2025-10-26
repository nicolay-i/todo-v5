import { NextResponse } from 'next/server'
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

  switch (body.action) {
    case 'rename': {
      const state = await updateTodoTitle(id, body.title ?? '')
      return NextResponse.json(state)
    }
    case 'toggleCompleted': {
      const state = await toggleTodoCompleted(id)
      return NextResponse.json(state)
    }
    case 'move': {
      const state = await moveTodo(id, body.targetParentId ?? null, body.targetIndex ?? 0)
      return NextResponse.json(state)
    }
    case 'togglePinned': {
      const state = await togglePinned(id)
      return NextResponse.json(state)
    }
    default:
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const state = await deleteTodo(params.id)
  return NextResponse.json(state)
}
