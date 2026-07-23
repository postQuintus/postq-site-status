import { NextResponse } from 'next/server'
import { getDailyHistory } from '@/lib/history-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(getDailyHistory(90))
  } catch (err) {
    console.error('[/api/history]', err)
    return NextResponse.json({}, { status: 200 })
  }
}
