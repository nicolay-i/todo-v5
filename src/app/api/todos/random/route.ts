import { NextResponse } from 'next/server'
import { getRandomTodoChain } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const chain = await getRandomTodoChain(user.id)
    return NextResponse.json({ chain })
  } catch (error) {
    console.error('Failed to get random todo chain:', error)
    return NextResponse.json(
      { error: 'Failed to get random todo chain' },
      { status: 500 }
    )
  }
}
