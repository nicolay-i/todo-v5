import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSessionByToken, SESSION_COOKIE_NAME } from '@/lib/auth/session'

export async function POST() {
  const cookieStore = cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (token) {
    await deleteSessionByToken(token)
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set({ name: SESSION_COOKIE_NAME, value: '', maxAge: 0, path: '/' })
  return response
}
