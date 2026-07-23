import { NextResponse } from 'next/server'
import { getIncidents } from '@/lib/history-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(getIncidents())
  } catch (err) {
    console.error('[/api/incidents]', err)
    return NextResponse.json([], { status: 200 })
  }
}
