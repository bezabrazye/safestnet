import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const images: File[] = [];

    // Собираем все изображения
    for (let i = 0; i < 3; i++) {
      const image = formData.get(`image${i}`) as File;
      if (image) {
        images.push(image);
      }
    }

    if (!text) {
      return NextResponse.json({ error: 'Situation description is required' }, { status: 400 });
    }

    // Получаем язык из заголовка или используем английский по умолчанию
    const locale = request.headers.get('x-locale') || 'en';
    
    // Подготавливаем данные для отправки в backend
    const payload: Record<string, string | string[]> = {
      text,
      type: 'fraud-detector',
      locale
    };

    // Конвертируем изображения в base64
    if (images.length > 0) {
      payload.images = [];
      for (const image of images) {
        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        payload.images.push(`data:${image.type};base64,${base64}`);
      }
    }

    // Отправляем запрос в backend
    const response = await fetch('http://localhost:8080/analyze/fraud-detector', {
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
    console.error('Fraud detector error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
