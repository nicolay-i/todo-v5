import { NextResponse } from 'next/server'
import { attachTagToTodo, detachTagFromTodo } from '@/lib/todoService'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { tagId } = await request.json()
  const state = await attachTagToTodo(params.id, tagId)
  return NextResponse.json(state)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { tagId } = await request.json()
  const state = await detachTagFromTodo(params.id, tagId)
  return NextResponse.json(state)
}
