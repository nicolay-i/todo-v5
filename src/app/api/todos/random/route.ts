import { NextResponse } from 'next/server'
import { getRandomTodoChain, getTodoChainById } from '@/lib/todoService'
import { getCurrentUser } from '@/lib/auth/session'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Проверяем наличие query параметра id
    const { searchParams } = new URL(request.url)
    const todoId = searchParams.get('id')
    
    let chain
    if (todoId) {
      // Если передан id, получаем цепочку для конкретного todo
      chain = await getTodoChainById(user.id, todoId)
    } else {
      // Иначе получаем случайную цепочку
      chain = await getRandomTodoChain(user.id)
    }
    
    return NextResponse.json({ chain })
  } catch (error) {
    console.error('Failed to get todo chain:', error)
    return NextResponse.json(
      { error: 'Failed to get todo chain' },
      { status: 500 }
    )
  }
}
