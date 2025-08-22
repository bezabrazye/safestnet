'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReportItem { 
  id: string; 
  name: string; 
  email: string; 
  message: string; 
  createdAt: string; 
  imageBase64?: string; 
  analysisId?: string; 
  analysisLink?: string 
}

type FilterType = 'all' | 'incorrect' | 'correct';

interface SiteStatistics {
  daily: {
    totalVisits: number;
    uniqueVisits: number;
    scansConducted: number;
    positiveFeedback: number;
    negativeFeedback: number;
  };
  weekly: {
    totalVisits: number;
    uniqueVisits: number;
    scansConducted: number;
    positiveFeedback: number;
    negativeFeedback: number;
  };
  monthly: {
    totalVisits: number;
    uniqueVisits: number;
    scansConducted: number;
    positiveFeedback: number;
    negativeFeedback: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [currentReport, setCurrentReport] = useState<ReportItem | null>(null);
  const [reportStats, setReportStats] = useState<{totalReports:number; reviewedReports:number; remainingReports:number}>({totalReports:0, reviewedReports:0, remainingReports:0});
  const [allFeedbacks, setAllFeedbacks] = useState<{analysisId:string; verdict:'correct'|'incorrect'; createdAt:string}[]>([]);
  const [activeTab, setActiveTab] = useState<'reports'|'feedbacks'|'statistics'>('reports');
  const [authError, setAuthError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [siteStats, setSiteStats] = useState<SiteStatistics>({
    daily: { totalVisits: 0, uniqueVisits: 0, scansConducted: 0, positiveFeedback: 0, negativeFeedback: 0 },
    weekly: { totalVisits: 0, uniqueVisits: 0, scansConducted: 0, positiveFeedback: 0, negativeFeedback: 0 },
    monthly: { totalVisits: 0, uniqueVisits: 0, scansConducted: 0, positiveFeedback: 0, negativeFeedback: 0 }
  });
  
  const [feedbackFilter, setFeedbackFilter] = useState<FilterType>('all');
  const [feedbackPage, setFeedbackPage] = useState(1);
  const feedbacksPerPage = 6;

  const loadReports = async (user: string, pass: string) => {
    try {
      const r = await fetch('/api/admin/reports', {
        method: 'GET',
        headers: { 'x-admin-user': user, 'x-admin-pass': pass }
      });
      const data = await r.json();
      if (!r.ok || data.error) { setAuthError('Unauthorized'); setIsAuthed(false); return; }
      setCurrentReport(data.report || null);
      setReportStats(data.stats || {totalReports:0, reviewedReports:0, remainingReports:0});
      setAuthError('');
      setIsAuthed(true);
    } catch (error) {
      setAuthError('Network error');
      setIsAuthed(false);
    }
  };

  const loadFeedbacks = async (user: string, pass: string) => {
    try {
      const r = await fetch('/api/admin/feedbacks', {
        method: 'GET', headers: { 'x-admin-user': user, 'x-admin-pass': pass }
      });
      const data = await r.json();
      if (r.ok && data.items) {
        setAllFeedbacks(data.items);
        setFeedbackPage(1);
      }
    } catch {}
  };

  const loadStatistics = async (user: string, pass: string) => {
    try {
      const r = await fetch('/api/admin/statistics', {
        method: 'GET', headers: { 'x-admin-user': user, 'x-admin-pass': pass }
      });
      const data = await r.json();
      if (r.ok && data.stats) {
        setSiteStats(data.stats);
      }
    } catch {}
  };

  const deleteReport = async (id: string) => {
    const r = await fetch(`/api/admin/reports/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-user': username, 'x-admin-pass': password }
    });
    if (r.ok) loadReports(username, password);
  };

  const filteredFeedbacks = allFeedbacks.filter(f => {
    if (feedbackFilter === 'all') return true;
    return f.verdict === feedbackFilter;
  });

  const displayedFeedbacks = filteredFeedbacks.slice(0, feedbackPage * feedbacksPerPage);
  const hasMoreFeedbacks = displayedFeedbacks.length < filteredFeedbacks.length;

  const loadMoreFeedbacks = () => {
    setFeedbackPage(prev => prev + 1);
  };

  const cycleFilter = () => {
    setFeedbackFilter(prev => {
      if (prev === 'all') return 'incorrect';
      if (prev === 'incorrect') return 'correct';
      return 'all';
    });
    setFeedbackPage(1);
  };

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('adm_creds') : null;
    if (saved) {
      try {
        const { u, p } = JSON.parse(saved);
        if (u && p) {
          setUsername(u); setPassword(p);
          loadReports(u, p);
          loadFeedbacks(u, p);
          loadStatistics(u, p);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    if (activeTab === 'reports') loadReports(username, password);
    if (activeTab === 'feedbacks') loadFeedbacks(username, password);
    if (activeTab === 'statistics') loadStatistics(username, password);
  }, [activeTab, isAuthed]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadReports(username, password);
    await loadFeedbacks(username, password);
    await loadStatistics(username, password);
    if (typeof window !== 'undefined' && username && password) {
      localStorage.setItem('adm_creds', JSON.stringify({ u: username, p: password }));
    }
  };

  const logout = () => {
    setIsAuthed(false);
    setCurrentReport(null);
    setReportStats({totalReports:0, reviewedReports:0, remainingReports:0});
    if (typeof window !== 'undefined') localStorage.removeItem('adm_creds');
  };

  const StatCard = ({ title, value, subtitle, color = 'green' }: { title: string; value: number; subtitle?: string; color?: 'green' | 'blue' | 'purple' | 'orange' }) => {
    const colors = {
      green: 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
      blue: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
      purple: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
      orange: 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400'
    };
    
    return (
      <div className={`p-4 rounded-lg border ${colors[color]} backdrop-blur-sm`}>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="text-sm opacity-80">{title}</div>
        {subtitle && <div className="text-xs opacity-60 mt-1">{subtitle}</div>}
      </div>
    );
  };

  type StatsSlice = { totalVisits:number; uniqueVisits:number; scansConducted:number; positiveFeedback:number; negativeFeedback:number };
  const StatSection = ({ data, title }: { data: StatsSlice; title: string }) => {
    const totalFeedback = data.positiveFeedback + data.negativeFeedback;
    const positivePercentage = totalFeedback > 0 ? Math.round((data.positiveFeedback / totalFeedback) * 100) : 0;
    const negativePercentage = totalFeedback > 0 ? Math.round((data.negativeFeedback / totalFeedback) * 100) : 0;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Visits" value={data.totalVisits} color="blue" />
          <StatCard title="Unique Visits" value={data.uniqueVisits} color="purple" />
          <StatCard title="Scans Conducted" value={data.scansConducted} color="green" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Positive Feedback" 
            value={data.positiveFeedback} 
            subtitle={`${positivePercentage}%`}
            color="green" 
          />
          <StatCard 
            title="Negative Feedback" 
            value={data.negativeFeedback} 
            subtitle={`${negativePercentage}%`}
            color="orange" 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <div className="flex items-center gap-3">
          {isAuthed && <button className="text-sm underline" onClick={logout}>Logout</button>}
          <button className="text-sm underline" onClick={() => router.push('/')}>Back</button>
        </div>
      </div>

      {isAuthed && (
        <div className="mb-4">
          <div className="inline-flex rounded border border-[rgba(4,210,128,.22)] overflow-hidden">
            <button className={`px-3 py-2 text-sm ${activeTab==='reports'?'bg-[rgba(10,30,18,.35)]':''}`} onClick={()=>setActiveTab('reports')}>Reports</button>
            <button className={`px-3 py-2 text-sm ${activeTab==='feedbacks'?'bg-[rgba(10,30,18,.35)]':''}`} onClick={()=>setActiveTab('feedbacks')}>Feedbacks</button>
            <button className={`px-3 py-2 text-sm ${activeTab==='statistics'?'bg-[rgba(10,30,18,.35)]':''}`} onClick={()=>setActiveTab('statistics')}>Statistics</button>
          </div>
        </div>
      )}

      {!isAuthed && (
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Login</h2>
          <form onSubmit={doLogin} className="space-y-3 max-w-sm">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <input className="input w-full px-3 py-2" value={username} onChange={e=>setUsername(e.target.value)} placeholder="ya_admin" />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input className="input w-full px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••" />
            </div>
            <button type="submit" className="btn px-4 py-2">Sign in</button>
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
          </form>
        </section>
      )}

      {isAuthed && activeTab==='reports' && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Reports</h2>
            <div className="flex items-center gap-2">
              <button onClick={()=>loadReports(username, password)} className="btn px-3 py-1 text-xs">Refresh</button>
            </div>
          </div>
          <div className="space-y-3">
            {currentReport ? (
              <div className="p-3 rounded border border-[rgba(4,210,128,.22)] bg-[rgba(10,30,18,.35)]">
                <div className="text-sm opacity-80">{new Date(currentReport.createdAt).toLocaleString()}</div>
                <div className="font-medium">{currentReport.name} &lt;{currentReport.email}&gt;</div>
                <p className="m-0 text-sm">{currentReport.message}</p>
                {(currentReport.analysisLink || currentReport.analysisId) && (
                  <div className="mt-1">
                    <a className="text-sm underline" href={currentReport.analysisLink || `/result/${encodeURIComponent(String(currentReport.analysisId))}`} target="_blank">Open analysis</a>
                  </div>
                )}
                {currentReport.imageBase64 && (
                  <div className="mt-2">
                    <img src={currentReport.imageBase64} alt={`Attachment for report ${currentReport.id}`} className="max-h-48 rounded border border-[rgba(4,210,128,.22)]" />
                  </div>
                )}
                <div className="mt-2">
                  <button onClick={() => deleteReport(currentReport.id)} className="btn px-3 py-1 text-xs">Delete & Next</button>
                </div>
                <div className="mt-3 text-sm opacity-70">
                  <div>Всего репортов: {reportStats.totalReports}</div>
                  <div>Рассмотрено репортов: {reportStats.reviewedReports}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm opacity-70">No reports yet.</p>
            )}
          </div>
        </section>
      )}

      {isAuthed && activeTab==='feedbacks' && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Feedbacks Review</h2>
            <div className="flex items-center gap-2">
              <button onClick={()=>loadFeedbacks(username, password)} className="btn px-3 py-1 text-xs">Refresh</button>
              <button 
                onClick={cycleFilter}
                className="flex items-center gap-1 px-3 py-1 text-xs rounded border transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: feedbackFilter === 'all' ? '#6b7280' : feedbackFilter === 'incorrect' ? '#ef4444' : '#22c55e',
                  borderColor: feedbackFilter === 'all' ? '#9ca3af' : feedbackFilter === 'incorrect' ? '#f87171' : '#4ade80'
                }}
              >
                <div className="w-2 h-2 rounded-full bg-white"></div>
                {feedbackFilter === 'all' ? 'All' : feedbackFilter === 'incorrect' ? 'Negative' : 'Positive'}
              </button>
              <button 
                onClick={async () => {
                  const currentPageFeedbacks = filteredFeedbacks.slice((feedbackPage - 1) * feedbacksPerPage, feedbackPage * feedbacksPerPage);
                  const analysisIds = currentPageFeedbacks.map(f => f.analysisId);
                  
                  if (analysisIds.length === 0) return;
                  
                  try {
                    const r = await fetch('/api/admin/feedbacks/review', {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'x-admin-user': username, 
                        'x-admin-pass': password 
                      },
                      body: JSON.stringify({ analysisIds })
                    });
                    if (r.ok) {
                      setFeedbackPage(1);
                      loadFeedbacks(username, password);
                    }
                  } catch (error) {
                    console.error('Error marking feedbacks as reviewed:', error);
                  }
                }}
                className="btn px-3 py-1 text-xs bg-red-500 hover:bg-red-600"
              >
                Delete & Confirm
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {displayedFeedbacks.map((f, idx) => (
              <div key={idx} className="p-3 rounded border border-[rgba(4,210,128,.22)] bg-[rgba(10,30,18,.35)]">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-80">{new Date(f.createdAt).toLocaleString()}</span>
                  <span>Verdict: <span className={`font-semibold ${f.verdict==='incorrect'?'text-red-400':'text-green-400'}`}>{f.verdict}</span></span>
                  <a className="underline" href={`/result/${encodeURIComponent(f.analysisId)}`} target="_blank">Open analysis</a>
                </div>
              </div>
            ))}
            {displayedFeedbacks.length === 0 && <p className="text-sm opacity-70">No feedbacks yet.</p>}
            {hasMoreFeedbacks && (
              <div className="text-center pt-4">
                <button 
                  onClick={loadMoreFeedbacks}
                  className="btn px-4 py-2 text-sm"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {isAuthed && activeTab==='statistics' && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Site Statistics</h2>
            <button onClick={()=>loadStatistics(username, password)} className="btn px-4 py-2">Refresh</button>
          </div>
          
          <div className="space-y-8">
            <StatSection data={siteStats.daily} title="Daily Statistics" />
            <StatSection data={siteStats.weekly} title="Weekly Statistics" />
            <StatSection data={siteStats.monthly} title="Monthly Statistics" />
          </div>
        </section>
      )}
    </div>
  );
}
