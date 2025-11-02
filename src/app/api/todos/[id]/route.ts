import { NextResponse } from 'next/server'
import {
  deleteTodo,
  moveTodo,
  togglePinned,
  toggleTodoCompleted,
  updateTodoDetails,
} from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'
import { runWithUserContext } from '@/lib/auth/userContext'

interface PatchBody {
  action: 'rename' | 'toggleCompleted' | 'move' | 'togglePinned' | 'updateDetails'
  title?: string
  alias?: string | null
  targetParentId?: string | null
  targetIndex?: number
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json()) as PatchBody
  const { id } = params

  switch (body.action) {
    case 'rename': {
      const state = await runWithUserContext(user.id, () => updateTodoDetails(id, { title: body.title ?? '' }))
      return NextResponse.json(state)
    }
    case 'updateDetails': {
      const details: { title?: string; alias?: string | null } = {}
      if (typeof body.title === 'string') {
        details.title = body.title
      }
      if (Object.prototype.hasOwnProperty.call(body, 'alias')) {
        details.alias = body.alias ?? null
      }
      const state = await runWithUserContext(user.id, () => updateTodoDetails(id, details))
      return NextResponse.json(state)
    }
    case 'toggleCompleted': {
      const state = await runWithUserContext(user.id, () => toggleTodoCompleted(id))
      return NextResponse.json(state)
    }
    case 'move': {
      const state = await runWithUserContext(user.id, () =>
        moveTodo(id, body.targetParentId ?? null, body.targetIndex ?? 0),
      )
      return NextResponse.json(state)
    }
    case 'togglePinned': {
      const state = await runWithUserContext(user.id, () => togglePinned(id))
      return NextResponse.json(state)
    }
    default:
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const state = await runWithUserContext(user.id, () => deleteTodo(params.id))
  return NextResponse.json(state)
}
