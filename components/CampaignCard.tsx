import React from 'react';
import { 
  Activity, 
  Pause, 
  AlertTriangle, 
  ShieldAlert, 
  Loader2,
  ShieldCheck,
  TrendingUp,
  ShieldBan
} from 'lucide-react';
import { Campaign, CampaignStatus, RiskLevel } from '../types';

interface CampaignCardProps {
  campaign: Campaign;
  onPause: (id: string) => void;
  isPausing?: boolean;
  isOffline?: boolean;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onPause, isPausing = false, isOffline = false }) => {
  const isNegative = campaign.margin < 0;
  const isPaused = campaign.status === CampaignStatus.PAUSED;
  
  // Calculate profit per dollar earned for the conversational success note
  const profitPerDollar = campaign.revenue > 0 ? (campaign.margin / campaign.revenue).toFixed(2) : "0.00";

  return (
    <div className={`h-full flex flex-col relative bg-slate-900 rounded-2xl border transition-all duration-500 ${isPaused ? 'opacity-60 grayscale bg-slate-950 border-slate-800' : 'hover:shadow-2xl hover:shadow-orange-900/10 shadow-sm'} ${isNegative && !isPaused ? 'border-orange-500/50 ring-1 ring-orange-500/20' : 'border-slate-800'}`}>
      
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="font-bold text-slate-100 text-lg truncate flex-1" title={campaign.name}>
            {campaign.name}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {campaign.riskLevel === RiskLevel.HIGH && !isPaused && !isPausing && (
              <ShieldAlert className="w-4 h-4 text-orange-500 animate-pulse" />
            )}
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-500 border ${
              isPaused ? 'bg-slate-800 text-slate-400 border-slate-700' : isNegative ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              {campaign.status === CampaignStatus.PAUSED ? 'Paused' : 'Active'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 space-y-1">
          <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            ROAS: <span className="text-white">{campaign.roas.toFixed(2)}x</span>
          </p>
          <p className="text-[10px] text-slate-500 italic">Revenue earned for every $1 spent.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 bg-slate-950/30">
        <div className="p-4">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Spend</p>
          <p className="font-bold text-slate-100 text-lg">${campaign.spend.toLocaleString()}</p>
          <p className="text-[9px] text-slate-500 leading-tight mt-1">Total budget used.</p>
        </div>
        <div className="p-4">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Sales</p>
          <p className="font-bold text-slate-100 text-lg">${campaign.revenue.toLocaleString()}</p>
          <p className="text-[9px] text-slate-500 leading-tight mt-1">Total sales generated.</p>
        </div>
        <div className="p-4">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Real Profit</p>
          <p className={`font-bold text-lg transition-colors duration-500 ${isPaused ? 'text-slate-600' : isNegative ? 'text-orange-500' : 'text-emerald-400'}`}>
            {isNegative && !isPaused ? '-' : ''}${Math.abs(campaign.margin).toLocaleString()}
          </p>
          <p className="text-[9px] text-slate-500 leading-tight mt-1">Net profit generated.</p>
        </div>
      </div>

      {/* Conversational Explanation Section */}
      <div className="p-6 flex-grow">
        <div className={`p-4 rounded-xl flex gap-3 h-full transition-colors duration-500 border ${
          isPaused ? 'bg-slate-950 text-slate-500 border-slate-800' :
          isNegative ? 'bg-orange-500/5 text-orange-400 border-orange-500/10' : 
          'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
        }`}>
          {isPaused ? <ShieldCheck className="w-5 h-5 shrink-0" /> : isNegative ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <TrendingUp className="w-5 h-5 shrink-0" />}
          <div className="text-sm font-medium leading-relaxed">
            {isPaused ? (
              "Campaign protection active. Ad spend has been stopped to save your margins."
            ) : isNegative ? (
              <span>
                Warning: You are spending <strong>${campaign.spend.toLocaleString()}</strong> but after product costs, you are losing <strong>-${Math.abs(campaign.margin).toLocaleString()}</strong>.
              </span>
            ) : (
              <span>
                Great job! You are keeping <strong>${profitPerDollar}</strong> of profit for every dollar earned.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 bg-slate-900 rounded-b-2xl flex flex-col items-end border-t border-slate-800">
        {!isPaused && isNegative ? (
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => onPause(campaign.id)}
              disabled={isPausing || isOffline}
              title={isOffline ? "This feature requires a live API connection. Currently analyzing static CSV data." : ""}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${
                isPausing || isOffline
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 grayscale' 
                : 'bg-orange-600 hover:bg-orange-500 text-white animate-pulse-orange shadow-orange-950/20 active:scale-95'
              }`}
            >
              {isPausing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : isOffline ? (
                <>
                  <ShieldBan className="w-4 h-4" />
                  Disconnected
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  Stop Loss
                </>
              )}
            </button>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mr-2">
              {isOffline ? "API connection required" : "Stops spend immediately."}
            </span>
          </div>
        ) : !isPaused ? (
          <button
            onClick={() => onPause(campaign.id)}
            disabled={isPausing || isOffline}
            title={isOffline ? "This feature requires a live API connection. Currently analyzing static CSV data." : ""}
            className={`flex items-center gap-2 text-slate-500 hover:text-orange-400 px-4 py-2 font-black text-[10px] uppercase tracking-[0.2em] transition-colors ${
              isPausing || isOffline ? 'opacity-50 cursor-not-allowed grayscale' : ''
            }`}
          >
            {isPausing ? <Loader2 className="w-4 h-4 animate-spin" /> : isOffline ? <ShieldBan className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPausing ? 'Processing...' : isOffline ? 'API Disconnected' : 'Pause Campaign'}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            Loss Protected
          </div>
        )}
      </div>
    </div>
  );
};