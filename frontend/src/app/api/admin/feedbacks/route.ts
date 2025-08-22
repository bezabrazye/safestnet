import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = request.headers.get('x-admin-user') || '';
    const pass = request.headers.get('x-admin-pass') || '';
    const backend = (process.env.BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
    const resp = await fetch(`${backend}/admin/feedbacks`, {
      headers: { 'x-admin-user': user, 'x-admin-pass': pass }
    });
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}


