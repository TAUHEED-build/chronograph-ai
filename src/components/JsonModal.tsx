import React, { useState } from 'react';
import { X, Copy, Check, Download, FileJson, Sparkles } from 'lucide-react';
import { TemporalGraphResult } from '../types/chronograph';

interface JsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  graphData: TemporalGraphResult;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen,
  onClose,
  graphData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Clean schema-compliant JSON matching exact system rules
  const cleanJsonData = {
    metrics: {
      context_drift_score: graphData.metrics.context_drift_score,
      memory_decay_percentage: graphData.metrics.memory_decay_percentage,
      active_nodes_count: graphData.metrics.active_nodes_count,
      decayed_nodes_count: graphData.metrics.decayed_nodes_count,
      drift_level: graphData.metrics.drift_level,
      analysis_summary: graphData.metrics.analysis_summary,
    },
    nodes: graphData.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      category: n.category,
      step: n.step,
      timestamp: n.timestamp,
      validUntil: n.validUntil,
      status: n.status,
      description: n.description,
      driftImpact: n.driftImpact,
      metadata: n.metadata,
    })),
    edges: graphData.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      relationship: e.relationship,
      time_window: {
        created_at: e.time_window.created_at,
        valid_until: e.time_window.valid_until,
      },
      stepCreated: e.stepCreated,
      stepExpired: e.stepExpired,
    })),
    timeline: graphData.timeline,
  };

  const jsonString = JSON.stringify(cleanJsonData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronograph_temporal_graph_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl max-h-[88vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Raw Temporal Knowledge Graph JSON
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Strict Schema Output
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Machine-readable format containing temporal nodes, decaying edges, and drift metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-cyan-300/90 leading-relaxed selection:bg-cyan-500/30">
          <pre className="whitespace-pre">{jsonString}</pre>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Nodes: <strong className="text-white font-mono">{cleanJsonData.nodes.length}</strong></span>
            <span>Edges: <strong className="text-white font-mono">{cleanJsonData.edges.length}</strong></span>
            <span>Drift Score: <strong className="text-cyan-400 font-mono">{cleanJsonData.metrics.context_drift_score}</strong></span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            Compliant with Temporal Knowledge Graph Specification
          </span>
        </div>
      </div>
    </div>
  );
};
