import { NextResponse } from 'next/server'
import { getAppStateFromDb } from '@/lib/database'

export async function GET() {
  const state = getAppStateFromDb()
  return NextResponse.json(state)
}
