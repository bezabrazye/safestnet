import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('API route: Received report submission');
    console.log('Body keys:', Object.keys(body));
    // Pass raw IP to backend (hashed there) for rate limiting / anti-spam
    const xfwd = request.headers.get('x-forwarded-for') || '';
    const ip = xfwd.split(',')[0]?.trim() || '';
    const { hcaptchaToken, ...rest } = body || {};
    const payload = { ...rest, ip };
    const backend = process.env.BACKEND_URL || 'http://localhost:8080';
    const resp = await fetch(`${backend.replace(/\/$/, '')}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('Backend response status:', resp.status);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('Backend error:', errorText);
      return NextResponse.json({ error: 'Failed to submit report' }, { status: resp.status });
    }
    
    const data = await resp.json();
    console.log('Backend response data:', data);
    return NextResponse.json(data, { status: resp.status });
  } catch (e) {
    console.error('API route error:', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}


