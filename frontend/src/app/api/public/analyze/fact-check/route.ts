import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const image = formData.get('image') as File | null;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Получаем язык из заголовка или используем английский по умолчанию
    const locale = request.headers.get('x-locale') || 'en';
    
    // Подготавливаем данные для отправки в backend
    const payload: Record<string, string> = {
      text,
      type: 'fact-check',
      locale
    };

    if (image) {
      // Конвертируем файл в base64 для отправки
      const buffer = await image.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      payload.image = `data:${image.type};base64,${base64}`;
    }

    // Отправляем запрос в backend
    const backend = process.env.BACKEND_URL || 'http://localhost:8080';
    const response = await fetch(`${backend.replace(/\/$/, '')}/analyze/fact-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-locale': locale,
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Fact check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
