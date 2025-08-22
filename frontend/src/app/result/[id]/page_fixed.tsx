'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; 

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
    factCheck?: {
      truthfulness: number;
      sources: string[];
      debunked: boolean;
      explanation: string;
    };
    dataCheck?: {
      foundData: string[];
      sources: string[];
      riskLevel: string;
      recommendations: string[];
    };
    fraudDetection?: {
      isScam: boolean;
      confidence: number;
      redFlags: string[];
      greenFlags: string[];
      recommendations: string[];
    };
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
  isFactCheck?: boolean;
  isDataCheck?: boolean;
  isFraudDetector?: boolean;
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');

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
        setFeedbackStatus('Спасибо за отзыв!');
      } else {
        setFeedbackStatus('Не удалось отправить отзыв.');
      }
    } catch (err) {
      setFeedbackStatus('Сетевая ошибка при отправке отзыва.');
    }
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/public/analyze/${params.id}`);

        if (!response.ok) {
          throw new Error('Результат не найден');
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error('Error fetching result:', err);
        setError('Не удалось загрузить результат анализа');
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-white">Загружаем результаты анализа...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Ошибка</h1>
          <p className="text-gray-300 mb-4">{error || 'Результат не найден'}</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  const riskColor = (pct: number) => pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#22e179';
  const scamRate = result.scamRate;
  
  // Определяем тип анализа и соответствующий score
  const isFactCheck = result.isFactCheck;
  const isDataCheck = result.isDataCheck;
  const isFraudDetector = result.isFraudDetector;
  
  // Для fact-check используем scamRate как правдивость (0 = ложь, 100 = правда)
  // Для остальных используем securityScore (100 - scamRate)
  const displayScore = isFactCheck ? scamRate : (100 - scamRate);
  const securityScore = displayScore;

  // Определяем заголовок в зависимости от типа анализа
  const getTitle = () => {
    if (isFactCheck) return 'Правдивость';
    if (isDataCheck) return 'Индекс риска данных';
    if (isFraudDetector) return 'Индекс мошенничества';
    return 'Индекс безопасности и доверия';
  };

  // Определяем описание уровня в зависимости от типа анализа
  const getLevelDescription = () => {
    if (isFactCheck) {
      return securityScore >= 80 ? "Высокая правдивость" : 
             securityScore >= 40 ? "Средняя правдивость" : 
             "Низкая правдивость";
    }
    if (isDataCheck) {
      return securityScore >= 80 ? "Низкий риск" : 
             securityScore >= 40 ? "Средний риск" : 
             "Высокий риск";
    }
    if (isFraudDetector) {
      return securityScore >= 80 ? "Безопасно" : 
             securityScore >= 40 ? "Подозрительно" : 
             "Опасно";
    }
    return securityScore >= 80 ? "Высокий уровень доверия" : 
           securityScore >= 40 ? "Средний уровень доверия" : 
           "Низкий уровень доверия";
  };

  // Определяем подписи для прогресс-бара
  const getProgressLabels = () => {
    if (isFactCheck) {
      return { left: "Полная ложь", right: "Чистая правда" };
    }
    if (isDataCheck) {
      return { left: "Высокий риск", right: "Низкий риск" };
    }
    if (isFraudDetector) {
      return { left: "Опасно", right: "Безопасно" };
    }
    return { left: "Низкий уровень доверия", right: "Высокий уровень доверия" };
  };

  const progressLabels = getProgressLabels();

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
          width:200px; 
          height:200px; 
          border-radius:50%; 
          background:conic-gradient(var(--gauge-color) var(--p), #22332b 0deg); 
          position:relative; 
          display:grid; 
          place-items:center
        }
        .gauge::before{ 
          content:""; 
          width:160px; 
          height:160px; 
          background:var(--bg-2); 
          border-radius:50%
        }
        .gauge-inner{ 
          position:absolute; 
          inset:20px; 
          display:grid; 
          place-items:center
        }
      `}</style>

      <div className="min-h-screen">
        <div className="mist-overlay"></div>
        
        <header className="appbar">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" className="w-7 h-7 icon-glow" fill="none" stroke="var(--primary)" strokeWidth="4" aria-hidden="true">
                <path d="M64 6 122 122 6 122 64 6Z" strokeLinejoin="round"/>
                <circle cx="64" cy="80" r="16"/>
                <path d="M64 64v-8a10 10 0 0 1 20 0v8" />
              </svg>
              <span className="text-sm font-semibold tracking-wide text-gradient">SafestNet</span>
            </div>
            <nav className="hidden sm:flex items-center gap-4 text-xs text-[color:var(--text-sub)]">
              <button onClick={() => router.push('/')} className="hover:opacity-80">Новый анализ</button>
              <span className="opacity-40">•</span>
              <button className="hover:opacity-80">Остальные анализы</button>
              <span className="opacity-40">•</span>
              <button className="hover:opacity-80">Скачать анализ (.pdf)</button>
            </nav>
          </div>
        </header>

        <main id="main" role="main" className="w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero / Overview Card */}
          <section className="card p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{background: 'radial-gradient(circle at 30% 30%, rgba(0,255,157,.20), transparent 55%)'}}></div>
            <div className="flex flex-col lg:flex-row items-stretch gap-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{getTitle()}</h1>
                <p className="mt-3 text-[color:var(--text-sub)]">{result.summary}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className={`chip ${
                    securityScore >= 80 ? "bg-[rgba(34,225,121,.12)] border-[rgba(34,225,121,.26)]" :
                    securityScore >= 40 ? "bg-[rgba(245,158,11,.12)] border-[rgba(245,158,11,.26)]" :
                    "bg-[rgba(239,68,68,.12)] border-[rgba(239,68,68,.26)]"
                  }`}>
                    {getLevelDescription()}
                  </span>
                  <span className="chip">
                    {result.category === 'Low' ? 'Высокий' : 
                     result.category === 'Medium' ? 'Средний' : 
                     result.category === 'High' ? 'Низкий' : result.category}
                  </span>
                  <span className="chip">Уверенность: {result.confidence}%</span>
                </div>

                <div className="mt-6 max-w-xl">
                  <div className="bar">
                    <span 
                      style={{ 
                        width: `${securityScore}%`,
                        background: riskColor(100 - securityScore)
                      }}
                    ></span>
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-[color:var(--muted)]">
                    <span>{progressLabels.left}</span><span>{progressLabels.right}</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-[240px] grid place-items-center">
                <div className="relative">
                  <div 
                    className="gauge" 
                    style={{
                      '--p': `${securityScore}%`,
                      '--gauge-color': riskColor(100 - securityScore)
                    } as React.CSSProperties}
                  ></div>
                  <div className="gauge-inner">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold text-gradient">{securityScore}</div>
                      <div className="text-xs text-[color:var(--text-sub)] mt-1">из 100</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {result.explanation.recommendations && result.explanation.recommendations.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-3">🛡️ Рекомендации</h2>
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
            {/* Факторы риска */}
            <div className="card p-6 sm:p-7 lg:col-span-2" aria-labelledby="details-title">
              <h2 id="details-title" className="text-2xl font-bold mb-4">
                {isFactCheck ? 'Факторы правдивости' : 
                 isDataCheck ? 'Найденная информация' :
                 isFraudDetector ? 'Признаки мошенничества' :
                 'Факторы риска'}
              </h2>
              <div className="space-y-4">
                {result.explanation.factors && result.explanation.factors.length > 0 ? (
                  result.explanation.factors.map((factor, index) => {
                    const value = Number(factor.value ?? 0);
                    const valuePct = Math.round(Math.max(0, Math.min(1, value)) * 100);
                    const securityColor = valuePct <= 20 ? '#22e179' : valuePct <= 60 ? '#f59e0b' : '#ef4444';

                    return (
                      <div key={index} className="border border-[rgba(4,210,128,.22)] rounded-lg p-4 bg-[rgba(10,30,18,.35)]">
                        <div className="flex items-start sm:items-center justify-between gap-3 mb-2">
                          <div className="flex items-start gap-2">
                            <svg className="w-2.5 h-2.5 mt-1 icon-glow" viewBox="0 0 8 8" fill="none" stroke="currentColor">
                              <circle cx="4" cy="4" r="3" fill="currentColor" />
                            </svg>
                            <div className="flex flex-col">
                              <span className="font-semibold">{(factor.name || '').replaceAll('_', ' ')}</span>
                              <span className="text-xs text-[color:var(--muted)]">
                                Вес: {factor.weightPct}% общего счёта
                              </span>
                            </div>
                          </div>
                          <span className="font-semibold">{valuePct}%</span>
                        </div>
                        
                        <div className="text-sm text-[color:var(--text-sub)]">
                          <p className="mb-2">{factor.evidence}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-[color:var(--muted)]">
                    <p>Нет доступных факторов для отображения</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sources */}
            <div className="card p-6 sm:p-7" aria-labelledby="sources-title">
              <h2 id="sources-title" className="text-2xl font-bold mb-4">Источники</h2>
              <div className="space-y-3">
                {result.explanation.sources && result.explanation.sources.length > 0 ? (
                  result.explanation.sources.map((source, index) => (
                    <div key={index} className="border border-[rgba(4,210,128,.22)] rounded-lg p-3 bg-[rgba(10,30,18,.35)]">
                      <div className="font-semibold text-sm">{source.name}</div>
                      <div className="text-xs text-[color:var(--muted)] mt-1">{source.status}</div>
                      {source.description && (
                        <div className="text-xs text-[color:var(--text-sub)] mt-1">{source.description}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[color:var(--muted)]">
                    <p>Нет доступных источников</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Feedback */}
          <section className="card p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">Оцените результат</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => sendFeedback('correct')}
                className="btn px-6 py-2"
              >
                👍 Правильно
              </button>
              <button 
                onClick={() => sendFeedback('incorrect')}
                className="btn px-6 py-2"
              >
                👎 Неправильно
              </button>
            </div>
            {feedbackStatus && (
              <p className="mt-2 text-sm text-[color:var(--text-sub)]">{feedbackStatus}</p>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
