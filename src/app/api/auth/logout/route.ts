import { NextResponse } from 'next/server'
import { buildClearedSessionCookie, getSessionFromCookies, invalidateSession } from '@/lib/auth/session'
import type { TodoState } from '@/lib/types'

const EMPTY_STATE: TodoState = {
  todos: [],
  pinnedLists: [],
  tags: [],
  user: null,
}

export async function POST() {
  const session = await getSessionFromCookies()
  if (session) {
    await invalidateSession(session.token)
  }

  const response = NextResponse.json(EMPTY_STATE)
  response.cookies.set(buildClearedSessionCookie())
  return response
}
