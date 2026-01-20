import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Zap,
  LogOut,
  Calendar,
  ChevronRight,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Search,
  TrendingUp,
  ArrowUp,
  CheckCircle2,
  Bell,
  MousePointerClick,
  Lightbulb,
  RotateCcw,
  PiggyBank,
  ScanEye,
  AlertTriangle,
  Rocket,
  ArrowUpRight,
  Loader2,
  HandMetal,
  UploadCloud,
  X,
  FileText,
  ShieldBan,
  Calculator,
  Info,
  DollarSign,
  Percent,
  Download,
  Settings,
  Database,
  Crosshair,
  ClipboardCheck,
  Globe,
  Copy
} from 'lucide-react';
import { Campaign, CampaignStatus, RiskLevel } from './types';
import { getMockCampaigns, calculateProfitAwareMetrics } from './services/adsService';
import { CampaignCard } from './components/CampaignCard';
import { ActionPlanView } from './components/ActionPlanView';

type ViewType = 'dashboard' | 'performance' | 'audit' | 'documentation' | 'safety-guards' | 'growth-opportunities' | 'action-plan';
type ActivityFilter = 'all' | 'protection' | 'growth';

interface LedgerItem {
  id: string;
  date: string;
  campaign: string;
  action: string;
  agent: string;
  impact: string;
  type: 'protection' | 'growth';
}

const App: React.FC = () => {
  // Navigation & View State
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dataSource, setDataSource] = useState<'default' | 'csv'>('default');
  
  // Business Economics State
  const [userCogs, setUserCogs] = useState(0.60); // 60% default
  const [showCalc, setShowCalc] = useState(false);
  const [calcPrice, setCalcPrice] = useState<string>('100');
  const [calcCost, setCalcCost] = useState<string>('40');

  // Action States
  const [pausingIds, setPausingIds] = useState<Set<string>>(new Set());
  const [isScaling, setIsScaling] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Activity History / Ledger State
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [revertingIds, setRevertingIds] = useState<Set<string>>(new Set());
  
  const [ledgerData, setLedgerData] = useState<LedgerItem[]>([
    { id: 'l1', date: '2026-01-18 14:22', campaign: 'Competitor_Search', action: 'Stopped Loss', agent: 'Safety Net', impact: '+$130 Saved', type: 'protection' },
    { id: 'l2', date: '2026-01-18 09:05', campaign: 'Brand_Keywords_Alpha', action: 'Boosted Budget', agent: 'Opportunity Scout', impact: '+$450 Revenue', type: 'growth' },
    { id: 'l3', date: '2026-01-17 18:12', campaign: 'Display_Retargeting', action: 'Stopped Loss', agent: 'Safety Net', impact: '+$45 Saved', type: 'protection' },
    { id: 'l4', date: '2026-01-17 10:45', campaign: 'PMax_Global_Scale', action: 'Boosted Budget', agent: 'Opportunity Scout', impact: '+$820 Revenue', type: 'growth' },
    { id: 'l5', date: '2026-01-16 22:30', campaign: 'Keyword_Expansion_v2', action: 'Stopped Loss', agent: 'Safety Net', impact: '+$210 Saved', type: 'protection' }
  ]);

  // Safety Guards State
  const [minMargin, setMinMargin] = useState(15);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);

  // Growth View Specific State
  const [keywordOpportunities, setKeywordOpportunities] = useState([
    { id: 'k1', term: "buy luxury widgets", status: "Low Cost", added: false },
    { id: 'k2', term: "best widget 2026", status: "High Intent", added: false },
    { id: 'k3', term: "premium widget review", status: "Untapped", added: false }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Initial Data Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      const initialData = getMockCampaigns(userCogs);
      setCampaigns(initialData);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Recalculate margins when COGS changes
  useEffect(() => {
    if (loading) return;
    setCampaigns(prev => prev.map(c => {
      const { margin, roas } = calculateProfitAwareMetrics(c.spend, c.revenue, userCogs);
      
      let recommendation = "Maintain spend levels.";
      let riskLevel = RiskLevel.LOW;

      if (margin < 0) {
        recommendation = "CRITICAL: Negative Margin detected. High ROAS is deceptive.";
        riskLevel = RiskLevel.HIGH;
      } else if (roas > 4) {
        recommendation = "High efficiency. Scaling recommended.";
        riskLevel = RiskLevel.LOW;
      } else if (margin < 100) {
        recommendation = "Thin margins. Monitor conversion costs.";
        riskLevel = RiskLevel.MEDIUM;
      }

      return { ...c, margin, roas, recommendation, riskLevel };
    }));
  }, [userCogs, loading]);

  const handlePause = async (id: string) => {
    if (isOfflineMode) return;
    if (pausingIds.has(id)) return;
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    setPausingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    await new Promise(resolve => setTimeout(resolve, 1200));
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: CampaignStatus.PAUSED } : c));
    setPausingIds(prev => { 
      const n = new Set(prev); 
      n.delete(id); 
      return n; 
    });
    
    const newEntry: LedgerItem = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      campaign: campaign.name,
      action: 'Stopped Loss',
      agent: 'Safety Net',
      impact: `+$${Math.abs(Math.round(campaign.margin))} Saved`,
      type: 'protection'
    };
    setLedgerData(prev => [newEntry, ...prev]);
    showToast(`${campaign.name} protected successfully.`);
  };

  const handleUndo = async (ledgerId: string) => {
    if (revertingIds.has(ledgerId)) return;
    setRevertingIds(prev => {
      const next = new Set(prev);
      next.add(ledgerId);
      return next;
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRevertingIds(prev => {
      const n = new Set(prev);
      n.delete(ledgerId);
      return n;
    });
    showToast("Action reverted. Campaign resumed in Simulation Mode.");
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error("File is empty or invalid.");

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const findIndex = (searchTerms: string[]) => {
      const idx = headers.findIndex(h => searchTerms.some(term => h.toLowerCase().includes(term.toLowerCase())));
      return idx;
    };

    const nameIdx = findIndex(['Campaign', 'Campaign Name', 'Ad set name', 'Campaign name']);
    const costIdx = findIndex(['Cost', 'Amount Spent', 'Spend', 'Total Cost', 'Amount spent (USD)']);
    const revenueIdx = findIndex(['Conv. value', 'Purchase Conversion Value', 'Revenue', 'Total Value', 'Conversion value', 'Value']);

    if (costIdx === -1 || revenueIdx === -1) {
      throw new Error("Could not detect 'Cost' and 'Revenue' columns. Please check your headers.");
    }

    const newCampaigns: Campaign[] = lines.slice(1).map((line, i) => {
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
      
      const name = nameIdx !== -1 ? values[nameIdx] : `Dataset ${i + 1}`;
      const spendStr = values[costIdx] || "0";
      const revenueStr = values[revenueIdx] || "0";
      
      const spend = parseFloat(spendStr.replace(/[^0-9.-]+/g, "")) || 0;
      const revenue = parseFloat(revenueStr.replace(/[^0-9.-]+/g, "")) || 0;

      const { margin, roas } = calculateProfitAwareMetrics(spend, revenue, userCogs);
      
      let recommendation = "Maintain current pacing.";
      let riskLevel = RiskLevel.LOW;

      if (margin < 0) {
        recommendation = "CRITICAL: Negative Margin detected. High ROAS is deceptive.";
        riskLevel = RiskLevel.HIGH;
      } else if (roas > 4) {
        recommendation = "High efficiency. Scaling recommended.";
        riskLevel = RiskLevel.LOW;
      } else if (margin < 100) {
        recommendation = "Thin margins. Monitor conversion costs.";
        riskLevel = RiskLevel.MEDIUM;
      }

      return {
        id: `csv-${i}`,
        name,
        status: CampaignStatus.ACTIVE,
        spend,
        revenue,
        roas,
        margin,
        recommendation,
        riskLevel
      };
    });

    setCampaigns(newCampaigns);
    setIsOfflineMode(true);
    setDataSource('csv');
    setActiveView('dashboard');
    setShowUploadModal(false);
    showToast(`✅ Data Loaded: Updated dashboard with ${newCampaigns.length} campaigns from CSV.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        parseCSV(text);
      } catch (err: any) {
        alert(err.message || "Failed to parse CSV.");
      }
    };
    reader.readAsText(file);
  };

  const updateCalcCogs = () => {
    const price = parseFloat(calcPrice);
    const cost = parseFloat(calcCost);
    if (!isNaN(price) && !isNaN(cost) && price > 0) {
      const calculatedCogs = cost / price;
      setUserCogs(calculatedCogs);
      showToast(`COGS set to ${Math.round(calculatedCogs * 100)}% based on product math.`);
    }
  };

  const filteredLedger = useMemo(() => {
    if (activityFilter === 'all') return ledgerData;
    return ledgerData.filter(item => item.type === activityFilter);
  }, [ledgerData, activityFilter]);

  const handleApplyStrategy = async () => {
    if (isOfflineMode) return;
    setIsScaling(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsScaling(false);
    showToast("Optimization Strategy Active");
  };

  const handleBoostBudget = async (name: string, margin: number) => {
    if (isOfflineMode) return;
    showToast(`Budget increased. Projected profit +$${Math.round(margin * 0.2)}/week.`);
  };

  const handleAddKeyword = (id: string, term: string) => {
    setKeywordOpportunities(prev => prev.map(k => k.id === id ? { ...k, added: true } : k));
    showToast(`Keyword "${term}" added to tracking.`);
  };

  const resetApp = () => {
    window.location.reload();
  };

  // --- View Renderers ---

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 h-24 rounded-2xl p-5 flex flex-col justify-center shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Real Profit</p>
          <p className={`text-2xl font-black ${isOfflineMode ? 'text-blue-400' : 'text-emerald-400'}`}>
            ${campaigns.reduce((sum, c) => sum + c.margin, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 h-24 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Ad Spend</p>
          <p className="text-2xl font-black text-white">
            ${campaigns.reduce((sum, c) => sum + c.spend, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 h-24 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg ROAS</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-black text-orange-500">
              {(campaigns.reduce((sum, c) => sum + c.revenue, 0) / (campaigns.reduce((sum, c) => sum + c.spend, 0) || 1)).toFixed(2)}x
            </p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 h-24 rounded-2xl p-5 flex flex-col justify-center shadow-sm">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{isOfflineMode ? 'Data Source' : 'Active Protections'}</p>
          <p className="text-2xl font-black text-blue-400">{isOfflineMode ? 'Static Import' : '3 Threats Blocked'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {campaigns.map(c => (
          <div key={c.id} className="h-full flex flex-col">
            <CampaignCard 
              campaign={c} 
              onPause={handlePause} 
              isPausing={pausingIds.has(c.id)} 
              isOffline={isOfflineMode}
            />
          </div>
        ))}
      </div>
      
      <div className={`bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-2xl relative overflow-hidden group bg-gradient-to-br from-slate-900 to-slate-950 mt-12 ${isOfflineMode ? 'opacity-50 grayscale' : ''}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-orange-600/10 transition-colors duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4 text-orange-500">
              <Zap className="w-7 h-7 fill-current" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Growth Engine</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Ready to scale your winning campaigns?</h3>
            <p className="text-slate-400 text-base leading-relaxed">
              ProfitGuard has identified <strong>14.2%</strong> in additional profit potential based on your <strong>{Math.round(userCogs * 100)}% COGS</strong>. Reinvest eliminated waste into your most profitable clusters.
            </p>
          </div>
          <button 
            onClick={handleApplyStrategy} 
            disabled={isScaling || isOfflineMode} 
            className="shrink-0 bg-orange-600 hover:bg-orange-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center gap-4 shadow-xl shadow-orange-950/20 active:scale-95 disabled:opacity-50"
          >
            {isScaling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-6 h-6" />}
            {isOfflineMode ? 'API Locked' : 'Scale Profits Now'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => {
    const chartData = [
      { day: 'Mon', spend: 1200, profit: 800 },
      { day: 'Tue', spend: 1500, profit: 1100 },
      { day: 'Wed', spend: 1100, profit: 450 },
      { day: 'Thu', spend: 1800, profit: 1300 },
      { day: 'Fri', spend: 2200, profit: 1900 },
      { day: 'Sat', spend: 900, profit: 600 },
      { day: 'Sun', spend: 800, profit: 550 }
    ];
    const maxVal = 2500;

    return (
      <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <div className="bg-slate-800/40 border border-slate-700/50 p-8 rounded-3xl flex gap-6 items-start shadow-inner">
          <div className="bg-orange-600/20 p-4 rounded-2xl border border-orange-500/20 shrink-0">
            <Lightbulb className="w-8 h-8 text-orange-500" />
          </div>
          <div className="space-y-3">
            <h4 className="text-xl font-bold text-white">Why this chart matters</h4>
            <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
              Most tools show you "Revenue" (Vanity). We track <strong>"Real Profit"</strong> based on your current <strong>{Math.round(userCogs * 100)}% Product Cost</strong>. Profit is sanity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-sm relative overflow-hidden group">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Net Profit ({isOfflineMode ? 'Dataset' : '30-Day'})</p>
            <div className="flex items-end gap-3">
              <h4 className="text-4xl font-black text-white">
                ${campaigns.reduce((sum, c) => sum + c.margin, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h4>
              <span className="text-xs text-emerald-500 font-bold mb-1.5 flex items-center gap-0.5"><ArrowUp className="w-3 h-3" /> 8.4%</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-sm relative overflow-hidden group">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Efficiency Score</p>
            <div className="flex items-end gap-3">
              <h4 className="text-4xl font-black text-orange-500">82%</h4>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-sm border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
            <p className="text-emerald-500/70 text-[10px] font-black uppercase tracking-widest mb-3">Waste Eliminated</p>
            <div className="flex items-end gap-3">
              <h4 className="text-5xl font-black text-emerald-400">$1,850</h4>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Profit Velocity</h3>
              <p className="text-sm text-slate-500">Comparing your daily investment vs. your daily return.</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-500 rounded-md"></div><span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Ad Spend</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-md"></div><span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Real Profit</span></div>
            </div>
          </div>

          <div className="relative h-72 flex items-end justify-between gap-6 px-4">
            <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
              {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-t border-slate-400 w-full h-0"></div>)}
            </div>

            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative">
                <div className="w-full flex justify-center items-end gap-1.5 px-2 h-64">
                  <div className="w-full bg-blue-500/20 border-t border-blue-500 hover:bg-blue-500/40 transition-all rounded-t-md" style={{ height: `${(d.spend / maxVal) * 100}%` }}></div>
                  <div className="w-full bg-orange-500/40 border-t border-orange-500 hover:bg-orange-500/60 transition-all rounded-t-md" style={{ height: `${(d.profit / maxVal) * 100}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSafetyGuards = () => {
    const getProfitFloorLabel = (val: number) => {
      if (val < 10) return "High Risk (Growth Mode)";
      if (val <= 20) return "Balanced (Recommended)";
      return "Strict (Profit Mode)";
    };

    const grossMarginPercent = Math.round((1 - userCogs) * 100);

    return (
      <div className="max-w-4xl space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-32">
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-10 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-5 mb-10">
            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20"><Calculator className="w-8 h-8 text-emerald-500" /></div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Business Economics</h3>
              <p className="text-slate-500 text-sm">Define your real costs so we can calculate real profit accurately.</p>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Average Product Cost (COGS)</label>
                  <p className="text-xs text-slate-500 max-w-md">Manufacturing, shipping, and fulfillment costs. Your cost before ad spend.</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Profit Potential: {grossMarginPercent}%</span>
                  <span className="text-5xl font-black text-white">{Math.round(userCogs * 100)}%</span>
                </div>
              </div>
              <input 
                type="range" min="0" max="100" step="1" value={Math.round(userCogs * 100)} 
                onChange={(e) => { setUserCogs(Number(e.target.value) / 100); showToast("Business Model Updated"); }} 
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-600 mb-8" 
              />
              
              <div className="flex flex-col gap-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Industry Presets</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Digital/SaaS', val: 0.15 },
                    { label: 'Manufacturing', val: 0.50 },
                    { label: 'Retail/Resale', val: 0.65 },
                    { label: 'Dropshipping', val: 0.80 }
                  ].map(preset => (
                    <button 
                      key={preset.label}
                      onClick={() => setUserCogs(preset.val)}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${Math.abs(userCogs - preset.val) < 0.01 ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/20' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button 
                onClick={() => setShowCalc(!showCalc)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Don't know your cost percentage?
              </button>
              
              {showCalc && (
                <div className="mt-6 p-6 bg-slate-950/50 border border-slate-800 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Item Sale Price ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                          type="number" 
                          value={calcPrice}
                          onChange={(e) => setCalcPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-10 py-3 text-white font-bold outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Unit Cost to Make/Buy ($)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <input 
                          type="number" 
                          value={calcCost}
                          onChange={(e) => setCalcCost(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-10 py-3 text-white font-bold outline-none focus:border-blue-500/50 transition-colors"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={updateCalcCogs}
                    className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-900/20"
                  >
                    Calculate & Apply COGS
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`bg-slate-900 rounded-3xl border border-slate-800 p-10 shadow-xl relative overflow-hidden ${isOfflineMode ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-5 mb-10">
            <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20"><ShieldAlert className="w-8 h-8 text-orange-600" /></div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Protection Rules</h3>
              <p className="text-slate-500 text-sm">Automate your Stop-Loss protocols.</p>
            </div>
          </div>
          
          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Minimum Net Margin Goal (%)</label>
                  <p className="text-xs text-slate-500">The absolute floor for profit per sale.</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black block mb-1 uppercase tracking-widest ${minMargin >= 10 && minMargin <= 20 ? 'text-emerald-500' : 'text-orange-500'}`}>
                    {getProfitFloorLabel(minMargin)}
                  </span>
                  <span className="text-4xl font-black text-white">{minMargin}%</span>
                </div>
              </div>
              <input 
                type="range" min="0" max="50" step="1" value={minMargin} 
                onChange={(e) => { setMinMargin(Number(e.target.value)); showToast("Rules Saved"); }} 
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-orange-600" 
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-950/40 rounded-2xl border border-slate-800">
              <div>
                <p className="font-bold text-white mb-1">Active Safety Net</p>
                <p className="text-xs text-slate-500">Auto-pause ads when margin drops below {minMargin}%.</p>
              </div>
              <button 
                onClick={() => setAutoPauseEnabled(!autoPauseEnabled)} 
                className={`w-14 h-7 rounded-full transition-all relative shrink-0 ${autoPauseEnabled ? 'bg-orange-600' : 'bg-slate-800'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${autoPauseEnabled ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGrowthOpportunities = () => {
    const starPerformer = campaigns.length > 0 
      ? campaigns.reduce((prev, current) => (prev.margin > current.margin) ? prev : current, campaigns[0])
      : { name: 'None', margin: 0, roas: 0 };

    return (
      <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-24 max-w-6xl">
        <header><h3 className="text-3xl font-black text-white uppercase tracking-tighter">Growth Opportunities</h3><p className="text-slate-500 text-sm mt-2">Reinvest savings into top performers.</p></header>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-10 shadow-xl relative overflow-hidden group ${isOfflineMode ? 'opacity-50 grayscale' : ''}`}>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8"><Rocket className="w-6 h-6 text-orange-600" /><span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Winner's Circle</span></div>
              <h4 className="text-4xl font-black text-white mb-2">🔥 Star Performer Detected</h4>
              <p className="text-slate-400 text-lg mb-8 font-medium">"{starPerformer.name}" is ready for more budget.</p>
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800"><p className="text-[10px] text-slate-500 uppercase mb-1">ROAS</p><p className="text-3xl font-black text-white">{starPerformer.roas.toFixed(1)}x</p></div>
                <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10"><p className="text-[10px] text-emerald-500/70 uppercase mb-1">Profit</p><p className="text-3xl font-black text-emerald-400">${Math.round(starPerformer.margin).toLocaleString()}</p></div>
              </div>
              <button 
                onClick={() => handleBoostBudget(starPerformer.name, starPerformer.margin)} 
                disabled={isOfflineMode}
                className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4"
              >
                Boost Budget (+20%) <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col h-full"><HelpCircle className="w-8 h-8 text-blue-500 mb-4" /><h5 className="text-xl font-bold text-white mb-4">Why scale winners?</h5><p className="text-slate-400 text-sm leading-relaxed">ProfitGuard has identified these campaigns as high-margin winners based on your <strong>{Math.round(userCogs * 100)}% COGS</strong> model.</p></div>
        </div>
        <div className="space-y-8">
          <h4 className="text-xl font-black text-white px-2 flex items-center gap-3 uppercase tracking-tighter">Keyword Scout <div className="h-px bg-slate-800 flex-1"></div></h4>
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden divide-y divide-slate-800/50">
            {keywordOpportunities.map((k) => (
              <div key={k.id} className="p-8 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                <div className="flex items-center gap-6"><Search className="w-4 h-4 text-orange-500" /><div><p className="font-bold text-white text-lg">{k.term}</p><span className="text-[10px] font-black text-emerald-500/70">{k.status}</span></div></div>
                <button onClick={() => !k.added && handleAddKeyword(k.id, k.term)} disabled={k.added} className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all ${k.added ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-orange-600 hover:border-orange-500 hover:text-white'}`}>{k.added ? 'Added' : 'Add to Ad Group'}</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- Helpers ---

  const SidebarItem = ({ id, icon: Icon, label, disabled = false }: { id: ViewType, icon: any, label: string, disabled?: boolean }) => (
    <button 
      onClick={() => !disabled && setActiveView(id)}
      className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all relative group ${
        activeView === id 
        ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/20 font-black' 
        : `text-slate-500 font-bold hover:text-slate-200 ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800/50'}`
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${activeView === id ? 'text-white' : 'group-hover:text-orange-500 transition-colors'}`} />
      <span className="truncate tracking-tight">{label}</span>
    </button>
  );

  const renderAudit = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h3 className="text-3xl font-black text-white flex items-center gap-4">
            Savings Ledger
            <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
              <PiggyBank className="w-3 h-3" /> Impact Tracker
            </div>
          </h3>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">Historical record of every automated intervention.</p>
        </div>
        
        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          {(['all', 'protection', 'growth'] as ActivityFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActivityFilter(filter)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activityFilter === filter 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-950/20' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {filter === 'all' ? 'All Events' : filter === 'protection' ? 'Protections' : 'Growth'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800">
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date/Time</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Est. Impact</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredLedger.length > 0 ? filteredLedger.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-6 text-xs text-slate-400 font-bold flex items-center gap-2 tracking-tight"><Calendar className="w-4 h-4 opacity-50" />{row.date}</td>
                  <td className="p-6 text-sm font-bold text-white">{row.campaign}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      row.type === 'protection' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>{row.action}</span>
                  </td>
                  <td className={`p-6 text-xs font-black tracking-widest ${row.type === 'protection' ? 'text-emerald-400' : 'text-blue-400'}`}>{row.impact}</td>
                  <td className="p-6 text-right">
                    <button onClick={() => handleUndo(row.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-700 text-slate-400 hover:text-white hover:border-orange-500/50 hover:bg-orange-500/5 transition-all">
                      {revertingIds.has(row.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />} Undo
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest italic">No events found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0B1120]">
        <div className="w-20 h-20 border-4 border-orange-600/20 border-t-orange-600 rounded-full animate-spin mb-8"></div>
        <p className="text-orange-500 font-black text-sm tracking-[0.5em] animate-pulse uppercase">ProfitGuard Analyzing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0B1120] text-slate-100 overflow-hidden font-sans">
      {toast && (
        <div className="fixed top-10 right-1/2 translate-x-1/2 lg:right-10 lg:translate-x-0 z-[110] bg-slate-900 text-white px-8 py-5 rounded-2xl shadow-2xl border border-orange-500/20 flex items-center gap-5 animate-in slide-in-from-top-12 lg:slide-in-from-right-12 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" /><span className="text-xs font-black uppercase tracking-widest">{toast}</span>
        </div>
      )}

      {/* Universal Import Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-800 shadow-3xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/20"><UploadCloud className="w-8 h-8 text-blue-500" /></div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Universal Data Import</h3>
                  <p className="text-slate-500 text-sm">Upload CSV from Google, Meta, or TikTok.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-950/40 border border-slate-800 p-6 rounded-2xl">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Supported Platforms</h5>
                  <div className="flex flex-wrap gap-2">
                    {['Google Ads', 'Meta (FB/IG)', 'TikTok', 'Pinterest'].map(col => (
                      <span key={col} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white">{col}</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-4 leading-relaxed italic">
                    ProfitGuard auto-detects "Amount Spent" and "Revenue" columns across all major platforms.
                  </p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer group"
                >
                  <input 
                    type="file" 
                    accept=".csv" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                  <FileText className="w-12 h-12 text-slate-700 group-hover:text-blue-500 transition-colors mb-4" />
                  <p className="text-white font-bold mb-1">Select CSV File</p>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Or drag and drop here</p>
                </div>

                <div className="flex justify-center pt-2">
                  <a 
                    href="/swan_lake_sample_data.csv" 
                    download="swan_lake_sample_data.csv"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Sample Cross-Platform CSV
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-900 flex flex-col border-b lg:border-r border-slate-800 shrink-0 shadow-2xl z-20">
        <div className="p-10 flex flex-col gap-2 border-b border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-900/40"><ShieldCheck className="w-7 h-7 text-white" /></div>
            <span className="font-black text-2xl text-white tracking-tighter text-nowrap">ProfitGuard AI</span>
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-14">Command Center</span>
        </div>
        
        <nav className="flex-1 p-8 space-y-3 overflow-y-auto scrollbar-hide">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="performance" icon={BarChart3} label="Performance" />
          <SidebarItem id="action-plan" icon={ClipboardCheck} label="Action Plan" />
          <SidebarItem id="audit" icon={Activity} label="Savings Ledger" />
          <div className="pt-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 mb-5">Rules & Econ</div>
          <SidebarItem id="safety-guards" icon={ShieldCheck} label="Protection Rules" />
          <SidebarItem id="growth-opportunities" icon={TrendingUp} label="Growth Engine" />
          <div className="pt-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 mb-5">Resources</div>
          <SidebarItem id="documentation" icon={BookOpen} label="How it Works" />
        </nav>

        <div className="p-8 border-t border-slate-800 space-y-4 bg-slate-950/20">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
          >
            <UploadCloud className="w-4 h-4" />
            Import CSV
          </button>
          <div className={`text-[10px] font-black flex items-center gap-2 uppercase tracking-widest p-3 rounded-xl border ${isOfflineMode ? 'text-blue-400 bg-blue-500/5 border-blue-500/10' : 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOfflineMode ? 'bg-blue-400' : 'bg-emerald-500'}`}></div>
            {isOfflineMode ? 'Analysis Mode (CSV)' : 'Simulation Mode (API)'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0B1120] relative">
        <header className="h-24 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between px-6 lg:px-12 shrink-0 z-10 backdrop-blur-xl">
          <div className="flex flex-col">
            <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              ProfitGuard AI <span className="text-slate-700 hidden lg:inline">/</span> <span className="text-orange-500 hidden lg:inline">{activeView.replace('-', ' ')}</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest text-nowrap truncate">Universal Economics Model</p>
              <div className="h-3 w-px bg-slate-700 mx-1 shrink-0"></div>
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 shrink-0 ${
                dataSource === 'csv' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <Database className="w-3 h-3" />
                Using: {dataSource === 'csv' ? 'Uploaded Dataset' : 'Default Data'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="relative">
              <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-3 lg:p-4 border rounded-2xl transition-all shadow-sm ${isNotificationsOpen ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' : 'text-slate-500 border-slate-700 bg-slate-800/50 hover:border-slate-500'}`}>
                <Bell className="w-5 h-5" />
              </button>
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-5 w-64 lg:w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-3xl z-50 p-4 animate-in fade-in slide-in-from-top-4">
                    <div className="px-5 py-3 border-b border-slate-800/50 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">System Pulse</div>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mb-2">
                      <p className="text-xs font-bold text-white">✅ Multi-Platform Support</p>
                      <p className="text-[10px] text-emerald-500 mt-1 font-black uppercase">Parsing rules updated for Meta/TikTok</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-white text-sm lg:text-base shadow-xl hover:scale-105 active:scale-95 transition-all">JD</button>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-5 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-3xl z-50 p-2 animate-in fade-in slide-in-from-top-4">
                    <button onClick={resetApp} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors"><LogOut className="w-4 h-4" /> Reset App</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 scrollbar-hide">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'performance' && renderPerformance()}
          {activeView === 'audit' && renderAudit()}
          {activeView === 'documentation' && documentationView()}
          {activeView === 'safety-guards' && renderSafetyGuards()}
          {activeView === 'growth-opportunities' && renderGrowthOpportunities()}
          {activeView === 'action-plan' && <ActionPlanView campaigns={campaigns} userCogs={userCogs} onShowToast={showToast} />}
        </div>

        <footer className="bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-12 py-6 flex justify-center items-center shrink-0 z-10 no-print">
          <div className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
            Built by <a href="https://swanlakedigital.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 transition-colors underline underline-offset-4 text-nowrap">Swan Lake Digital</a>
          </div>
        </footer>
      </main>
    </div>
  );

  function documentationView() {
    return (
      <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500 pb-32 max-w-7xl mx-auto">
        <div className={`p-8 rounded-[2rem] border-2 flex flex-col md:flex-row items-center gap-8 shadow-2xl transition-all duration-500 ${isOfflineMode ? 'bg-blue-600/10 border-blue-500/30 shadow-blue-950/40' : 'bg-orange-600/10 border-orange-500/30 shadow-orange-950/40'}`}>
          <div className={`p-5 rounded-3xl shadow-2xl shrink-0 ${isOfflineMode ? 'bg-blue-600' : 'bg-orange-600'}`}>
            {isOfflineMode ? <Database className="w-10 h-10 text-white" /> : <ShieldCheck className="w-10 h-10 text-white" />}
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{isOfflineMode ? 'Universal Dataset Active' : 'Simulation Mode Active'}</h4>
            <p className="text-slate-400 text-lg leading-relaxed">
              ProfitGuard is currently auditing data using your <strong>{Math.round(userCogs * 100)}% COGS</strong> model. 
              {isOfflineMode ? ' Our parser has normalized your multi-platform data into a unified dashboard.' : ' You are in a safe sandbox connected via simulated API.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 flex flex-col shadow-lg hover:border-emerald-500/30 transition-all group">
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Calculator className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-4">1. Define Economics</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Ad platforms only know what you spend. ProfitGuard needs to know what it <strong>costs</strong> to sell.
            </p>
            <div className="space-y-3 mt-auto">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[9px] font-black text-emerald-400 shrink-0 mt-0.5">✓</div>
                <p className="text-[11px] text-slate-300">Set <strong>Universal COGS</strong></p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 flex flex-col shadow-lg hover:border-blue-500/30 transition-all group">
            <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-4">2. Platform Agnostic</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Upload a standard CSV from Meta, TikTok, or Google Ads. We auto-detect column names.
            </p>
            <div className="space-y-3 mt-auto">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Smart Parsing</p>
                <p className="text-[10px] text-slate-400">Normalizes headers like 'Amount Spent' and 'Value'.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 flex flex-col shadow-lg hover:border-orange-500/30 transition-all group">
            <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-orange-500/20 group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-4">3. Run Action Plan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              The AI Advisor identifies waste and platform arbitrage. Copy a formatted report instantly.
            </p>
            <div className="space-y-3 mt-auto">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[9px] font-black text-orange-400 shrink-0 mt-0.5">✓</div>
                <p className="text-[11px] text-slate-300">Copy <strong>Formatted Report</strong></p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 flex flex-col shadow-lg hover:border-emerald-500/30 transition-all group">
            <div className="bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-4">4. Multi-Platform</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Protect your business cashflow regardless of where you buy your traffic.
            </p>
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-center">
              <p className="text-[9px] text-slate-600 uppercase mb-2">Unified Defense</p>
              <div className="text-emerald-500 font-bold text-xs">
                Enabled for All Ads
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] p-12 border border-slate-800 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-orange-600/10 transition-colors duration-1000"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6 text-orange-500">
                <Zap className="w-8 h-8 fill-current" />
                <span className="text-xs font-black uppercase tracking-[0.4em]">Integrated Advisor</span>
              </div>
              <h3 className="text-4xl font-black text-white mb-6 leading-tight">Shareable Insights. <br/><span className="text-orange-600">Action Plan Report.</span></h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Advertising is a multiplier. The <strong>Action Plan</strong> acts as your automated strategist. Use the new <strong>Copy Report</strong> feature to paste formatted findings directly into emails for your team.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400 font-black text-xs"><Copy className="w-5 h-5" /></div>
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Shareable Reports</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 font-black text-xs"><Globe className="w-5 h-5" /></div>
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Cross-Platform</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-900/40"><FileText className="w-6 h-6 text-white" /></div>
                <h4 className="text-xl font-bold text-white">Strategy Tip</h4>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic mb-8 border-l-4 border-orange-600 pl-6 py-2">
                "Our normalized reports remove technical jargon. Instead of 'ROAS < 1.0', we tell your stakeholders: '[STOP] This campaign is actively losing money.' Clean business communication wins."
              </p>
              <button 
                onClick={() => setActiveView('action-plan')}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-950/20"
              >
                Go to Action Plan <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default App;