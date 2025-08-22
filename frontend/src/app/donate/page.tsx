'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

import { useState, useEffect } from 'react';

export default function DonatePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [showCrypto, setShowCrypto] = useState(false);

  useEffect(() => {
    fetch('/api/public/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '/donate' }) }).catch(()=>{});
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <style jsx global>{`
        :root{
          --bg-0:#060c09;
          --bg-1:#0b0f0c; --bg-2:#0a1e12; --bg-3:#092c1b;
          --primary:#00ff9d; --secondary:#04d280; --accent:#37ffd1;
          --text:#f0f5f2; --text-sub:#d9e2de; --muted:#9fb6ad;
          --card-from:#0e1914; --card-to:#0b1511;
          --chip-bg:rgba(4,210,128,.12); --chip-stroke:rgba(4,210,128,.26);
          --ring: rgba(4,210,128,.60);
        }
        body{
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
        .appbar{position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.1) blur(10px); background:linear-gradient(180deg, rgba(12,22,17,.75), rgba(12,22,17,.35)); border-bottom:1px solid var(--chip-stroke)}
        .card{background: linear-gradient(145deg,var(--card-from),var(--card-to)); border:1px solid var(--chip-stroke); box-shadow: 0 10px 35px rgba(4,210,128,.24), inset 0 0 8px rgba(4,210,128,.12); border-radius:16px}
        .btn{ background:linear-gradient(145deg,var(--primary),var(--secondary)); color:#0a1e12; font-weight:700; box-shadow:0 0 10px rgba(0,255,157,.5); transition:transform .2s ease, box-shadow .2s ease; border-radius:12px }
        .btn:hover{ transform: translateY(-1px) scale(1.02); box-shadow:0 0 22px rgba(0,255,157,.95) }
        .btn-outline{ background:transparent; color:var(--text); border:1px solid var(--chip-stroke); box-shadow:none; border-radius:12px }
        .btn-outline:hover{ border-color:rgba(4,210,128,.55) }
      `}</style>
      <div className="mist-overlay"></div>

      <header className="appbar w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          <button onClick={() => router.back()} className="text-sm text-[color:var(--text-sub)] hover:opacity-80">← {t.common.backToHome}</button>
          <span className="text-sm text-[color:var(--text-sub)]">SafestNet</span>
        </div>
      </header>

      <main className="w-full mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="card p-6 sm:p-8">
          <h1 className="text-3xl font-bold mb-2">{t.donate.title}</h1>
          <p className="text-[color:var(--text-sub)] mb-2">{t.donate.subtitle}</p>
          <p className="text-[color:var(--text-sub)] opacity-80 mb-1">{t.donate.nonprofitNote}</p>
          <p className="text-[color:var(--text-sub)] opacity-80 mb-6">{t.donate.redirectNote}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
              <h2 className="font-semibold mb-2">{t.donate.stripeLabel}</h2>
              <a href="https://buy.stripe.com/5kQfZh7tleeWdNOaMibjW00" target="_blank" rel="noopener noreferrer" className="btn px-4 py-2 inline-block text-center w-full">{t.donate.cardButton}</a>
              <div className="mt-3 text-xs text-[color:var(--text-sub)]">
                <p className="mb-2">{t.donate.supportedMethods}</p>
                <div className="flex items-center flex-wrap gap-2 opacity-90">
                  <span className="px-2 py-1 rounded bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">AMEX</span>
                  <span className="px-2 py-1 rounded bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">MASTERCARD</span>
                  <span className="px-2 py-1 rounded bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">VISA</span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
              <h2 className="font-semibold mb-2">{t.donate.cryptoButton}</h2>
              <button onClick={() => setShowCrypto(v => !v)} className="btn px-4 py-2 w-full">{t.donate.cryptoToggleButton}</button>
              <div className="mt-3 text-xs text-[color:var(--text-sub)]">
                <p className="mb-2">{t.donate.supportedMethods}</p>
                <div className="flex items-center flex-wrap gap-2 opacity-90">
                  <span className="px-2 py-1 rounded bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">BTC</span>
                  <span className="px-2 py-1 rounded bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">ETH</span>
                  <span className="px-2 py-1 rounded bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">SOL</span>
                  <span className="px-2 py-1 rounded bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">LTC</span>
                  <span className="px-2 py-1 rounded bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">TRX</span>
                </div>
              </div>
            </div>
          </div>

          {showCrypto && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">{t.donate.cryptoTitle}</h2>
              <div className="space-y-3">
                <WalletRow label="BTC" value="bc1q97c9yn8uuy3ahayh6s2l6fhxdsjghtyzl8rvpu" />
                <WalletRow label="ETH" value="0x1E1584De442Cb267A4Ef461F73c9729D2bAcf283" />
                <WalletRow label="SOL" value="3CpCFGtpkKQdoVPjJcStoYwA1F1PSzozv9F5LUY88sWK" />
                <WalletRow label="LTC" value="ltc1qpv2dme43q9up0mu54nytp56ym2g9jtkuxp9q5g" />
                <WalletRow label="TRX" value="TK2qLNoKPRkJo7xVt5M5CUaTSEvZFiddsk" />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function WalletRow({ label, value }: { label: string; value: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}`;

  return (
    <div className="p-3 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm m-0"><span className="font-medium">{label}</span>: <code className="break-all">{value}</code></p>
        <div className="flex items-center gap-2">
          <button onClick={copy} className="btn-outline px-3 py-1 text-xs">{copied ? t.donate.copied : t.donate.copy}</button>
          <button onClick={() => setShowQr(v => !v)} className="btn-outline px-3 py-1 text-xs">{showQr ? t.donate.hideQr : t.donate.showQr}</button>
        </div>
      </div>
      {showQr && (
        <div className="mt-3">
          <img src={qrUrl} alt={`${label} QR`} className="w-36 h-36" />
        </div>
      )}
    </div>
  );
}


