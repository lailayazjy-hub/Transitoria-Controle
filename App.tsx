import React, { useState, useMemo, useEffect } from 'react';
import { AppSettings, RiskLevel, Transaction, TransactionStatus, AuditLogEntry, TransitoriaCategory, CompletenessIssue } from './types';
import { DEFAULT_SETTINGS, DEMO_DATA, THEMES } from './constants';
import { Logo } from './components/Logo';
import { SettingsModal } from './components/SettingsModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyzeTransactionsWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filterSmallAmounts, setFilterSmallAmounts] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<'3M' | '6M' | '9M' | '1Y' | 'CUSTOM'>('1Y');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'upload' | 'analysis' | 'audit'>('analysis');
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [completenessIssues, setCompletenessIssues] = useState<CompletenessIssue[]>([]);

  // Theme Helpers
  const theme = THEMES[settings.theme];
  
  useEffect(() => {
    if (transactions.length === 0 && settings.showDemo) {
       // Demo data loaded via button usually, but keeping logic consistent
    }
  }, [settings.showDemo, transactions.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTimeout(() => {
        const newTrans = DEMO_DATA.map(t => ({...t, id: Math.random().toString(36).substr(2, 9)})) as any;
        setTransactions([...transactions, ...newTrans]);
        setSelectedTab('analysis');
      }, 500);
    }
  };

  const loadDemoData = () => {
    setTransactions(DEMO_DATA as any);
    setSelectedTab('analysis');
  };

  const runAnalysis = async () => {
    if (!settings.showAiAnalysis) return;
    setIsAnalyzing(true);
    const { analyses, completenessIssues: issues } = await analyzeTransactionsWithGemini(transactions);
    
    const updatedTransactions = transactions.map(t => {
      const res = analyses[t.id];
      if (res) {
        return {
          ...t,
          aiAnalysis: res.analysis,
          riskLevel: res.risk as RiskLevel,
          allocatedPeriod: res.period,
          category: res.category as TransitoriaCategory
        };
      }
      return t;
    });
    
    setTransactions(updatedTransactions);
    setCompletenessIssues(issues);
    setIsAnalyzing(false);
  };

  const handleTransactionAction = (id: string, action: 'APPROVE' | 'CORRECT') => {
    const updatedTrans = transactions.map(t => 
      t.id === id ? { ...t, status: action === 'APPROVE' ? TransactionStatus.APPROVED : TransactionStatus.CORRECTED } : t
    );
    setTransactions(updatedTrans);

    const logEntry: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      transactionId: id,
      action: action,
      user: 'J. de Vries',
      details: action === 'APPROVE' ? 'Transactie goedgekeurd voor periode' : 'Markering voor correctie vereist'
    };
    setAuditLog([logEntry, ...auditLog]);
  };

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];
    if (filterSmallAmounts) {
      data = data.filter(t => Math.abs(t.amount) >= 50);
    }
    const now = new Date();
    // Simplified date filter for demo
    if (periodFilter !== 'CUSTOM') {
      // Logic placeholder
    } 
    return data;
  }, [transactions, filterSmallAmounts, periodFilter]);

  // Transform Data for "Time Shift" Chart (Periodeschuiving)
  const chartDataTimeShift = useMemo(() => {
    const months: Record<string, { month: string, booked: number, allocated: number }> = {};
    
    // Initialize standard months (e.g., current year)
    const year = 2024;
    for(let i=0; i<12; i++) {
        const m = `${year}-${String(i+1).padStart(2,'0')}`;
        months[m] = { month: m, booked: 0, allocated: 0 };
    }

    filteredTransactions.forEach(t => {
        // 1. Booked Amount (based on Date)
        const bookedMonth = t.date.substring(0, 7); // YYYY-MM
        if (months[bookedMonth]) {
            months[bookedMonth].booked += t.amount;
        }

        // 2. Allocated Amount (based on allocatedPeriod)
        // Simple logic for demo: Distribute amounts
        if (t.allocatedPeriod) {
            if (t.allocatedPeriod.endsWith('YEAR')) {
                // Distribute over 12 months of that year
                const allocYear = t.allocatedPeriod.split('-')[0];
                const amountPerMonth = t.amount / 12;
                for(let i=1; i<=12; i++) {
                    const m = `${allocYear}-${String(i).padStart(2,'0')}`;
                    if(months[m]) months[m].allocated += amountPerMonth;
                }
            } else if (t.allocatedPeriod.includes('Q')) {
                // Distribute over Quarter
                const [allocYear, q] = t.allocatedPeriod.split('-');
                const qNum = parseInt(q.replace('Q',''));
                const startMonth = (qNum - 1) * 3 + 1;
                const amountPerMonth = t.amount / 3;
                for(let i=0; i<3; i++) {
                     const m = `${allocYear}-${String(startMonth+i).padStart(2,'0')}`;
                     if(months[m]) months[m].allocated += amountPerMonth;
                }
            } else {
                // Specific month
                if(months[t.allocatedPeriod]) months[t.allocatedPeriod].allocated += t.amount;
            }
        } else {
             // Fallback: allocate same as booked if unknown
             if (months[bookedMonth]) months[bookedMonth].allocated += t.amount;
        }
    });

    return Object.values(months).sort((a,b) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    if (settings.currencyInThousands) {
      return `€ ${(amount / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-sm transition-colors duration-300" style={{ backgroundColor: '#F8FAFC', color: theme.text }}>
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Logo className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold tracking-tight leading-tight" style={{ color: theme.text }}>{settings.appName}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Periode Toerekening & Transitoria Check</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {settings.showUserName && (
                 <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-medium text-gray-600">J. de Vries (Controller)</span>
                 </div>
              )}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mb-6 flex items-center justify-between sticky top-20 z-30">
          <div className="flex gap-1">
            {['upload', 'analysis', 'audit'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-4 py-2 rounded font-medium text-sm transition-all capitalize ${selectedTab === tab ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                style={{ backgroundColor: selectedTab === tab ? theme.primary : 'transparent' }}
              >
                {tab === 'upload' ? 'Data Import' : tab === 'analysis' ? 'Analyse & Correctie' : 'Audit Log'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 px-2">
             {settings.showDemo && transactions.length === 0 && selectedTab === 'upload' && (
                <button onClick={loadDemoData} className="text-sm font-medium text-blue-600 hover:underline">
                  Laad Demo Data
                </button>
             )}
             {selectedTab === 'analysis' && (
                <>
                {settings.showAiAnalysis && (
                    <button 
                    onClick={runAnalysis} 
                    disabled={isAnalyzing || transactions.length === 0}
                    className="px-4 py-2 rounded text-white text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: theme.primary }}
                    >
                    {isAnalyzing ? (
                        <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Analyseren...
                        </>
                    ) : (
                        <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Start AI Controle
                        </>
                    )}
                    </button>
                )}
                {settings.showExportButtons && (
                    <button className="p-2 border rounded text-gray-600 hover:bg-gray-50" title="Export PDF">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </button>
                )}
                </>
             )}
          </div>
        </div>

        {/* CONTENT */}
        {selectedTab === 'upload' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
               <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>Importeer Grootboek</h3>
               <p className="text-gray-500 mb-8 text-sm max-w-md mx-auto">Upload uw .xlsx of .csv bestand met journaalposten om de periodecontrole te starten.</p>
               
               <label className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group">
                  <input type="file" onChange={handleFileUpload} className="hidden" accept=".csv, .xlsx" />
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <span className="text-base font-medium text-gray-900">Sleep bestand of klik hier</span>
                  <span className="text-xs text-gray-500 mt-2">Ondersteunt Exact, AFAS, Twinfield exports</span>
               </label>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex flex-col">
               <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Directe Invoer & Contracten</h3>
               <p className="text-xs text-gray-400 mb-2">Plak factuurdata of contractdetails</p>
               <textarea 
                className="w-full flex-1 border rounded-lg p-4 text-sm font-mono focus:ring-2 focus:outline-none resize-none bg-gray-50" 
                placeholder="2024-01-01  Factuur 2024001  Huur Q1  15000..." 
                style={{ '--tw-ring-color': theme.primary } as any}
               ></textarea>
               <button className="mt-4 px-4 py-3 rounded-lg text-white text-sm font-bold w-full transition-opacity hover:opacity-90" style={{ backgroundColor: theme.primary }}>
                 Verwerk Invoer
               </button>
            </div>
          </div>
        )}

        {selectedTab === 'analysis' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Stats & Completeness Check */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Time Shift Chart */}
               <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-base font-bold" style={{ color: theme.text }}>Periodeschuiving (Time Shift)</h4>
                        <p className="text-xs text-gray-500">Geboekt bedrag (Datum) vs. Toegerekend bedrag (Periode)</p>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-800"></div> Geboekt</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: theme.primary }}></div> Toegerekend</div>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataTimeShift} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="month" tickFormatter={(v) => v.substring(5)} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <YAxis hide />
                        <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), '']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="booked" fill="#1f2937" radius={[4, 4, 0, 0]} name="Geboekt" />
                        <Bar dataKey="allocated" fill={theme.primary} radius={[4, 4, 0, 0]} name="Toegerekend" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Completeness & Alerts */}
               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                  <h4 className="text-base font-bold mb-4" style={{ color: theme.text }}>Volledigheidscontrole</h4>
                  
                  {completenessIssues.length > 0 ? (
                      <div className="space-y-3 overflow-y-auto flex-1 max-h-64 pr-2">
                        {completenessIssues.map((issue, idx) => (
                            <div key={idx} className="p-3 bg-orange-50 rounded border border-orange-100 flex gap-3 items-start">
                                <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium">{issue.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">Verwacht: <span className="font-mono">{issue.expectedPeriod}</span></p>
                                </div>
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                          <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="text-sm">Geen ontbrekende posten gedetecteerd.</p>
                      </div>
                  )}
               </div>
            </div>

            {/* Analysis Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                 <h3 className="font-semibold text-base" style={{ color: theme.text }}>Transactie Details</h3>
                 <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">{transactions.filter(t => t.status === TransactionStatus.APPROVED).length} Goedgekeurd</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">{transactions.filter(t => t.status === TransactionStatus.CORRECTED).length} Correctie Nodig</span>
                 </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="min-w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                     <tr>
                       <th className="px-6 py-3">Datum</th>
                       <th className="px-6 py-3">Omschrijving</th>
                       <th className="px-6 py-3">Categorie</th>
                       <th className="px-6 py-3 text-right">Bedrag</th>
                       <th className="px-6 py-3">Periode</th>
                       <th className="px-6 py-3 text-center">Status</th>
                       <th className="px-6 py-3 text-right">Actie</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 bg-white">
                     {transactions.length === 0 ? (
                       <tr>
                         <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                           Geen data beschikbaar. Importeer data of laad de demo.
                         </td>
                       </tr>
                     ) : (
                       transactions.map((t) => (
                         <tr key={t.id} className="hover:bg-blue-50 transition-colors group">
                           <td className="px-6 py-3 text-gray-600 font-mono text-xs">{t.date}</td>
                           <td className="px-6 py-3">
                                <div className="font-medium text-gray-800">{t.description}</div>
                                {t.aiAnalysis && <div className="text-xs text-gray-500 italic mt-0.5">{t.aiAnalysis}</div>}
                           </td>
                           <td className="px-6 py-3">
                               <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200">{t.category || 'Onbekend'}</span>
                           </td>
                           <td className={`px-6 py-3 text-right font-mono font-medium ${t.type === 'CREDIT' ? 'text-green-600' : 'text-gray-800'}`}>
                             {formatCurrency(t.amount)}
                           </td>
                           <td className="px-6 py-3">
                             <span className={`px-2 py-1 rounded text-xs font-bold ${t.allocatedPeriod ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                {t.allocatedPeriod || '?'}
                             </span>
                           </td>
                           <td className="px-6 py-3 text-center">
                             {t.status === TransactionStatus.APPROVED && <span className="text-green-500 font-bold text-xs">OK</span>}
                             {t.status === TransactionStatus.CORRECTED && <span className="text-red-500 font-bold text-xs">CORR</span>}
                             {t.status === TransactionStatus.PENDING && <span className="text-gray-300 text-xs">-</span>}
                           </td>
                           <td className="px-6 py-3 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleTransactionAction(t.id, 'APPROVE')}
                                    className="p-1 text-green-600 hover:bg-green-100 rounded" 
                                    title="Goedkeuren"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button 
                                    onClick={() => handleTransactionAction(t.id, 'CORRECT')}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded" 
                                    title="Markeer voor Correctie"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                             </div>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>

          </div>
        )}

        {/* Audit Log Tab */}
        {selectedTab === 'audit' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-fade-in overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-base" style={{ color: theme.text }}>Audit Logboek</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {auditLog.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Nog geen acties vastgelegd.</div>
                    ) : (
                        auditLog.map(log => (
                            <div key={log.id} className="p-4 hover:bg-gray-50 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${log.action === 'APPROVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900">{log.details}</p>
                                        <p className="text-xs text-gray-500">{log.user} • {log.timestamp}</p>
                                    </div>
                                </div>
                                <span className="font-mono text-xs text-gray-400">ID: {log.transactionId}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings} 
        onUpdateSettings={setSettings} 
      />
    </div>
  );
};

export default App;