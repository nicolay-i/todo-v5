import { NextResponse } from 'next/server'
import { getRandomTodoChain } from '@/lib/todoService'

export async function GET() {
  try {
    const chain = await getRandomTodoChain()
    return NextResponse.json({ chain })
  } catch (error) {
    console.error('Failed to get random todo chain:', error)
    return NextResponse.json(
      { error: 'Failed to get random todo chain' },
      { status: 500 }
    )
  }
}
