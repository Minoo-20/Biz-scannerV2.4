import React, { useEffect, useRef } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Crosshair, Pause, Play } from 'lucide-react';
import { ScanLog, Business } from '../types';

interface RadarTerminalProps {
  logs: ScanLog[];
  isScanning: boolean;
  scanProgress: number; // 0 to 100
  totalInspected: number;
  skippedCount: number;
  targetsFound: number;
  currentCheckingName?: string;
  onClearLogs: () => void;
}

export const RadarTerminal: React.FC<RadarTerminalProps> = ({
  logs,
  isScanning,
  scanProgress,
  totalInspected,
  skippedCount,
  targetsFound,
  currentCheckingName,
  onClearLogs
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of log stream
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono shadow-2xl flex flex-col h-full min-h-[360px]">
      
      {/* Terminal Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-xs font-semibold text-slate-300 ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Scanner Feed & Verification Engine
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">
            Status: {isScanning ? <span className="text-emerald-400 font-bold animate-pulse">ACTIVE SWEEP</span> : <span className="text-slate-500">IDLE</span>}
          </span>
          <button
            onClick={onClearLogs}
            className="text-slate-500 hover:text-slate-300 transition-colors underline text-[10px]"
          >
            Clear Log
          </button>
        </div>
      </div>

      {/* Progress & Live Inspection Bar */}
      {isScanning && (
        <div className="py-2.5 px-3 bg-slate-900/90 rounded-xl my-2 border border-slate-800">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              Checking: <span className="text-amber-300 font-semibold">{currentCheckingName || 'Analyzing Sector...'}</span>
            </span>
            <span className="text-emerald-400 font-bold">{Math.round(scanProgress)}%</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Live Metrics Mini Bar */}
      <div className="grid grid-cols-3 gap-2 my-2 text-center text-xs">
        <div className="bg-slate-900/80 border border-slate-800 py-1.5 px-2 rounded-xl">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Checked</p>
          <p className="text-sm font-bold text-slate-200">{totalInspected}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 py-1.5 px-2 rounded-xl">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Skipped (Has Web)</p>
          <p className="text-sm font-bold text-slate-500">{skippedCount}</p>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-500/30 py-1.5 px-2 rounded-xl">
          <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Targets (No Web)</p>
          <p className="text-sm font-bold text-emerald-400">{targetsFound}</p>
        </div>
      </div>

      {/* Streamed Log Output */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] leading-relaxed my-1 max-h-[260px] min-h-[180px]"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-8">
            <Crosshair className="w-8 h-8 opacity-40" />
            <p className="text-xs">Scanner standing by. Press "Launch Radar Scan" to begin scanning nearby businesses.</p>
          </div>
        ) : (
          logs.map((log) => {
            let badgeBg = 'bg-slate-800 text-slate-300';
            let icon = null;

            if (log.type === 'success') {
              badgeBg = 'text-emerald-400 font-semibold';
              icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />;
            } else if (log.type === 'skip') {
              badgeBg = 'text-slate-500';
              icon = <XCircle className="w-3.5 h-3.5 text-slate-600 inline shrink-0" />;
            } else if (log.type === 'alert') {
              badgeBg = 'text-amber-400 font-bold';
              icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline shrink-0" />;
            }

            return (
              <div key={log.id} className={`flex items-start gap-2 py-0.5 border-b border-slate-900/50 ${badgeBg}`}>
                <span className="text-[10px] text-slate-600 shrink-0 font-mono">[{log.timestamp}]</span>
                <span className="mt-0.5">{icon}</span>
                <span className="break-all">{log.message}</span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
