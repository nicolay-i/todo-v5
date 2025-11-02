import { NextResponse } from 'next/server'
import { addTag, deleteTag, listTags, renameTag, reorderTags } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const state = await listTags(user.id)
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { name } = await request.json()
  const state = await addTag(user.id, name ?? '')
  return NextResponse.json(state)
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id, name } = await request.json()
  const state = await renameTag(user.id, id, name ?? '')
  return NextResponse.json(state)
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await request.json()
  const state = await deleteTag(user.id, id)
  return NextResponse.json(state)
}

export async function PUT(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { tagIds } = await request.json()
  const state = await reorderTags(user.id, tagIds)
  return NextResponse.json(state)
}
