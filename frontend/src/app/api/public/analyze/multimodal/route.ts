import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    
    // Валидация входных данных
    if (!body.url && !body.text && (!body.images || body.images.length === 0)) {
      return NextResponse.json(
        { error: 'At least one of url, text, or images must be provided' },
        { status: 400 }
      );
    }

    // Отправляем запрос к backend
    const backend = process.env.BACKEND_URL || 'http://localhost:8080';
    const backendResponse = await fetch(`${backend.replace(/\/$/, '')}/analyze/multimodal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: body.url,
        text: body.text,
        images: body.images,
        videoFrames: body.videoFrames,
        comment: body.comment,
        locale: body.locale || 'ru'
      })
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error:', backendResponse.status, errorText);
      return NextResponse.json(
        { error: 'Backend analysis failed', details: errorText },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Multimodal analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
