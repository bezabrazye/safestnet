import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(()=>({}));
    const headers = new Headers();
    // Forward some headers to help backend detect ip/ua
    const xfwd = request.headers.get('x-forwarded-for');
    const xreal = request.headers.get('x-real-ip');
    const ua = request.headers.get('user-agent');
    const ref = request.headers.get('referer');
    if (xfwd) headers.set('x-forwarded-for', xfwd);
    if (xreal) headers.set('x-real-ip', xreal);
    if (ua) headers.set('user-agent', ua);
    if (ref) headers.set('referer', ref);
    headers.set('Content-Type', 'application/json');

    const backend = process.env.BACKEND_URL || 'http://localhost:8080';
    const resp = await fetch(`${backend.replace(/\/$/, '')}/public/visit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ path: body?.path || '/' })
    });
    const data = await resp.json().catch(()=>({ ok: false }));
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
