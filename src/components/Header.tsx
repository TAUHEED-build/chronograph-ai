import React from 'react';
import { 
  GitBranch, 
  Sparkles, 
  RotateCcw, 
  Code2, 
  Cpu, 
  Layers
} from 'lucide-react';

interface HeaderProps {
  useCloudGemini: boolean;
  setUseCloudGemini: (val: boolean) => void;
  apiConnected: boolean;
  onReset: () => void;
  onOpenJson: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  useCloudGemini,
  setUseCloudGemini,
  apiConnected,
  onReset,
  onOpenJson,
  isProcessing,
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
          <GitBranch className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              ChronoGraph <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI</span>
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              v2.4-PRO
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Temporal Graph Memory Engine &amp; Context Drift Analyzer
          </p>
        </div>
      </div>

      {/* Engine Controls & Badges */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Engine mode switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setUseCloudGemini(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              useCloudGemini
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Google Gemini 3.8-Flash Server API"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Gemini 3.8</span>
          </button>
          <button
            type="button"
            onClick={() => setUseCloudGemini(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium ${
              !useCloudGemini
                ? 'bg-slate-700 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Instant Local Heuristic Graph Parser"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Local Engine</span>
          </button>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              useCloudGemini 
                ? (apiConnected ? 'bg-emerald-400' : 'bg-amber-400')
                : 'bg-cyan-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              useCloudGemini 
                ? (apiConnected ? 'bg-emerald-500' : 'bg-amber-500')
                : 'bg-cyan-500'
            }`} />
          </div>
          <span className="font-mono text-slate-300 text-[11px] hidden sm:inline">
            {useCloudGemini 
              ? (apiConnected ? 'Gemini 3.8 Live' : 'Cloud Ready') 
              : 'Local Fallback'}
          </span>
        </div>

        {/* View JSON button */}
        <button
          type="button"
          onClick={onOpenJson}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          title="Inspect Extracted Raw JSON"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Raw JSON</span>
        </button>

        {/* Reset State button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors disabled:opacity-50"
          title="Reset Graph State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
