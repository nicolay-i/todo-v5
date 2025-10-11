import { NextResponse } from 'next/server'
import { addTag, deleteTag, listTags, renameTag, reorderTags } from '@/lib/todoService'
import { requireUser, UnauthorizedError } from '@/lib/auth/session'

export async function GET() {
  try {
    const user = await requireUser()
    const state = await listTags(user.id)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser()
    const { name } = await request.json()
    const state = await addTag(user.id, name ?? '')
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to add tag', error)
    return NextResponse.json({ message: 'Не удалось добавить тег' }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser()
    const { id, name } = await request.json()
    const state = await renameTag(user.id, id, name ?? '')
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to rename tag', error)
    return NextResponse.json({ message: 'Не удалось переименовать тег' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireUser()
    const { id } = await request.json()
    const state = await deleteTag(user.id, id)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to delete tag', error)
    return NextResponse.json({ message: 'Не удалось удалить тег' }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser()
    const { tagIds } = await request.json()
    const state = await reorderTags(user.id, tagIds)
    return NextResponse.json(state)
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    console.error('Failed to reorder tags', error)
    return NextResponse.json({ message: 'Не удалось упорядочить теги' }, { status: 400 })
  }
}
