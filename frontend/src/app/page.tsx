'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

type AnalysisMode = 'url' | 'fact-check' | 'data-check' | 'fraud-detector';

export default function HomePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [activeMode, setActiveMode] = useState<AnalysisMode>('url');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [urlError, setUrlError] = useState('');

  // URL Scanner state
  const [url, setUrl] = useState('');

  // Track visit
  useEffect(() => {
    fetch('/api/public/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/' }) }).catch(()=>{});
  }, []);

  // Fact Check state
  const [factText, setFactText] = useState('');
  const [factImage, setFactImage] = useState<File | null>(null);
  const [factImagePreview, setFactImagePreview] = useState('');

  // Data Check state
  const [dataForm, setDataForm] = useState({
    phone: '',
    email: '',
    name: '',
    company: '',
    address: '',
    socialMedia: ''
  });

  // Fraud Detector state
  const [fraudText, setFraudText] = useState('');
  const [fraudImages, setFraudImages] = useState<File[]>([]);
  const [fraudImagePreviews, setFraudImagePreviews] = useState<string[]>([]);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  // URL validation (robust, accepts punycode & IDN)
  const isValidHttpUrl = (value: string) => {
    try {
      const u = new URL(value);
      return (u.protocol === 'http:' || u.protocol === 'https:') && !!u.hostname;
    } catch {
      return false;
    }
  };

  // Coming Soon Modal Handler
  const handleComingSoonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowComingSoonModal(true);
  };

  // URL Scanner handlers
  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUrlError('');
    setStatus('');

    if (!url) {
      setUrlError(t.errors.requiredField);
      return;
    }

    if (!isValidHttpUrl(url)) {
      setUrlError(t.errors.invalidUrl);
      return;
    }

    const payload = {
      url,
      locale: language
    };

    setLoading(true);
    setStatus(t.common.loading);

    try {
      const resp = await fetch('/api/public/analyze/url', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-locale': language
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const text = await resp.text();
        setStatus(t.errors.serverError + ': ' + (text || resp.status));
        setLoading(false);
        return;
      }

      const data = await resp.json();
      setStatus(t.common.loading);
      if (data && data.id) {
        router.push('/result/' + encodeURIComponent(data.id));
      } else {
        setStatus(t.errors.serverError);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setStatus(t.errors.networkError);
      setLoading(false);
    }
  };

  const handleUrlBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    if (v && !/^https?:\/\//i.test(v)) {
      setUrl('https://' + v.replace(/^\/+/, ''));
    }
  };

  // Fact Check handlers
  const handleFactImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFactImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFactImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!factText.trim()) {
      setStatus(t.errors.requiredField);
      return;
    }

    setLoading(true);
    setStatus(t.home.checkingFacts);

    try {
      const formData = new FormData();
      formData.append('text', factText);
      if (factImage) {
        formData.append('image', factImage);
      }

      const resp = await fetch('/api/public/analyze/fact-check', {
        method: 'POST',
        headers: {
          'x-locale': language
        },
        body: formData
      });

      if (!resp.ok) {
        const text = await resp.text();
        setStatus(t.errors.serverError + ': ' + (text || resp.status));
        setLoading(false);
        return;
      }

      const data = await resp.json();
      setStatus(t.common.loading);
      if (data && data.id) {
        router.push('/result/' + encodeURIComponent(data.id));
      } else {
        setStatus(t.errors.serverError);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setStatus(t.errors.networkError);
      setLoading(false);
    }
  };

  // Data Check handlers
  const handleDataInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDataForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDataSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hasData = Object.values(dataForm).some(value => value?.trim());
    if (!hasData) {
      setStatus(t.errors.atLeastOneField);
      return;
    }

    setLoading(true);
    setStatus(t.home.searchingInfo);

    try {
      const resp = await fetch('/api/public/analyze/data-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-locale': language
        },
        body: JSON.stringify(dataForm)
      });

      if (!resp.ok) {
        const text = await resp.text();
        setStatus(t.errors.serverError + ': ' + (text || resp.status));
        setLoading(false);
        return;
      }

      const data = await resp.json();
      setStatus(t.common.loading);
      if (data && data.id) {
        router.push('/result/' + encodeURIComponent(data.id));
        } else {
        setStatus(t.errors.serverError);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setStatus(t.errors.networkError);
      setLoading(false);
    }
  };

  // Fraud Detector handlers
  const handleFraudImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      setStatus(t.errors.fileTooLarge);
      return;
    }
    setFraudImages(files);
    
    const previews = files.map(file => {
      const reader = new FileReader();
      reader.onload = (e) => e.target?.result as string;
      reader.readAsDataURL(file);
      return reader.result as string;
    });
    setFraudImagePreviews(previews);
  };

  const removeFraudImage = (index: number) => {
    setFraudImages(prev => prev.filter((_, i) => i !== index));
    setFraudImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleFraudSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fraudText.trim()) {
      setStatus(t.errors.requiredField);
      return;
    }

    setLoading(true);
    setStatus(t.home.analyzingFraud);

    try {
      const formData = new FormData();
      formData.append('text', fraudText);
      fraudImages.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      const resp = await fetch('/api/public/analyze/fraud-detector', {
        method: 'POST',
        headers: {
          'x-locale': language
        },
        body: formData
      });

      if (!resp.ok) {
        const text = await resp.text();
        setStatus(t.errors.serverError + ': ' + (text || resp.status));
        setLoading(false);
        return;
      }

      const data = await resp.json();
      setStatus(t.common.loading);
      if (data && data.id) {
        router.push('/result/' + encodeURIComponent(data.id));
      } else {
        setStatus(t.errors.serverError);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setStatus(t.errors.networkError);
      setLoading(false);
    }
  };

  const clearError = () => {
    setUrlError('');
    setStatus('');
  };

  const getModeButtonClass = (mode: AnalysisMode) => {
    return `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      activeMode === mode 
        ? 'bg-[rgba(4,210,128,.12)] text-[color:var(--text-sub)] border border-[rgba(4,210,128,.26)]'
        : 'text-[color:var(--muted)] hover:text-[color:var(--text-sub)]'
    }`;
  };

  return (
    <>
      <style jsx global>{`
        /* ===== Green Mist 2.0 tokens ===== */
        :root{
          --bg-0:#060c09;
          --bg-1:#0b0f0c; --bg-2:#0a1e12; --bg-3:#092c1b;
          --primary:#00ff9d; --secondary:#04d280; --accent:#37ffd1;
          --text:#f0f5f2; --text-sub:#d9e2de; --muted:#9fb6ad;
          --card-from:#0e1914; --card-to:#0b1511;
          --chip-bg:rgba(4,210,128,.12); --chip-stroke:rgba(4,210,128,.26);
          --stroke:rgba(56,255,189,.22); --ring: rgba(4,210,128,.60);
          --ok:#22e179; --warn:#f59e0b; --danger:#ef4444;
          --shadow:0 10px 35px rgba(4,210,128,.24), inset 0 0 8px rgba(4,210,128,.12);
          --radius:16px;
        }

        html,body{height:100%}
        body{
          font-family:'Inter',system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
          color:var(--text);
          background:
            radial-gradient(1100px 600px at 15% -10%, rgba(0,255,157,.12), transparent 55%),
            radial-gradient(1000px 500px at 85% 10%, rgba(55,255,209,.10), transparent 55%),
            linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 55%, var(--bg-3) 100%);
        }

        .mist-overlay{position:fixed; inset:0; pointer-events:none;
          background:
            radial-gradient(650px 300px at 20% 15%, rgba(0,255,157,.10), transparent 60%),
            radial-gradient(550px 260px at 80% 20%, rgba(55,255,209,.08), transparent 60%);
          mix-blend-mode:screen; opacity:.8; z-index:0;
        }

        /* Skip link */
        .skip-link{position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden}
        .skip-link:focus{left:1rem;top:1rem;width:auto;height:auto;padding:.5rem .75rem;z-index:50;background:#0f2318;border:1px solid rgba(4,210,128,.35);border-radius:.5rem}

        /* Gradient text */
        .text-gradient{background-image:linear-gradient(145deg,var(--primary),var(--secondary));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
        
        /* Subtle glow effect like cards */
        .text-glow{text-shadow:0 0 8px rgba(4,210,128,.12)}

        /* App bar */
        .appbar{position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.1) blur(10px); background:linear-gradient(180deg, rgba(12,22,17,.75), rgba(12,22,17,.35)); border-bottom:1px solid var(--chip-stroke)}

        /* Cards */
        .card{background: linear-gradient(145deg,var(--card-from),var(--card-to)); border:1px solid var(--chip-stroke); box-shadow: var(--shadow); transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; border-radius: var(--radius)}
        .card:hover{ transform:translateY(-2px); box-shadow:0 12px 38px rgba(4,210,128,.34), inset 0 0 12px rgba(4,210,128,.18) }

        /* Inputs */
        .input{background: rgba(10,30,18,.6); border:1px solid rgba(255,255,255,.06); color:var(--text); transition:border-color .2s ease, box-shadow .2s ease, background-color .2s ease; border-radius:12px}
        .input::placeholder{ color:var(--muted) }
        .input:focus{ outline:0; border-color:var(--secondary); box-shadow:0 0 0 4px rgba(4,210,128,.20), 0 0 10px var(--ring); background:rgba(10,30,18,.72) }
        .input[aria-invalid="true"]{ border-color:#ef4444 }
        .input[aria-invalid="true"]:focus{ box-shadow:0 0 0 4px rgba(239,68,68,.25) }

        /* Buttons */
        .btn{ background:linear-gradient(145deg,var(--primary),var(--secondary)); color:#0a1e12; font-weight:700; box-shadow:0 0 10px rgba(0,255,157,.5); transition:transform .2s ease, box-shadow .2s ease, filter .2s ease, opacity .2s ease; border-radius:12px }
        .btn:hover{ transform: translateY(-1px) scale(1.02); box-shadow:0 0 22px rgba(0,255,157,.95) }
        .btn:disabled{ opacity:.6; cursor:not-allowed; filter:saturate(.8) }
        .btn-outline{ background:transparent; color:var(--text); border:1px solid var(--chip-stroke); box-shadow:none }
        .btn-outline:hover{ border-color:rgba(4,210,128,.55) }

        /* Icon glow */
        .icon-glow{ filter: drop-shadow(0 0 6px var(--primary)); transition: transform .25s ease }
        .icon-glow:hover{ transform: translateY(-1px) }

        @media (prefers-reduced-motion: reduce){ .card, .btn, .icon-glow{ transition:none } }
      `}</style>

      <div className="min-h-screen flex flex-col items-center">
        <div className="mist-overlay"></div>
        
        {/* Header with Language Selector */}
        <header className="appbar w-full">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-end">
            <LanguageSelector />
          </div>
        </header>

        <a href="#main" className="skip-link">{t.common.backToHome}</a>

        <main id="main" role="main" className="w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero */}
          <section className="text-center">
            <div className="mb-2">
              <img src="/logo_icon.png" alt="SafestNet logo" className="mx-auto w-32 h-32 sm:w-40 sm:h-40 icon-glow" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white text-glow">{t.home.title}</h1>
            <p className="mt-2 text-base sm:text-lg text-white text-glow">{t.home.subtitle}</p>
          </section>

          {/* Mode Navigation */}
          <section className="flex justify-center">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-[rgba(10,30,18,.6)] border border-[rgba(4,210,128,.22)]">
              <button 
                onClick={() => setActiveMode('url')}
                className={getModeButtonClass('url')}
              >
                {t.navigation.urlScanner}
              </button>
              <button
                onClick={() => setActiveMode('fact-check')}
                className={getModeButtonClass('fact-check')}
              >
                {t.navigation.factChecker}
              </button>
              <button
                onClick={() => setActiveMode('data-check')}
                className={getModeButtonClass('data-check')}
              >
                {t.navigation.dataChecker}
              </button>
              <button
                onClick={() => setActiveMode('fraud-detector')}
                className={getModeButtonClass('fraud-detector')}
              >
                {t.navigation.fraudDetector}
              </button>
            </div>
          </section>

          {/* URL Scanner Mode */}
          {activeMode === 'url' && (
            <section aria-labelledby="analyze-title" className="card p-6 sm:p-8">
              <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
                <h2 id="analyze-title" className="text-2xl font-bold">{t.analysis.urlScanner.title}</h2>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{background:'var(--chip-bg)', color:'var(--text-sub)', border:'1px solid var(--chip-stroke)'}}>{t.home.urlScannerBeta}</span>
            </div>

              <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1">
                    <label htmlFor="url" className="block text-sm font-semibold mb-1">URL</label>
                    <input
                      id="url"
                      type="url"
                      inputMode="url"
                      autoComplete="url"
                      placeholder={t.home.urlPlaceholder}
                      className={`input w-full px-4 py-3 ${urlError ? 'border-red-400' : ''}`}
                      aria-describedby="url-help url-error"
                      aria-invalid={!!urlError}
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={handleUrlBlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') clearError();
                      }}
                    />
                    <p id="url-help" className="mt-1 text-xs text-[color:var(--muted)]">{t.home.urlHelp}</p>
                    {urlError && <p id="url-error" className="mt-1 text-xs text-red-400">{urlError}</p>}
                </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn w-full sm:w-auto px-6 py-3 inline-flex items-center justify-center gap-2"
                    >
                      {loading && (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"></path>
                  </svg>
                      )}
                      <span>{loading ? t.common.loading : t.home.analyzeButton}</span>
                    </button>
                  </div>
                </div>
                {status && <p role="status" aria-live="polite" className="text-sm text-[color:var(--text-sub)]">{status}</p>}
              </form>
            </section>
          )}

          {/* Fact Check Mode */}
          {activeMode === 'fact-check' && (
            <section className="card p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                  {t.home.comingSoonBanner}
                </div>
              </div>
              <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold">{t.home.factCheckTitle}</h2>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{background:'var(--chip-bg)', color:'var(--text-sub)', border:'1px solid var(--chip-stroke)'}}>{t.home.beta}</span>
              </div>
              <form onSubmit={handleFactSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fact-text" className="block text-sm font-semibold mb-2">{t.home.factDescription}</label>
                  <textarea 
                    id="fact-text" 
                    value={factText} 
                    onChange={(e) => setFactText(e.target.value)} 
                    placeholder={t.home.factCheckPlaceholder}
                    className="input w-full px-4 py-3 h-32 resize-none" 
                    required 
                  />
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{t.home.factDescriptionHelp}</p>
                </div>
                <div>
                  <label htmlFor="fact-image" className="block text-sm font-semibold mb-2">{t.home.factImage}</label>
                  <input id="fact-image" type="file" accept="image/*" onChange={handleFactImageChange} className="input w-full px-4 py-3" />
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{t.home.factImageHelp}</p>
                </div>
                {factImagePreview && (
                  <div className="border border-[color:var(--chip-stroke)] rounded-lg p-4 bg-[rgba(10,30,18,.35)]">
                    <p className="text-sm font-medium mb-2">{t.home.imagePreview}</p>
                    <img src={factImagePreview} alt="Preview" className="max-w-full h-auto max-h-48 rounded" />
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={handleComingSoonClick}
                  className="btn w-full px-6 py-3 inline-flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
                >
                  <span>{t.home.comingSoonButton}</span>
                </button>
                {status && <p role="status" aria-live="polite" className="text-sm text-[color:var(--text-sub)]">{status}</p>}
              </form>
            </section>
          )}

          {/* Data Check Mode */}
          {activeMode === 'data-check' && (
            <section className="card p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                  {t.home.comingSoonBanner}
                </div>
              </div>
              <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold">{t.home.dataSearch}</h2>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{background:'var(--chip-bg)', color:'var(--text-sub)', border:'1px solid var(--chip-stroke)'}}>{t.home.beta}</span>
              </div>
              <form onSubmit={handleDataSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold mb-2">{t.analysis.dataChecker.phoneLabel}</label>
                    <input id="phone" name="phone" type="tel" value={dataForm.phone} onChange={handleDataInputChange} placeholder={t.home.phonePlaceholder} className="input w-full px-4 py-3" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2">{t.analysis.dataChecker.emailLabel}</label>
                    <input id="email" name="email" type="email" value={dataForm.email} onChange={handleDataInputChange} placeholder={t.home.emailPlaceholder} className="input w-full px-4 py-3" />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2">{t.analysis.dataChecker.nameLabel}</label>
                    <input id="name" name="name" type="text" value={dataForm.name} onChange={handleDataInputChange} placeholder={t.home.namePlaceholder} className="input w-full px-4 py-3" />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold mb-2">{t.analysis.dataChecker.companyLabel}</label>
                    <input id="company" name="company" type="text" value={dataForm.company} onChange={handleDataInputChange} placeholder={t.home.companyPlaceholder} className="input w-full px-4 py-3" />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold mb-2">{t.analysis.dataChecker.addressLabel}</label>
                    <input id="address" name="address" type="text" value={dataForm.address} onChange={handleDataInputChange} placeholder={t.home.addressPlaceholder} className="input w-full px-4 py-3" />
                  </div>
                  <div>
                    <label htmlFor="socialMedia" className="block text-sm font-semibold mb-2">{t.analysis.dataChecker.socialMediaLabel}</label>
                    <input id="socialMedia" name="socialMedia" type="text" value={dataForm.socialMedia} onChange={handleDataInputChange} placeholder={t.home.socialMediaPlaceholder} className="input w-full px-4 py-3" />
                  </div>
                </div>
                <div className="bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)] rounded-lg p-4">
                  <p className="text-sm text-[color:var(--text-sub)]">{t.home.dataSearchHelp}</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleComingSoonClick}
                  className="btn w-full px-6 py-3 inline-flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
                >
                  <span>{t.home.comingSoonButton}</span>
                </button>
                {status && <p role="status" aria-live="polite" className="text-sm text-[color:var(--text-sub)]">{status}</p>}
              </form>
            </section>
          )}

          {/* Fraud Detector Mode */}
          {activeMode === 'fraud-detector' && (
            <section className="card p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                  {t.home.comingSoonBanner}
                </div>
              </div>
              <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold">{t.home.fraudAnalysis}</h2>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{background:'var(--chip-bg)', color:'var(--text-sub)', border:'1px solid var(--chip-stroke)'}}>{t.home.beta}</span>
              </div>
              <form onSubmit={handleFraudSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fraud-text" className="block text-sm font-semibold mb-2">{t.home.situationDescription}</label>
                  <textarea 
                    id="fraud-text" 
                    value={fraudText} 
                    onChange={(e) => setFraudText(e.target.value)} 
                    placeholder={t.home.fraudDetectorPlaceholder}
                    className="input w-full px-4 py-3 h-40 resize-none" 
                    required 
                  />
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{t.home.situationDescriptionHelp}</p>
                </div>
                <div>
                  <label htmlFor="fraud-images" className="block text-sm font-semibold mb-2">{t.home.factImage}</label>
                  <input id="fraud-images" type="file" accept="image/*" multiple onChange={handleFraudImageChange} className="input w-full px-4 py-3" />
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{t.home.factImageHelp}</p>
                </div>
                {fraudImagePreviews.length > 0 && (
                  <div className="border border-[color:var(--chip-stroke)] rounded-lg p-4 bg-[rgba(10,30,18,.35)]">
                    <p className="text-sm font-medium mb-3">{t.home.imagePreview}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {fraudImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded" />
                          <button type="button" onClick={() => removeFraudImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)] rounded-lg p-4">
                                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.fraudAnalysisHelp}</p>
        </div>
                <button 
                  type="button" 
                  onClick={handleComingSoonClick}
                  className="btn w-full px-6 py-3 inline-flex items-center justify-center gap-2 opacity-75 cursor-not-allowed"
                >
                  <span>{t.home.comingSoonButton}</span>
                </button>
                {status && <p role="status" aria-live="polite" className="text-sm text-[color:var(--text-sub)]">{status}</p>}
            </form>
            </section>
          )}

          {/* What we check */}
          <section id="features" aria-labelledby="features-title" className="card p-6 sm:p-8">
            <h2 id="features-title" className="text-2xl font-bold mb-4">
              {activeMode === 'url' ? t.home.urlScannerWhatWeCheck : t.home.whatWeCheck}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeMode === 'url' && (
                <>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.domainReputation}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.domainReputationDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.tlsSsl}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.tlsSslDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2 12s2-2 5-2 5 2 5 2 2-2 5-2 5 2 5 2"/><path d="M10 20s2-2 5-2 5 2 5 2"/><path d="M4 14s2-2 5-2 5 2 5 2"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.contentRisks}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.contentRisksDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.databaseMatching}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.databaseMatchingDesc}</p>
                    </div>
                  </li>
                </>
              )}
              {activeMode === 'fact-check' && (
                <>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.factCheckFeatures.truthfulnessRating}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.factCheckFeatures.truthfulnessRatingDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.factCheckFeatures.sourcesQuotes}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.factCheckFeatures.sourcesQuotesDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.factCheckFeatures.contextChronology}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.factCheckFeatures.contextChronologyDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.factCheckFeatures.manipulationDetection}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.factCheckFeatures.manipulationDetectionDesc}</p>
                    </div>
                  </li>
                </>
              )}
              {activeMode === 'data-check' && (
                <>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.dataCheckFeatures.contactsCheck}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.dataCheckFeatures.contactsCheckDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.dataCheckFeatures.personsProfiles}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.dataCheckFeatures.personsProfilesDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.dataCheckFeatures.companiesOrganizations}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.dataCheckFeatures.companiesOrganizationsDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.dataCheckFeatures.relatedEntities}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.dataCheckFeatures.relatedEntitiesDesc}</p>
                    </div>
                  </li>
                </>
              )}
              {activeMode === 'fraud-detector' && (
                <>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.fraudDetectorFeatures.phishingSignals}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.fraudDetectorFeatures.phishingSignalsDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.fraudDetectorFeatures.financialRisks}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.fraudDetectorFeatures.financialRisksDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.fraudDetectorFeatures.requisitesCheck}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.fraudDetectorFeatures.requisitesCheckDesc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0 icon-glow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    <div>
                      <p className="font-semibold">{t.home.fraudDetectorFeatures.practicalSteps}</p>
                      <p className="text-sm text-[color:var(--text-sub)]">{t.home.fraudDetectorFeatures.practicalStepsDesc}</p>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="text-center px-4">
                          <p className="text-xs sm:text-sm italic text-[color:var(--text-sub)] opacity-80">{t.home.resultsDisclaimer}</p>
          </section>
      </main>

        <footer role="contentinfo" className="w-full mt-6 py-6 text-center text-[color:var(--text-sub)] text-sm opacity-70 border-t border-[color:var(--chip-stroke)]">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <button className="btn px-3 py-1 text-xs" onClick={() => router.push('/donate')}>
                {t.home.thankYouButton}
              </button>
              <button className="btn px-3 py-1 text-xs" onClick={() => router.push('/report')}>
                {t.home.sendReport}
              </button>
            </div>
            <small>&copy; {new Date().getFullYear()} SafestNet v.1.0</small>
          </div>
      </footer>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{background: 'var(--bg)'}}>
          <div className="bg-black border border-[color:var(--chip-stroke)] rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t.home.comingSoonModalTitle}</h3>
              <p className="text-[color:var(--text-sub)] mb-6">{t.home.comingSoonModalMessage}</p>
              <button 
                onClick={() => setShowComingSoonModal(false)}
                className="btn px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
              >
                {t.home.comingSoonModalButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}