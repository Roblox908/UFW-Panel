import { NextResponse, NextRequest } from 'next/server';
import db from '@/lib/db'; 
import { BackendConfig } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const stmt = db.prepare('SELECT id, name, url, apiKey FROM backends ORDER BY createdAt DESC');
    const backends = stmt.all() as BackendConfig[]; 
    return NextResponse.json(backends);
  } catch (error: any) {
    console.error("Error fetching backends:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Omit<BackendConfig, 'id' | 'createdAt'>; // Expect name, url, apiKey

    if (!body.name || !body.url || !body.apiKey) {
      return NextResponse.json({ error: 'Bad Request', details: 'Missing required fields: name, url, apiKey.' }, { status: 400 });
    }
    try {
      new URL(body.url);
    } catch (_) {
      return NextResponse.json({ error: 'Bad Request', details: 'Invalid URL format.' }, { status: 400 });
    }

    const newId = uuidv4();
    const stmt = db.prepare('INSERT INTO backends (id, name, url, apiKey) VALUES (?, ?, ?, ?)');
    const info = stmt.run(newId, body.name, body.url, body.apiKey);

    // Check for unique constraint violation (url)
    // Note: better-sqlite3 throws an error for constraint violations, caught below

    const newBackend: BackendConfig = {
        id: newId,
        name: body.name,
        url: body.url,
        apiKey: body.apiKey // Return the apiKey? Maybe not necessary for GET, but needed for insert
    };

    return NextResponse.json(newBackend, { status: 201 }); // Return the newly created backend

  } catch (error: any) {
    console.error("Error adding backend:", error);
    // Handle specific constraint errors (like UNIQUE URL)
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return NextResponse.json({ error: 'Conflict', details: 'A backend with this URL already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const backendId = searchParams.get('id');

    if (!backendId) {
        return NextResponse.json({ error: 'Bad Request', details: 'Missing backend ID query parameter.' }, { status: 400 });
    }

    try {
        const stmt = db.prepare('DELETE FROM backends WHERE id = ?');
        const info = stmt.run(backendId);

        if (info.changes === 0) {
            return NextResponse.json({ error: 'Not Found', details: 'Backend configuration not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Backend removed successfully' }, { status: 200 });

    } catch (error: any) {
        console.error("Error deleting backend:", error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
