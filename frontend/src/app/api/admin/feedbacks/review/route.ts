import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers.entries());
    
    console.log('API route: Received request to mark feedbacks as reviewed');
    console.log('Body:', body);
    console.log('Headers:', { 'x-admin-user': headers['x-admin-user'], 'x-admin-pass': headers['x-admin-pass'] });
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8080'}/admin/feedbacks/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-user': headers['x-admin-user'] || '',
        'x-admin-pass': headers['x-admin-pass'] || '',
      },
      body: JSON.stringify(body)
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json({ error: 'Failed to mark feedbacks as reviewed' }, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
