import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const fwd = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    
    const response = await fetch(`http://localhost:8080/analyze/${id}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward client IP for rate limiting on backend
        'x-forwarded-for': fwd,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Не удалось отправить отзыв' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error sending feedback to backend:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
