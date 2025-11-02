import { NextResponse } from 'next/server'
import { destroySessionCookie } from '@/lib/auth/session'

export async function POST() {
  const response = NextResponse.json({ success: true })
  destroySessionCookie(response)
  return response
}
