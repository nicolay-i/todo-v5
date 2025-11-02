import { NextResponse } from 'next/server'
import { addTag, deleteTag, listTags, renameTag, reorderTags } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'
import { runWithUserContext } from '@/lib/auth/userContext'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const state = await runWithUserContext(user.id, () => listTags())
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name } = await request.json()
  const state = await runWithUserContext(user.id, () => addTag(name ?? ''))
  return NextResponse.json(state)
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, name } = await request.json()
  const state = await runWithUserContext(user.id, () => renameTag(id, name ?? ''))
  return NextResponse.json(state)
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await request.json()
  const state = await runWithUserContext(user.id, () => deleteTag(id))
  return NextResponse.json(state)
}

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { tagIds } = await request.json()
  const state = await runWithUserContext(user.id, () => reorderTags(tagIds))
  return NextResponse.json(state)
}
