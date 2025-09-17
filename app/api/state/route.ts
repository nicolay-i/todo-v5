import { NextRequest, NextResponse } from 'next/server'
import { getAppState, handleAction } from '@/lib/state'
import type { ActionRequest } from '@/types/state'

export async function GET() {
  try {
    const state = await getAppState()
    return NextResponse.json(state)
  } catch (error) {
    console.error('Failed to load state', error)
    return NextResponse.json({ message: 'Не удалось загрузить данные' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const action = (await request.json()) as ActionRequest
    await handleAction(action)
    const state = await getAppState()
    return NextResponse.json(state)
  } catch (error) {
    console.error('Failed to apply action', error)
    return NextResponse.json({ message: 'Не удалось сохранить изменения' }, { status: 400 })
  }
}
