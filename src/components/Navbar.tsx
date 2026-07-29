import React from 'react';
import { Radar, Target, DollarSign, Download, Sparkles, MapPin, RefreshCw } from 'lucide-react';
import { Business } from '../types';
import { CurrencyCode, CURRENCIES } from '../utils/currency';

interface NavbarProps {
  discoveredLeads: Business[];
  isScanning: boolean;
  currency: CurrencyCode;
  onOpenExport: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  discoveredLeads,
  isScanning,
  currency,
  onOpenExport,
  onResetData
}) => {
  const targetLeads = discoveredLeads.filter(b => b.status === 'NO_WEBSITE');
  const highValueLeads = targetLeads.filter(b => b.leadTier === 'HIGH_VAL');
  
  const totalPipelineValue = targetLeads.reduce((acc, curr) => acc + curr.estWebsiteValue, 0);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Radar className={`w-6 h-6 text-slate-950 ${isScanning ? 'animate-spin' : ''}`} />
            </div>
            {isScanning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                BizRadar
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              Nearby Business Scanner & Lead Hunter
            </p>
          </div>

          <button
            onClick={onResetData}
            className="md:hidden text-xs text-slate-400 hover:text-slate-200 p-2 rounded-lg bg-slate-800"
            title="Reset Discovered Leads"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Metrics Counter Widgets */}
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto py-1 no-scrollbar">
          
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 min-w-fit">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Targets Discovered</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold text-white">{targetLeads.length}</span>
                <span className="text-[10px] text-amber-400 font-semibold">({highValueLeads.length} 🔥 High Val)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 min-w-fit">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Potential Website Revenue</p>
              <span className="text-sm font-bold text-emerald-400">
                {totalPipelineValue.toLocaleString()} {CURRENCIES[currency].symbol}
              </span>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onResetData}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
            title="Clear list and start fresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            onClick={onOpenExport}
            disabled={targetLeads.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Coordinates ({targetLeads.length})
          </button>
        </div>

      </div>
    </header>
  );
};
