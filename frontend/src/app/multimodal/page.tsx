'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function MultimodalPage() {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [invalid, setInvalid] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/public/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/multimodal' }) }).catch(()=>{});
  }, []);

  const sanitizeIfNeeded = (value: string) => {
    const v = value.trim();
    if (v && !/^https?:\/\//i.test(v)) return 'https://' + v.replace(/^\/+/, '');
    return v;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    setInvalid(false);

    // Проверяем, что есть хотя бы один тип данных
    if (!url && !text && images.length === 0) {
      setInvalid(true);
      setStatus('Добавьте хотя бы URL, текст или изображение для анализа');
      return;
    }

    // Проверяем URL если он есть
    if (url) {
      const value = sanitizeIfNeeded(url);
      try { 
        new URL(value); 
        setUrl(value);
      } catch { 
        setInvalid(true);
        setStatus('Неверный формат URL');
        return;
      }
    }

    setLoading(true);
    setStatus('Подготавливаем данные для анализа…');

    try {
      // Конвертируем изображения в base64
      const imageUrls = await Promise.all(
        images.map(img => convertImageToBase64(img))
      );

      setStatus('Отправляем запрос на анализ…');

      const response = await fetch('/api/public/analyze/multimodal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url || undefined,
          text: text || undefined,
          images: imageUrls.length > 0 ? imageUrls : undefined,
          comment: comment || undefined,
          locale: 'ru'
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          const body = await response.json().catch(()=>({}));
          const limit = body?.limitPer6Hours;
          setStatus(`Превышен лимит (${limit}/6ч) — подождите или попробуйте позже.`);
        } else {
          const text = await response.text();
          setStatus('Server error: ' + (text || response.status));
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
      setStatus('Loading...');
      router.push(`/result/${result.id}`);
    } catch (err) {
      console.error(err);
      setStatus('Network error. Is backend running on http://localhost:8080?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl flex flex-col gap-8">
        {/* Header */}
        <header className="text-center" role="banner">
          <div className="flex justify-center mb-1">
            <img src="/logo_icon.png" alt="SafestNet logo" className="h-[120px] w-auto icon-glow logo-glow logo-glow-always" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white text-glow-strong-dark">SafestNet</h1>
          <p className="mt-2 text-base sm:text-lg text-[color:var(--text-sub)] text-glow-strong">Мультимодальный анализ безопасности</p>
        </header>

        <main id="main" role="main" className="flex-1 w-full space-y-8">
          {/* Analyze card */}
          <Card variant="positive" aria-labelledby="analyze-title">
            <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
              <h2 id="analyze-title" className="text-2xl font-bold">Мультимодальный анализ</h2>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[rgba(34,225,121,.12)] text-[color:var(--text-sub)] border border-[rgba(34,225,121,.22)]">Новое</span>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* URL */}
              <div>
                <Input 
                  label="URL-адрес (необязательно)" 
                  inputMode="url" 
                  autoComplete="url" 
                  placeholder="https://пример.домен/страница" 
                  value={url} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUrl(e.target.value)} 
                  onBlur={()=>setUrl(sanitizeIfNeeded(url))} 
                />
                <p className="mt-1 text-xs text-[color:var(--muted)]">Вставьте подозрительный URL для анализа</p>
              </div>

              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Текст для анализа (необязательно)
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-[rgba(255,255,255,.05)] border border-[rgba(255,255,255,.1)] rounded-lg text-white placeholder-[rgba(255,255,255,.5)] focus:outline-none focus:ring-2 focus:ring-[rgba(34,225,121,.5)] focus:border-transparent"
                  rows={4}
                  placeholder="Вставьте подозрительный текст, письмо или сообщение..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <p className="mt-1 text-xs text-[color:var(--muted)]">Анализируем фишинг, давление, подозрительные паттерны</p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Изображения (необязательно)
                </label>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Добавить изображения
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-[rgba(255,255,255,.1)]"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted)]">Загрузите скриншоты, фото интерфейсов, QR-коды</p>
              </div>

              {/* Comment */}
              <div>
                <Input 
                  label="Ваш комментарий (необязательно)" 
                  placeholder="Дополнительная информация о контексте..."
                  value={comment} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setComment(e.target.value)} 
                />
                <p className="mt-1 text-xs text-[color:var(--muted)]">Расскажите, что вас насторожило</p>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                  <p className="text-xs text-[color:var(--muted)]">Лимит: 6 запросов каждые 6 часов</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2">
                  <svg className={`${loading ? '' : 'hidden'} animate-spin h-5 w-5`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"></path>
                  </svg>
                  <span>{loading ? 'Анализирую…' : 'Анализировать'}</span>
                </Button>
              </div>
              
              <div className="mt-1">
                <p role="status" aria-live="polite" className="text-sm text-[color:var(--text-sub)]">{status}</p>
              </div>
            </form>
          </Card>

          {/* Features */}
          <Card variant="positive" aria-labelledby="features-title">
            <h2 id="features-title" className="text-2xl font-bold mb-4">Возможности мультимодального анализа</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <div>
                  <p className="font-semibold">Анализ URL</p>
                  <p className="text-sm text-[color:var(--text-sub)]">Проверка доменов, тайпсквоттинг, подозрительные TLD</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <div>
                  <p className="font-semibold">Анализ текста</p>
                  <p className="text-sm text-[color:var(--text-sub)]">Фишинг-паттерны, давление, срочность, подозрительная лексика</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <div>
                  <p className="font-semibold">Анализ изображений</p>
                  <p className="text-sm text-[color:var(--text-sub)]">OCR, поддельные интерфейсы, QR-коды, визуальные аномалии</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2"/>
                  <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2"/>
                  <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2"/>
                  <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2"/>
                </svg>
                <div>
                  <p className="font-semibold">Извлечение IOC</p>
                  <p className="text-sm text-[color:var(--text-sub)]">Домены, email, телефоны, криптокошельки, мессенджеры</p>
                </div>
              </li>
            </ul>
          </Card>

          {/* Back to simple analysis */}
          <Card variant="default">
            <div className="text-center">
              <p className="text-sm text-[color:var(--text-sub)] mb-3">Нужен только анализ URL?</p>
                             <Button onClick={() => router.push('/')}>
                 Перейти к простому анализу
               </Button>
            </div>
          </Card>

          {/* Disclaimer */}
          <section className="text-center px-4">
            <p className="text-xs sm:text-sm italic text-[color:var(--text-sub)] opacity-80">Результаты носят справочный характер и не являются юридическим заключением. Проверяйте критически важные данные через официальные источники.</p>
          </section>
        </main>

        <footer role="contentinfo" className="mt-6 text-center text-[color:var(--text-sub)] text-sm opacity-70">
          <small>&copy; <span>{new Date().getFullYear()}</span> SafestNet v.1.0</small>
        </footer>
      </div>
    </div>
  );
}
