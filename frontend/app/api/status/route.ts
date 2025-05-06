import { NextResponse, NextRequest } from 'next/server';
import db from '@/lib/db';
import type { BackendConfig } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const backendId = searchParams.get('backendId'); // Expect backendId

  if (!backendId) {
    return NextResponse.json({ error: 'Bad Request', details: 'Missing backendId query parameter.' }, { status: 400 });
  }

  let activeBackend: BackendConfig | undefined;

  try {
    // Fetch the full backend config using ID
    activeBackend = db.prepare("SELECT id, name, url, apiKey FROM backends WHERE id = ?").get(backendId) as BackendConfig | undefined;

    if (!activeBackend || !activeBackend.url || !activeBackend.apiKey) {
      console.error(`Backend configuration not found or incomplete for backendId: ${backendId}`);
      return NextResponse.json({ error: 'Configuration Error', details: 'Backend not configured or API key/URL is missing.' }, { status: 401 });
    }
  } catch (dbError: any) {
    console.error("Database error fetching backend configuration:", dbError);
    return NextResponse.json({ error: 'Internal Server Error', details: 'Failed to retrieve backend configuration.' }, { status: 500 });
  }
  
  // Validate URL format from the fetched config
  try {
    new URL(activeBackend.url);
  } catch (_) {
    return NextResponse.json({ error: 'Bad Request', details: 'Invalid backendUrl format in stored configuration.' }, { status: 400 });
  }

  try {
    // Use the fetched backend URL and API key
    const response = await fetch(`${activeBackend.url}/status`, {
      headers: {
        'X-API-KEY': activeBackend.apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data || { error: 'Failed to fetch status from backend', details: `Status: ${response.status}` }, { status: response.status });
    }

    return NextResponse.json({
        status: data.status,
        rules: data.rules || [],
    });

  } catch (error: any) {
    console.error("Error fetching UFW status:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message || 'Unknown error occurred' }, { status: 500 });
  }
}
