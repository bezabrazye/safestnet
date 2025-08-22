'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [analysisId, setAnalysisId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [status, setStatus] = useState('');
  const [captchaToken] = useState('');
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const captchaWidgetIdRef = useRef<unknown>(null);

  useEffect(() => {
    fetch('/api/public/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/report' }) }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setAnalysisId(params.get('analysis') || '');
    }
  }, []);

  // CAPTCHA отключена до подключения Google reCAPTCHA

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return setImageBase64(undefined);
    if (!f.type.startsWith('image/')) {
      setStatus(t.report.imagesOnlyError);
      (e.target as HTMLInputElement).value = '';
      return;
    }
    
    // Проверяем размер файла (максимум 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (f.size > maxSize) {
      setStatus('Размер изображения не должен превышать 5MB');
      (e.target as HTMLInputElement).value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => setImageBase64(String(reader.result));
    reader.readAsDataURL(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    // Require all fields except image
    if (!name.trim() || !email.trim() || !message.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setStatus((t as any)?.errors?.requiredField || 'Заполните все обязательные поля');
      return;
    }
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const analysisLink = analysisId ? `${origin}/result/${encodeURIComponent(analysisId)}` : undefined;
      const resp = await fetch('/api/public/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, imageBase64, analysisId: analysisId || undefined, analysisLink, hcaptchaToken: captchaToken })
      });
      const data = await resp.json();
      if (!resp.ok || data?.error) {
        setStatus('Ошибка отправки');
        return;
      }
      setStatus('Сообщение отправлено');
      setName(''); setEmail(''); setMessage(''); setImageBase64(undefined);
    } catch {
      setStatus('Сеть недоступна');
    }
  };

  return (
    <Suspense fallback={null}>
    <div className="min-h-screen flex flex-col items-center">
      <style jsx global>{`
        .appbar{position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.1) blur(10px); background:linear-gradient(180deg, rgba(12,22,17,.75), rgba(12,22,17,.35)); border-bottom:1px solid rgba(4,210,128,.26)}
        .card{background: linear-gradient(145deg,var(--card-from),var(--card-to)); border:1px solid rgba(4,210,128,.18); box-shadow: 0 0 14px rgba(4,210,128,.22), inset 0 0 6px rgba(4,210,128,.10); transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; border-radius: 16px;}
        .card:hover{ transform:translateY(-2px); box-shadow:0 10px 28px rgba(4,210,128,.38), inset 0 0 12px rgba(4,210,128,.18) }
        .input{background: rgba(10,30,18,.6); border:1px solid rgba(255,255,255,.06); color:var(--text); transition:border-color .2s ease, box-shadow .2s ease, background-color .2s ease; border-radius:12px}
        .input::placeholder{ color:var(--muted) }
        .input:focus{ outline:0; border-color:var(--secondary); box-shadow:0 0 0 4px rgba(4,210,128,.20), 0 0 10px var(--ring); background:rgba(10,30,18,.72) }
        .btn{ background:linear-gradient(145deg,var(--primary),var(--secondary)); color:#0a1e12; font-weight:700; box-shadow:0 0 10px rgba(0,255,157,.5); transition:transform .2s ease, box-shadow .2s ease, filter .2s ease, opacity .2s ease; border-radius:12px }
        .btn:hover{ transform: translateY(-1px) scale(1.02); box-shadow:0 0 22px rgba(0,255,157,.95) }
        .icon-glow{ filter: drop-shadow(0 0 6px var(--primary)); transition: transform .25s ease }
        .icon-glow:hover{ transform: translateY(-1px) }
      `}</style>

      <div className="mist-overlay"></div>

      <header className="appbar w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          <button onClick={() => router.back()} className="text-sm text-[color:var(--text-sub)] hover:opacity-80">← {t.common.backToHome}</button>
          <span className="text-sm text-[color:var(--text-sub)]">SafestNet</span>
        </div>
      </header>
      <main className="w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="card p-6 sm:p-8 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">{t.report.title}</h1>
          <p className="mt-2 text-[color:var(--text-sub)]">{t.report.intro}</p>

          <form onSubmit={submit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-semibold mb-1">{t.report.nameLabel}</label>
              <input className="input w-full px-4 py-3" value={name} onChange={e=>setName(e.target.value)} placeholder="" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t.report.emailLabel}</label>
              <input className="input w-full px-4 py-3" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t.report.messageLabel}</label>
              <textarea className="input w-full px-4 py-3 h-40" value={message} onChange={e=>setMessage(e.target.value)} placeholder="" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">{t.report.addPhotoLabel}</label>
              <input type="file" accept="image/*" onChange={onFile} />
            </div>
            {process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && (
              <div className="mt-2">
                <div ref={captchaContainerRef}></div>
              </div>
            )}
            <button type="submit" className="btn px-6 py-3">{t.report.submitButton}</button>
            {status && (
              <p className="text-sm text-[color:var(--text-sub)]">
                {status === 'Сообщение отправлено' ? t.report.sentStatus : status === 'Ошибка отправки' ? t.report.errorStatus : t.report.networkStatus}
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
    </Suspense>
  );
}


