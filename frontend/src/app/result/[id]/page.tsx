'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
interface AnalysisResult {
  id: string;
  scamRate: number;
  category: string;
  confidence: number;
  summary: string;
  explanation: {
    factors: Array<{
      name: string;
      value: number;
      weightPct: number;
      evidence: string;
      description?: string;
    }>;
    sources: Array<{
      name: string;
      status: string;
      description?: string;
    }>;
    recommendations: string[];
    riskFactors?: string[];
    explanation?: string;
    detailedReports?: Array<{
      code?: string;
      title?: string;
      description?: string;
      evidence?: string;
      sources?: string[];
    }>;
    ioc?: {
      urls: string[];
      domains: string[];
      emails: string[];
      phones: string[];
      ips: string[];
      crypto_wallets: string[];
      messengers: string[];
      brands: string[];
      money: string[];
      qr_links: string[];
    };
    imageFindings?: Array<{
      src: string;
      ocr_brief: string;
      visual_anomalies: string[];
      inferred_urls: string[];
    }>;
    suggestedActions?: string[];
    needMoreEvidence?: boolean;
    missingArtifacts?: string[];
    inputSummary?: string;
  };
  url: string;
  createdAt: string;
  isMultimodal?: boolean;
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [showFeedbackInvite, setShowFeedbackInvite] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const sendFeedback = async (verdict: 'correct' | 'incorrect') => {
    try {
      const response = await fetch(`/api/public/analyze/${params.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verdict })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data?.limit) {
          setFeedbackStatus('');
          setShowFeedbackInvite(false);
          // Show inline modal styled like Coming Soon
          setShowLimitModal(true);
          return;
        }
        setFeedbackStatus(t.results.thankYouFeedback);
        // If user says "No", only show invite; DO NOT create report automatically
        if (verdict === 'incorrect') {
          setShowFeedbackInvite(true);
        } else {
          setShowFeedbackInvite(false);
        }
      } else {
        setFeedbackStatus(t.results.feedbackError);
        setShowFeedbackInvite(false);
      }
    } catch (err) {
      setFeedbackStatus(t.results.networkError);
      setShowFeedbackInvite(false);
    }
  };

  useEffect(() => {
    // track visit for result page
    if (params?.id) {
      fetch('/api/public/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: `/result/${params.id}` }) }).catch(()=>{});
    }

    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/public/analyze/${params.id}`);

        if (!response.ok) {
          throw new Error(t.results.resultNotFound);
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error('Error fetching result:', err);
        setError(t.common.error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--primary)] mx-auto mb-4"></div>
          <p className="text-[color:var(--text-sub)]">{t.results.loadingResults}</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">{t.results.errorTitle}</h2>
          <p className="text-[color:var(--text-sub)] mb-6">
            {error || t.results.resultNotFound}
          </p>
          <button 
            onClick={() => router.push('/')}
            className="btn px-4 py-2 rounded-lg text-sm"
          >
            {t.common.backToHome}
          </button>
        </div>
      </div>
    );
  }

  const riskColor = (pct: number) => pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#22e179';
  const scamRate = result.scamRate;
  const securityScore = 100 - scamRate;
  
  // Трёхуровневая палитра для Low/Medium/High
  const levelPrimary = securityScore <= 33 ? '#ef4444' : securityScore <= 66 ? '#f59e0b' : '#00ff9d';
  const levelBorder = securityScore <= 33 ? 'rgba(239,68,68,.26)' : securityScore <= 66 ? 'rgba(245,158,11,.26)' : 'rgba(4,210,128,.26)';
  const levelBg12 = securityScore <= 33 ? 'rgba(239,68,68,.12)' : securityScore <= 66 ? 'rgba(245,158,11,.12)' : 'rgba(4,210,128,.12)';
  const levelGlow = securityScore <= 33 ? 'rgba(239,68,68,.15)' : securityScore <= 66 ? 'rgba(245,158,11,.15)' : 'rgba(0,255,157,.15)';
  const levelBokeh20 = securityScore <= 33 ? 'rgba(239,68,68,.20)' : securityScore <= 66 ? 'rgba(245,158,11,.20)' : 'rgba(0,255,157,.20)';
  const trustColor = securityScore <= 33 ? '#ef4444' : securityScore <= 66 ? '#f59e0b' : '#22e179';

  const prettyName = (raw: string | undefined) => {
    const s = (raw || t.results.check).replaceAll('_', ' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const extractUrls = (text?: string): string[] => {
    if (!text) return [];
    const m = text.match(/https?:\/\/[^\s)]+/gi) || [];
    return Array.from(new Set(m));
  };
  const firstSentence = (text?: string) => {
    if (!text) return '';
    const s = text.split(/[.!?]/)[0]?.trim();
    return s || '';
  };
  const snippetFromText = (text?: string) => {
    if (!text) return '';
    const m = text.match(/\d+[\s\u00A0]*(дней|дня|лет|года|год|months?|years?|days?)/i);
    return m ? m[0] : '';
  };
  
  // Функция для перевода текста вердиктов
  const translateVerdict = (text?: string) => {
    if (!text) return '';
    
    let translated = text;
    
    // Переводим основные термины (используем регулярные выражения с границами слов)
    translated = translated.replace(/\bдвижков\b/gi, t.results.engines);
    translated = translated.replace(/\bengines?\b/gi, t.results.engines);
    translated = translated.replace(/\bdzinēju\b/gi, t.results.engines);
    
    translated = translated.replace(/\bугроз\b/gi, t.results.threats);
    translated = translated.replace(/\bthreats?\b/gi, t.results.threats);
    translated = translated.replace(/\bapdraudējumu\b/gi, t.results.threats);
    
    translated = translated.replace(/\bобнаружений\b/gi, t.results.detections);
    translated = translated.replace(/\bdetections?\b/gi, t.results.detections);
    translated = translated.replace(/\batklājumu\b/gi, t.results.detections);
    
    translated = translated.replace(/\bисточников\b/gi, t.results.verdictSources);
    translated = translated.replace(/\bsources?\b/gi, t.results.verdictSources);
    translated = translated.replace(/\bavotu\b/gi, t.results.verdictSources);
    
    translated = translated.replace(/\bдней\b/gi, t.results.days);
    translated = translated.replace(/\bdays?\b/gi, t.results.days);
    translated = translated.replace(/\bdienu\b/gi, t.results.days);
    
    translated = translated.replace(/\bлет\b/gi, t.results.years);
    translated = translated.replace(/\byears?\b/gi, t.results.years);
    translated = translated.replace(/\bgadu\b/gi, t.results.years);
    
    translated = translated.replace(/\bмесяцев\b/gi, t.results.months);
    translated = translated.replace(/\bmonths?\b/gi, t.results.months);
    translated = translated.replace(/\bmēnešu\b/gi, t.results.months);
    
    // Дополнительные переводы для часто встречающихся фраз
    translated = translated.replace(/\bне найдено\b/gi, t.results.notFound);
    translated = translated.replace(/\bнайдено\b/gi, t.results.found);
    translated = translated.replace(/\bобнаружено\b/gi, t.results.detected);
    translated = translated.replace(/\bnot found\b/gi, t.results.notFound);
    translated = translated.replace(/\bfound\b/gi, t.results.found);
    translated = translated.replace(/\bdetected\b/gi, t.results.detected);
    translated = translated.replace(/\bnav atrasts\b/gi, t.results.notFound);
    translated = translated.replace(/\batrasts\b/gi, t.results.found);
    translated = translated.replace(/\batklāts\b/gi, t.results.detected);
    
    // SSL переводы
    translated = translated.replace(/\bSSL отсутствует\/недействителен\b/gi, `${t.results.sslMissing}/${t.results.sslInvalid}`);
    translated = translated.replace(/\bSSL отсутствует\b/gi, t.results.sslMissing);
    translated = translated.replace(/\bSSL недействителен\b/gi, t.results.sslInvalid);
    translated = translated.replace(/\bSSL missing\/invalid\b/gi, `${t.results.sslMissing}/${t.results.sslInvalid}`);
    translated = translated.replace(/\bSSL missing\b/gi, t.results.sslMissing);
    translated = translated.replace(/\bSSL invalid\b/gi, t.results.sslInvalid);
    translated = translated.replace(/\bSSL trūkst\/nederīgs\b/gi, `${t.results.sslMissing}/${t.results.sslInvalid}`);
    translated = translated.replace(/\bSSL trūkst\b/gi, t.results.sslMissing);
    translated = translated.replace(/\bSSL nederīgs\b/gi, t.results.sslInvalid);
    
    return translated;
  };
  
  // ИИ отчёты
  const aiReports = Array.isArray(result.explanation.detailedReports) ? result.explanation.detailedReports : [];
  const norm = (s?: string) => (s || '').toLowerCase().replace(/\s+/g,'_');
  const aliases: Record<string,string[]> = {
    ssl_valid: ['ssl','tls_ssl','ssl_certificate'],
    gsb: ['google_safe_browsing','safe_browsing'],
    virustotal: ['virus_total','vt'],
    content_quality: ['content','content_analysis'],
    forms_present: ['forms','forms_presence'],
    suspicious_patterns: ['suspicious','patterns'],
    wayback_history: ['wayback','archive'],
    dns_email_auth: ['spf','dmarc','dns'],
    brand_impersonation: ['brand','impersonation'],
    suspicious_domain: ['domain_suspicious','tld'],
    tracking_params: ['tracking','utm'],
    suspicious_registrar: ['registrar']
  };
  const whatWeCheckText = (code: string) => {
    const m: Record<string,string> = {
      domain_age: t.results.domainAgeCheck,
      ssl_valid: t.results.sslValidCheck,
      gsb: t.results.gsbCheck,
      virustotal: t.results.virusTotalCheck,
      forms_present: t.results.formsCheck,
      content_quality: t.results.contentQualityCheck,
      suspicious_patterns: t.results.suspiciousPatternsCheck,
      wayback_history: t.results.waybackHistoryCheck,
      dns_email_auth: t.results.dnsEmailAuthCheck,
      brand_impersonation: t.results.brandImpersonationCheck,
      suspicious_domain: t.results.suspiciousDomainCheck,
      tracking_params: t.results.trackingParamsCheck,
      suspicious_registrar: t.results.suspiciousRegistrarCheck
    };
    return m[code] || t.results.genericSecurityCheck;
  };
  const findReportForFactor = (factorCode: string) => {
    const code = norm(factorCode);
    const direct = aiReports.find(r => norm(r.code) === code);
    if (direct) return direct;
    const al = new Set([code, ...(aliases[factorCode as keyof typeof aliases] || []).map(norm)]);
    return aiReports.find(r => al.has(norm(r.code)));
  };
  const usedReportCodes = new Set<string>();
  const getDomainFromUrl = (u?: string) => {
    try { return new URL(u || '').hostname; } catch { return ''; }
  };
  const getDefaultProofLink = (code: string, domain: string, pageUrl: string) => {
    const map: Record<string, (d:string,u:string)=>string> = {
      domain_age: (d)=>`https://who.is/whois/${d}`,
      ssl_valid: (d)=>`https://www.ssllabs.com/ssltest/analyze?d=${d}`,
      gsb: (_d,u)=>`https://transparencyreport.google.com/safe-browsing/search?url=${encodeURIComponent(u)}`,
      virustotal: (_d,u)=>`https://www.virustotal.com/gui/url/${encodeURIComponent(u)}`,
      wayback_history: (_d,u)=>`https://web.archive.org/web/*/${encodeURIComponent(u)}`,
      dns_email_auth: (d)=>`https://mxtoolbox.com/SuperTool.aspx?action=mx%3a${d}`
    };
    const fn = map[code as keyof typeof map];
    return fn ? fn(domain, pageUrl) : '';
  };
  const parseDays = (s?: string) => {
    if (!s) return undefined;
    const m = s.match(/(\d{1,6})/);
    return m ? Number(m[1]) : undefined;
  };
  const buildDetailText = (code: string, evidence?: string, repDesc?: string) => {
    if (code === 'domain_age') {
      const days = parseDays(evidence) || parseDays(repDesc);
      if (days !== undefined) {
        const qual = days >= 365 ? t.results.domainAgeOld : t.results.domainAgeNew;
        return t.results.domainAgeDetails.replace('{days}', days.toString()).replace('{quality}', qual);
      }
      return t.results.domainAgeCheck;
    }
    return whatWeCheckText(code);
  };
 
  return (
    <>
      <style jsx global>{`
        :root{
          --bg-0:#060c09;
          --bg-1:#0b0f0c; --bg-2:#0a1e12; --bg-3:#092c1b;
          --primary:#00ff9d;
          --secondary:#04d280;
          --accent:#37ffd1;
          --text:#f0f5f2; --text-sub:#d9e2de; --muted:#9fb6ad;
          --stroke:rgba(56,255,189,.22);
          --ring: rgba(4,210,128,.60);
          --card-from:#0e1914; --card-to:#0b1511;
          --chip-bg:rgba(4,210,128,.12);
          --chip-stroke:rgba(4,210,128,.26);
          --danger:#ef4444; --warn:#f59e0b; --ok:#22e179;
          --shadow:0 10px 35px rgba(4,210,128,.24), inset 0 0 8px rgba(4,210,128,.12);
          --radius: 16px;
        }

        body{
          background:
            radial-gradient(1100px 600px at 15% -10%, rgba(0,255,157,.12), transparent 55%),
            radial-gradient(1000px 500px at 85% 10%, rgba(55,255,209,.10), transparent 55%),
            linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 55%, var(--bg-3) 100%);
        }

        .mist-overlay{
          position:fixed; inset:0; pointer-events:none;
          background:
            radial-gradient(650px 300px at 20% 15%, rgba(0,255,157,.10), transparent 60%),
            radial-gradient(550px 260px at 80% 20%, rgba(55,255,209,.08), transparent 60%);
          mix-blend-mode:screen; opacity:.8; z-index:0;
        }

        .appbar{
          position:sticky; top:0; z-index:20; backdrop-filter:saturate(1.1) blur(10px); 
          background:linear-gradient(180deg, rgba(12,22,17,.75), rgba(12,22,17,.35)); 
          border-bottom:1px solid var(--chip-stroke)
        }

        .card{
          background:linear-gradient(145deg,var(--card-from),var(--card-to)); 
          border:1px solid var(--chip-stroke); 
          box-shadow:var(--shadow); 
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; 
          border-radius: var(--radius)
        }
        .card:hover{ 
          transform:translateY(-2px); 
          box-shadow:0 12px 38px rgba(4,210,128,.34), inset 0 0 12px rgba(4,210,128,.18) 
        }

        .btn{
          background:linear-gradient(145deg,var(--primary),var(--secondary)); 
          color:#0a1e12; font-weight:700; 
          box-shadow:0 0 10px rgba(0,255,157,.5); 
          transition:transform .2s ease, box-shadow .2s ease, filter .2s ease, opacity .2s ease; 
          border-radius:12px
        }
        .btn:hover{ 
          transform: translateY(-1px) scale(1.02); 
          box-shadow:0 0 22px rgba(0,255,157,.95) 
        }
        .btn:disabled{ opacity:.6; cursor:not-allowed; filter:saturate(.8) }

        .chip{
          background:var(--chip-bg); 
          border:1px solid var(--chip-stroke); 
          color:var(--text-sub); 
          border-radius:9999px; 
          padding:.35rem .7rem; 
          font-weight:600; 
          font-size:.75rem
        }

        .icon-glow{ 
          filter: drop-shadow(0 0 6px var(--primary)); 
          transition: transform .25s ease 
        }
        .icon-glow:hover{ transform: translateY(-1px) }

        .bar{
          height:8px; 
          border-radius:9999px; 
          background:#22332b
        }
        .bar > span{
          display:block; 
          height:100%; 
          border-radius:inherit
        }

        .gauge{ 
          width:160px; 
          aspect-ratio:1; 
          border-radius:50%;
          background:conic-gradient(var(--gauge-color, var(--ok)) var(--p,0), #1a2a22 0);
          mask:radial-gradient(farthest-side, #0000 68%, #000 69%);
          box-shadow: inset 0 0 0 1px var(--chip-stroke), 0 0 24px rgba(0,255,157,.15);
        }
        .gauge-inner{
          position:absolute; 
          inset:0; 
          display:grid; 
          place-items:center
        }

        .text-gradient{
          background-image:linear-gradient(145deg,var(--primary),var(--secondary));
          -webkit-background-clip:text;
          background-clip:text;
          -webkit-text-fill-color:transparent
        }
      `}</style>

      <div className="min-h-screen flex flex-col items-center">
        <div className="mist-overlay"></div>
        <a href="#main" className="skip-link">{t.results.mainContent}</a>

        {/* App Bar (match donate/report) */}
        <header className="appbar w-full">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
            <button onClick={() => router.back()} className="text-sm text-[color:var(--text-sub)] hover:opacity-80">← {t.common.backToHome}</button>
            <span className="text-sm text-[color:var(--text-sub)]">SafestNet</span>
          </div>
        </header>

        <main id="main" role="main" className="w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero / Overview Card */}
          <section className="card p-6 sm:p-8 relative overflow-hidden" style={{
            borderColor: levelBorder,
            // внешний неон оставляем зелёным; внутренний блик — по уровню
            boxShadow: `0 10px 35px rgba(4,210,128,.24), inset 0 0 8px ${levelBg12}`
          }}>
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{background: `radial-gradient(circle at 30% 30%, ${levelBokeh20}, transparent 55%)`}}></div>
            <div className="flex flex-col lg:flex-row items-stretch gap-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.results.securityIndex}</h1>
                <p className="mt-2 text-sm text-[color:var(--text-sub)] break-all">
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {result.url}
                  </a>
                </p>
                <p className="mt-3 text-[color:var(--text-sub)]">{result.summary}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className="chip"
                    style={{
                      background:
                        result.confidence <= 33
                          ? 'rgba(239,68,68,.12)'
                          : result.confidence <= 66
                          ? 'rgba(245,158,11,.12)'
                          : 'rgba(34,225,121,.12)',
                      borderColor:
                        result.confidence <= 33
                          ? 'rgba(239,68,68,.26)'
                          : result.confidence <= 66
                          ? 'rgba(245,158,11,.26)'
                          : 'rgba(34,225,121,.26)'
                    }}
                  >
                    {t.results.confidence}: {result.confidence}%
                  </span>
                  <span
                    className="chip"
                    style={{
                      background:
                        securityScore <= 33
                          ? 'rgba(239,68,68,.12)'
                          : securityScore <= 66
                          ? 'rgba(245,158,11,.12)'
                          : 'rgba(34,225,121,.12)',
                      borderColor:
                        securityScore <= 33
                          ? 'rgba(239,68,68,.26)'
                          : securityScore <= 66
                          ? 'rgba(245,158,11,.26)'
                          : 'rgba(34,225,121,.26)'
                    }}
                  >
                    {securityScore <= 33
                      ? t.results.lowTrust
                      : securityScore <= 66
                      ? t.results.mediumTrust
                      : t.results.highTrust}
              </span>
            </div>

                <div className="mt-6 max-w-xl">
              <div className="bar" style={{background: securityScore <= 33 ? 'rgba(239,68,68,.18)' : securityScore <= 66 ? 'rgba(245,158,11,.18)' : '#22332b'}}>
                <span 
                  style={{ 
                        width: `${securityScore}%`,
                        background: trustColor
                  }}
                ></span>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-[color:var(--muted)]">
                <span>{t.results.lowTrustLabel}</span><span>{t.results.highTrustLabel}</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-[240px] grid place-items-center">
                <div className="relative">
                  <div 
                    className="gauge" 
                    style={{
                      '--p': `${securityScore}%`,
                      '--gauge-color': trustColor,
                      boxShadow: `inset 0 0 0 1px ${levelBorder}, 0 0 24px ${levelGlow}`
                    } as React.CSSProperties}
                  ></div>
                  <div className="gauge-inner">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold" style={{color: levelPrimary}}>{securityScore}</div>
                      <div className="text-xs text-[color:var(--text-sub)] mt-1">{t.results.outOf} 100</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.explanation.recommendations && result.explanation.recommendations.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-3">{t.results.recommendations}</h2>
                <ul className="list-disc pl-5 space-y-1 text-[color:var(--text-sub)]">
                  {result.explanation.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Details grid (bento) */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Что мы проверили? */}
            <div className="card p-6 sm:p-7 lg:col-span-2" aria-labelledby="details-title">
              <h2 id="details-title" className="text-2xl font-bold mb-4">{t.results.whatWeChecked}</h2>
              <div className="space-y-4">
                {result.explanation.factors.map((factor, index) => {
                const value = Number(factor.value ?? 0);
                const valuePct = Math.round(Math.max(0, Math.min(1, value)) * 100);
                const level = valuePct <= 33 ? 'low' : valuePct <= 66 ? 'medium' : 'high';
                const securityColor = level === 'low' ? '#22e179' : level === 'medium' ? '#f59e0b' : '#ef4444';
                const chipBg = level === 'low' ? 'rgba(34,225,121,.12)' : level === 'medium' ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.12)';
                const chipBorder = level === 'low' ? 'rgba(34,225,121,.26)' : level === 'medium' ? 'rgba(245,158,11,.26)' : 'rgba(239,68,68,.26)';
                const title = `${prettyName(factor.name)}${snippetFromText(factor.description) ? `: ${snippetFromText(factor.description)}` : ''}`;
                const rep = findReportForFactor(factor.name);
                if (rep && rep.code) usedReportCodes.add(norm(rep.code));
                const urls = Array.from(new Set([
                  ...extractUrls(factor.evidence || factor.description),
                  ...((rep?.sources || []).filter(Boolean))
                ]));
                const domain = getDomainFromUrl(result.url);
                const fallbackLink = getDefaultProofLink(factor.name, domain, result.url);
                if (!urls.length && fallbackLink) urls.push(fallbackLink);
                if (factor.name === 'ssl_valid') {
                  // По запросу: не показывать раздел Источники для SSL
                  urls.length = 0;
                }
 
                return (
                  <div key={index} className="rounded-lg p-4 bg-[rgba(10,30,18,.35)]" style={{border:'1px solid', borderColor: chipBorder}}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <svg className="w-2.5 h-2.5 mt-1 icon-glow" viewBox="0 0 8 8" fill="none" stroke="currentColor">
                          <circle cx="4" cy="4" r="3" fill={securityColor} />
                        </svg>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold break-words">{title || t.results.check}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[color:var(--text-sub)]">
                        {buildDetailText(factor.name, factor.evidence, rep?.description) || t.results.details}
                    </p>

                    <div className="bar mt-3">
                      <span 
                        style={{ 
                          width: `${valuePct}%`,
                          background: securityColor
                        }}
                      ></span>
                    </div>

                    <details className="mt-3 group">
                        <summary className="cursor-pointer text-sm text-[color:var(--text-sub)] list-none">
                          <span className="underline decoration-dotted underline-offset-4 group-open:opacity-70">{t.results.moreDetails}</span>
                        </summary>
                          {(factor.name !== 'domain_age') && (factor.evidence || rep?.evidence) && (
                            <div className="mt-2 text-sm text-[color:var(--text-sub)]">
                              <p className="m-0"><span className="font-medium">{t.results.verdict}:</span> {translateVerdict([factor.evidence, rep?.evidence].filter(Boolean).join(' '))}</p>
                            </div>
                          )}
                        {urls.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">{t.results.sourcesTitle}:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {urls.map((u, i) => (
                                <li key={i}>
                                  <a href={u} target="_blank" rel="noopener noreferrer" className="text-[color:var(--text-sub)] hover:underline break-all">@{u}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {factor.name !== 'suspicious_registrar' && urls.length === 0 && (
                          <div className="mt-2 text-xs text-[color:var(--muted)]">
                            {t.results.missingDataNegativeImpact}
                          </div>
                        )}
                      </details>
                  </div>
                );
                })}
                {/* AI-only reports intentionally hidden to avoid дублирование */}
              </div>
            </div>

            {/* Источники */}
            <div className="card p-6 sm:p-7" id="sources" aria-labelledby="sources-title">
              <h2 id="sources-title" className="text-2xl font-bold mb-4">{t.results.securitySources}</h2>
              <div className="space-y-3">
                  {result.explanation.sources.map((source, index) => (
                    <div key={index} className="p-3 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-medium">{source.name || t.results.sources}</span>
                        <span className="text-sm text-[color:var(--text-sub)]">
                          {String(source.status ?? '')}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[color:var(--text-sub)]">
                        {source.description || t.results.securitySources}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
          </section>

          {/* IOC Data */}
          {result.explanation.ioc && (
            <section className="card p-6 sm:p-7">
              <h2 className="text-2xl font-bold mb-4">{t.results.extractedArtifacts}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.explanation.ioc.urls.length > 0 && (
                  <div className="p-3 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
                    <h4 className="font-medium mb-2">{t.results.urls}</h4>
                    <div className="space-y-1">
                      {result.explanation.ioc.urls.map((url, index) => (
                        <p key={index} className="text-sm text-[color:var(--text-sub)] break-all">{url}</p>
                      ))}
                    </div>
                  </div>
                )}
                {result.explanation.ioc.domains.length > 0 && (
                  <div className="p-3 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
                    <h4 className="font-medium mb-2">{t.results.domains}</h4>
                    <div className="space-y-1">
                      {result.explanation.ioc.domains.map((domain, index) => (
                        <p key={index} className="text-sm text-[color:var(--text-sub)]">{domain}</p>
                      ))}
                    </div>
                  </div>
                )}
                {result.explanation.ioc.emails.length > 0 && (
                  <div className="p-3 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
                    <h4 className="font-medium mb-2">{t.results.emails}</h4>
                    <div className="space-y-1">
                      {result.explanation.ioc.emails.map((email, index) => (
                        <p key={index} className="text-sm text-[color:var(--text-sub)]">{email}</p>
                      ))}
                    </div>
                  </div>
                )}
                {result.explanation.ioc.crypto_wallets.length > 0 && (
                  <div className="p-3 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
                    <h4 className="font-medium mb-2">{t.results.cryptoWallets}</h4>
                    <div className="space-y-1">
                      {result.explanation.ioc.crypto_wallets.map((wallet, index) => (
                        <p key={index} className="text-sm text-[color:var(--text-sub)] break-all">{wallet}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Image Findings */}
          {result.explanation.imageFindings && result.explanation.imageFindings.length > 0 && (
            <section className="card p-6 sm:p-7">
              <h2 className="text-2xl font-bold mb-4">{t.results.imageAnalysis}</h2>
              <div className="space-y-4">
                {result.explanation.imageFindings.map((finding, index) => (
                  <div key={index} className="p-4 rounded-lg bg-[rgba(10,30,18,.35)] border border-[rgba(4,210,128,.22)]">
                    <h4 className="font-medium mb-2">{t.results.image} {index + 1}</h4>
                    <p className="text-sm text-[color:var(--text-sub)] mb-2">{finding.ocr_brief}</p>
                    {finding.visual_anomalies.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium mb-1">{t.results.visualAnomalies}:</p>
                        <ul className="list-disc pl-5 text-sm text-[color:var(--text-sub)]">
                          {finding.visual_anomalies.map((anomaly, idx) => (
                            <li key={idx}>{anomaly}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {finding.inferred_urls.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">{t.results.detectedUrls}:</p>
                        <div className="space-y-1">
                          {finding.inferred_urls.map((url, idx) => (
                            <p key={idx} className="text-sm text-[color:var(--text-sub)] break-all">{url}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            )}

            {/* Feedback */}
          <section className="card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{t.results.feedbackTitle}</h2>
                <p className="text-sm text-[color:var(--text-sub)]">{t.results.feedbackSubtitle}</p>
              </div>
              <div className="flex gap-3">
                <button 
                  className="px-3 py-2 rounded-lg border border-[color:var(--chip-stroke)] text-sm hover:border-[rgba(4,210,128,.55)]"
                  onClick={() => sendFeedback('correct')}
                >
                  👍 {t.results.yes}
                </button>
                <button 
                  className="px-3 py-2 rounded-lg border border-[color:var(--chip-stroke)] text-sm hover:border-[rgba(4,210,128,.55)]"
                  onClick={() => sendFeedback('incorrect')}
                >
                  👎 {t.results.no}
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-[color:var(--text-sub)]" role="status" aria-live="polite">
                {feedbackStatus}
              </p>
            {showFeedbackInvite && (
              <div className="mt-3">
                <a href={`/report?analysis=${encodeURIComponent(String(params.id))}`} className="btn px-3 py-2 text-xs inline-flex items-center">{t.home.sendReport}</a>
              </div>
            )}
          </section>


        </main>

        {/* Limit Modal */}
        {showLimitModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{background: 'var(--bg)'}}>
            <div className="bg-black border border-[color:var(--chip-stroke)] rounded-lg p-6 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{t.limitModal.title}</h3>
                <p className="text-[color:var(--text-sub)] mb-6">{t.limitModal.message}</p>
                <button 
                  onClick={() => setShowLimitModal(false)}
                  className="btn px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  {t.limitModal.button}
                </button>
              </div>
            </div>
          </div>
        )}

        <footer role="contentinfo" className="w-full mt-4 py-6 text-center text-[color:var(--text-sub)] text-xs opacity-70 border-t border-[color:var(--chip-stroke)]">
          <small>&copy; {new Date().getFullYear()} SafestNet v.1.0</small>
        </footer>
      </div>
    </>
  );
}

