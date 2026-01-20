import React, { useMemo, useState } from 'react';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Ban,
  Globe,
  CheckCircle2,
  FileText,
  Info,
  LayoutGrid,
  Lightbulb,
  Copy,
  X
} from 'lucide-react';
import { Campaign } from '../types';

interface ActionPlanViewProps {
  campaigns: Campaign[];
  userCogs: number;
  onShowToast: (msg: string) => void;
}

interface InsightCardProps {
  category: 'kill' | 'strategy' | 'shift';
  title: string;
  campaign?: string;
  body: string;
  why: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ category, title, campaign, body, why }) => {
  const [showWhy, setShowWhy] = useState(false);

  const styles = {
    kill: {
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      iconBg: 'bg-red-500',
      icon: Ban
    },
    strategy: {
      bg: 'bg-yellow-500/5',
      border: 'border-yellow-500/20',
      iconBg: 'bg-yellow-500',
      icon: AlertTriangle
    },
    shift: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      iconBg: 'bg-blue-500',
      icon: Globe
    }
  }[category];

  const Icon = styles.icon;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 mb-6 animate-in slide-in-from-bottom-4 duration-300 shadow-sm relative overflow-hidden group">
      <div className={`${styles.bg} absolute inset-0 pointer-events-none`}></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex gap-4">
            <div className={`${styles.iconBg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/20`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">{title}</h4>
              {campaign && <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Source: {campaign}</p>}
            </div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:block">
            Priority Action
          </div>
        </div>

        <p className="text-slate-300 text-base leading-relaxed mb-6 font-medium">
          {body}
        </p>

        <div className="pt-6 border-t border-slate-800/50 flex flex-col gap-4">
          <button 
            onMouseEnter={() => setShowWhy(true)}
            onMouseLeave={() => setShowWhy(false)}
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors w-fit group/why"
          >
            <HelpCircle className="w-4 h-4 group-hover/why:text-orange-500 transition-colors" />
            Why is this happening?
            {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showWhy && (
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-xs text-slate-400 leading-loose italic flex gap-3">
                <Info className="w-4 h-4 text-orange-500 shrink-0" />
                {why}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({ campaigns, userCogs, onShowToast }) => {
  const [showModal, setShowModal] = useState(false);

  const insights = useMemo(() => {
    const list: InsightCardProps[] = [];

    campaigns.forEach(c => {
      if (c.margin < 0 || (c.spend > 500 && c.roas < 1.0)) {
        list.push({
          category: 'kill',
          title: "🛑 Stop Bleeding Money",
          campaign: c.name,
          body: `${c.name} has lost $${Math.abs(Math.round(c.margin)).toLocaleString()} in real profit. Pause this immediately to stop the drain.`,
          why: "When you pay $5 to make a sale that only profits $3, you lose $2 every time. It is better to have 0 sales than negative sales. Each click on this campaign is actively shrinking your bank account."
        });
      }
    });

    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
    const totalMargin = campaigns.reduce((s, c) => s + c.margin, 0);
    const globalEfficiency = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

    if (userCogs > 0.6 && globalEfficiency < 40) {
      list.push({
        category: 'strategy',
        title: "💡 Pricing Problem Detected",
        body: `Your Global Efficiency (${Math.round(globalEfficiency)}%) is too low. Your product costs are too high to support your current ad spend.`,
        why: "Advertising is a multiplier. If your unit economics are broken (low margin), scaling ads will only multiply your losses faster. You cannot 'spend your way' out of high inventory costs."
      });
    }

    campaigns.forEach(c => {
      if (c.spend > 1000 && c.roas < 2.0) {
        list.push({
          category: 'shift',
          title: "📢 Move This Budget",
          campaign: c.name,
          body: `The CPA for ${c.name} is unsustainable. Consider moving this budget to visual platforms (Meta/TikTok) for est. 60% lower costs.`,
          why: "Competitive intent keywords are expensive. If the cost-per-click eats all your profit, you must move to interruptive marketing (Social) where attention is currently undervalued compared to search intent."
        });
      }
    });

    return list;
  }, [campaigns, userCogs]);

  const reportText = useMemo(() => {
    const date = new Date().toLocaleDateString();
    let text = `PROFITGUARD AUDIT REPORT\nDate: ${date}\n----------------------------------------\n\n`;

    const kills = insights.filter(i => i.category === 'kill');
    if (kills.length > 0) {
      text += `1. IMMEDIATE ACTIONS (STOP LOSS)\n`;
      kills.forEach(i => {
        text += `- [STOP] ${i.body}\n`;
      });
      text += `\n`;
    }

    const strategies = insights.filter(i => i.category === 'strategy');
    if (strategies.length > 0) {
      text += `2. BUSINESS STRATEGY\n`;
      strategies.forEach(i => {
        text += `- [ALERT] ${i.body}\n`;
      });
      text += `\n`;
    }

    const shifts = insights.filter(i => i.category === 'shift');
    if (shifts.length > 0) {
      text += `3. OPPORTUNITIES\n`;
      shifts.forEach(i => {
        text += `- [MOVE] ${i.body}\n`;
      });
      text += `\n`;
    }

    text += `----------------------------------------\nGenerated by ProfitGuard AI`;
    return text;
  }, [insights]);

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      onShowToast("✅ Report copied! Ready to paste into email or docs.");
    } catch (err) {
      setShowModal(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-in fade-in duration-500">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-orange-600/20 p-3 rounded-2xl border border-orange-500/20 shadow-lg shadow-orange-950/20">
            <ClipboardCheck className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Action Plan</h2>
            <p className="text-slate-500 text-sm">Automated audit report & prioritized checklist for your business.</p>
          </div>
        </div>
        <div className="h-px bg-slate-800 w-full mt-8 opacity-50"></div>
      </header>

      {insights.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-24 text-center flex flex-col items-center shadow-inner">
          <div className="bg-emerald-500/10 p-6 rounded-full border border-emerald-500/20 mb-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Account is Healthy</h3>
          <p className="text-slate-500 max-w-md leading-relaxed">No critical waste or unit-economic flaws detected. Your current COGS model is effectively supported by your ad performance.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-10 text-slate-400">
            <Info className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest">{insights.length} Critical Observations Found</span>
          </div>
          {insights.map((insight, idx) => (
            <InsightCard key={idx} {...insight} />
          ))}
        </div>
      )}

      <div className="mt-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-10 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20">
                <LayoutGrid className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Industry Cost Benchmarks</h4>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Efficiency Reference</p>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Google Search</p>
                  <p className="text-xl font-bold text-white mb-1">High Cost ($$$)</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase">High Intent</p>
              </div>
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Meta (FB/IG)</p>
                  <p className="text-xl font-bold text-white mb-1">Medium Cost ($$)</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase">Discovery</p>
              </div>
              <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-3">TikTok</p>
                  <p className="text-xl font-bold text-white mb-1">Low Cost ($)</p>
                  <p className="text-[10px] text-pink-400 font-bold uppercase">Viral / Volume</p>
              </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4 items-start">
              <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300 leading-relaxed italic">
                <strong>Strategic Advice:</strong> If your Google CPA is higher than your profit margin, consider shifting budget to visual platforms where CPCs are currently undervalued.
              </p>
          </div>
      </div>

      <div className="mt-16 bg-slate-950/80 rounded-[2rem] border-2 border-slate-800 border-dashed p-10 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="text-center md:text-left">
          <p className="text-white font-black text-lg mb-2 uppercase tracking-tight">Report Distribution</p>
          <p className="text-slate-500 text-xs uppercase tracking-[0.2em] font-black">
            Status: {insights.length > 0 ? <span className="text-orange-500">Action Required</span> : <span className="text-emerald-500">Optimal</span>}
          </p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            <FileText className="w-4 h-4" />
            Preview Text
          </button>
           <button 
            onClick={handleCopyReport}
            className="flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-950/20 active:scale-95"
          >
            <Copy className="w-4 h-4" />
            Copy Formatted Report
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-3xl overflow-hidden relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-10">
              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-tight">Audit Report Preview</h3>
              <textarea 
                readOnly
                value={reportText}
                className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-slate-300 font-mono text-sm leading-relaxed resize-none focus:outline-none scrollbar-hide"
              />
              <div className="mt-8 flex justify-end gap-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(reportText);
                    onShowToast("✅ Report copied!");
                    setShowModal(false);
                  }}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};