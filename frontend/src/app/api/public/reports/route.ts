import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backend = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
    const response = await fetch(`${backend}/public/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (e) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}


