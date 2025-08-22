import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = request.headers.get('x-admin-user') || '';
    const pass = request.headers.get('x-admin-pass') || '';
    const resp = await fetch('http://localhost:8080/admin/reports', {
      headers: { 'x-admin-user': user, 'x-admin-pass': pass }
    });
    const data = await resp.json();
    console.log('Frontend API reports response:', data);
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    console.error('Frontend API reports error:', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}




