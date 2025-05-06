import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import type { BackendConfig } from '@/lib/types'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ruleNumber: string }> }
) {
  const { ruleNumber } = await params

  const searchParams = request.nextUrl.searchParams
  const backendId    = searchParams.get('backendId')
  if (!backendId) {
    return NextResponse.json(
      { error: 'Bad Request', details: 'Missing backendId query parameter.' },
      { status: 400 }
    )
  }

  let activeBackend: BackendConfig | undefined
  try {
    activeBackend = db
      .prepare('SELECT id, name, url, apiKey FROM backends WHERE id = ?')
      .get(backendId) as BackendConfig | undefined

    if (!activeBackend?.url || !activeBackend?.apiKey) {
      return NextResponse.json(
        { error: 'Configuration Error', details: 'Backend not configured or API key/URL is missing.' },
        { status: 401 }
      )
    }
  } catch (dbError: any) {
    console.error('Database error fetching backend configuration:', dbError)
    return NextResponse.json(
      { error: 'Internal Server Error', details: 'Failed to retrieve backend configuration.' },
      { status: 500 }
    )
  }

  try { new URL(activeBackend.url) }
  catch {
    return NextResponse.json(
      { error: 'Bad Request', details: 'Invalid backendUrl format in stored configuration.' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(
      `${activeBackend.url}/rules/delete/${ruleNumber}`,
      { method: 'DELETE', headers: { 'X-API-KEY': activeBackend.apiKey } }
    )

    if (!response.ok) {
      let details = `Backend error! status: ${response.status}`
      try {
        const data = await response.json()
        details += `: ${data.error ?? 'Unknown backend error'} - ${data.details ?? ''}`
      } catch {}
      console.error(`Failed to delete rule ${ruleNumber} via backend:`, details)
      return NextResponse.json(
        { error: `Failed to delete rule ${ruleNumber}`, details },
        { status: response.status }
      )
    }

    return NextResponse.json(
      { message: `Rule [${ruleNumber}] deleted successfully via backend` },
      { status: response.status }
    )
  } catch (error: any) {
    console.error(`Error deleting rule ${ruleNumber}:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message ?? 'Unknown error occurred' },
      { status: 500 }
    )
  }
}
