import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, email, name, company, address, socialMedia } = body;

    // Проверяем, что хотя бы одно поле заполнено
    const hasData = [phone, email, name, company, address, socialMedia].some(value => value?.trim());
    if (!hasData) {
      return NextResponse.json({ error: 'Enter at least one type of data to check' }, { status: 400 });
    }

    // Получаем язык из заголовка или используем английский по умолчанию
    const locale = request.headers.get('x-locale') || 'en';
    
    // Отправляем запрос в backend
    const response = await fetch('http://localhost:8080/analyze/data-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-locale': locale,
      },
      body: JSON.stringify({
        phone: phone?.trim() || '',
        email: email?.trim() || '',
        name: name?.trim() || '',
        company: company?.trim() || '',
        address: address?.trim() || '',
        socialMedia: socialMedia?.trim() || '',
        type: 'data-check',
        locale
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Data check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
