import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const backend = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
    const response = await fetch(`${backend}/analyze/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (e) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
