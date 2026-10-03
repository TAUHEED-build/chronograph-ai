import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  AlertTriangle, 
  Layers, 
  Clock, 
  TrendingUp, 
  FileText, 
  Activity, 
  CheckCircle2, 
  ShieldAlert, 
  Flame,
  ArrowRight,
  Database
} from 'lucide-react';
import { GraphMetrics } from '../types/chronograph';
import { LOG_PRESETS, LogPreset } from '../utils/presets';

interface ControlPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  onExtract: () => void;
  isProcessing: boolean;
  metrics: GraphMetrics;
  useCloudGemini: boolean;
  stageMessage: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  inputText,
  setInputText,
  onExtract,
  isProcessing,
  metrics,
  useCloudGemini,
  stageMessage,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('saas_pivot_deploy');

  const handleSelectPreset = (preset: LogPreset) => {
    setSelectedPresetId(preset.id);
    setInputText(preset.text);
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to extract
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isProcessing && inputText.trim()) {
          onExtract();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, inputText, onExtract]);

  // Determine drift warning colors
  const driftScore = metrics.context_drift_score;
  let driftBadgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  let driftBarColor = 'from-emerald-500 to-teal-400';
  let driftLabel = 'LOW DRIFT';

  if (driftScore >= 0.75) {
    driftBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    driftBarColor = 'from-orange-500 via-rose-500 to-red-600';
    driftLabel = 'CRITICAL DRIFT';
  } else if (driftScore >= 0.45) {
    driftBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    driftBarColor = 'from-amber-500 to-orange-500';
    driftLabel = 'MODERATE DRIFT';
  }

  return (
    <div className="w-full lg:w-[420px] xl:w-[460px] h-full flex flex-col bg-slate-900/60 border-r border-slate-800/80 p-4 lg:p-5 overflow-y-auto shrink-0 space-y-5">
      {/* Section 1: Presets & Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-400" />
            Unstructured Log Input
          </label>
          <span className="text-[11px] font-mono text-slate-400">
            {inputText.length} chars
          </span>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {LOG_PRESETS.map((p) => {
            const isSelected = p.id === selectedPresetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-all text-left font-medium ${
                  isSelected
                    ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {p.id === 'complex_agent_execution' ? (
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-indigo-400" />
                    Load Complex Log
                  </span>
                ) : (
                  p.title.split('(')[0]
                )}
              </button>
            );
          })}
        </div>

        {/* Textarea */}
        <div className="relative rounded-xl border border-slate-700/80 bg-slate-950/70 p-1 focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:border-cyan-500/80 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setSelectedPresetId('');
            }}
            placeholder="Paste messy agent logs, timestamps, goal redirects, or chat history here..."
            rows={5}
            className="w-full bg-transparent p-2.5 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between px-2.5 py-1.5 border-t border-slate-800/60 bg-slate-900/40 rounded-b-lg text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Temporal Parser: {useCloudGemini ? 'Gemini 3.8' : 'Local Engine'}
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              Press Ctrl+Enter to Run
            </span>
          </div>
        </div>

        {/* Run Extraction Button */}
        <button
          type="button"
          onClick={onExtract}
          disabled={isProcessing || !inputText.trim()}
          className="relative w-full overflow-hidden group rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 p-[1px] font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-cyan-500/30 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-[11px] bg-slate-950/60 backdrop-blur-sm group-hover:bg-transparent transition-all">
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-cyan-400 rounded-full animate-spin" />
                <span className="text-xs font-medium text-cyan-200">
                  {stageMessage || 'Synthesizing Temporal Graph...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs tracking-wide">
                  EXTRACT TEMPORAL GRAPH
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </div>
        </button>

        {/* Simulated Stage Telemetry if Processing */}
        {isProcessing && (
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-cyan-300">
              <span className="font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                Extraction Pipeline Active
              </span>
              <span className="font-mono text-[10px] text-cyan-400/80">Gemini-Engine</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 animate-pulse rounded-full w-3/4" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {stageMessage}
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Metrics Dashboard */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Temporal Drift &amp; Memory Metrics
          </label>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono ${driftBadgeColor}`}>
            {driftLabel}
          </span>
        </div>

        {/* Metric Card 1: Context Drift Score */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Context Drift Score
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-white tracking-tight">
                  {(metrics.context_drift_score * 100).toFixed(0)}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({metrics.context_drift_score.toFixed(2)} / 1.00)
                </span>
              </div>
            </div>
            <div className={`p-2 rounded-lg ${metrics.context_drift_score > 0.6 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {metrics.context_drift_score > 0.6 ? (
                <Flame className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
          </div>

          {/* Drift score progress bar */}
          <div className="mt-3 space-y-1">
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${driftBarColor} transition-all duration-700`}
                style={{ width: `${Math.min(100, Math.max(5, metrics.context_drift_score * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
              <span>Goal Aligned (0.0)</span>
              <span>Divergent (1.0)</span>
            </div>
          </div>
        </div>

        {/* Metric Cards Row: Active Nodes vs Memory Decay Rate */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Nodes Count */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Active Nodes
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-cyan-300">
                {metrics.active_nodes_count}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                / {metrics.active_nodes_count + metrics.decayed_nodes_count} total
              </span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              {metrics.decayed_nodes_count} stale/decayed
            </div>
          </div>

          {/* Memory Decay Rate */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Memory Decay
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-amber-300">
                {metrics.memory_decay_percentage.toFixed(0)}%
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                loss
              </span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Superseded context
            </div>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            Executive Synthesis
          </div>
          <p className="text-slate-300 text-xs leading-relaxed font-sans">
            {metrics.analysis_summary}
          </p>
        </div>
      </div>
    </div>
  );
};
