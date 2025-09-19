import { NextResponse } from 'next/server'
import { addTag, deleteTag, listTags, renameTag } from '@/lib/todoService'

export async function GET() {
  const state = await listTags()
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const { name } = await request.json()
  const state = await addTag(name ?? '')
  return NextResponse.json(state)
}

export async function PATCH(request: Request) {
  const { id, name } = await request.json()
  const state = await renameTag(id, name ?? '')
  return NextResponse.json(state)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const state = await deleteTag(id)
  return NextResponse.json(state)
}
