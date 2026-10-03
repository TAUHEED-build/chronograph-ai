import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Hash, 
  Info, 
  Tag, 
  Activity, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { TemporalNode, TemporalEdge } from '../types/chronograph';
import { CATEGORY_COLORS } from './GraphCanvas';

interface NodeDrawerProps {
  node: TemporalNode | null;
  onClose: () => void;
  allNodes: TemporalNode[];
  edges: TemporalEdge[];
  onSelectNode: (node: TemporalNode) => void;
}

export const NodeDrawer: React.FC<NodeDrawerProps> = ({
  node,
  onClose,
  allNodes,
  edges,
  onSelectNode,
}) => {
  if (!node) return null;

  const isDecayed = node.status === 'decayed' || node.status === 'superseded';
  const catColor = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Action;

  // Find incoming and outgoing edges
  const incomingEdges = edges.filter((e) => e.target === node.id);
  const outgoingEdges = edges.filter((e) => e.source === node.id);

  const getNodeById = (id: string) => allNodes.find((n) => n.id === id);

  return (
    <div className="absolute top-0 right-0 w-full sm:w-[380px] xl:w-[420px] h-full bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-30 flex flex-col animate-slide-left overflow-y-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: catColor.bg,
                color: catColor.text,
                border: `1px solid ${catColor.border}`,
              }}
            >
              {node.category}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                isDecayed
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {node.status}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              T{node.step}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
            {node.label}
          </h2>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            ID: {node.id}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close Inspector"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 space-y-5 flex-1">
        {/* Description */}
        {node.description && (
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/90 text-xs text-slate-300 leading-relaxed">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Context &amp; Entity Intent
            </span>
            {node.description}
          </div>
        )}

        {/* Temporal Validity Window Box */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              Temporal Lifespan Window
            </span>
            {isDecayed ? (
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                EXPIRED / SUPERSEDED
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                ACTIVE IN RUNTIME
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">Created At</span>
              <span className="text-slate-200 font-semibold">{node.timestamp}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase block">Valid Until</span>
              <span className={isDecayed ? 'text-rose-400 font-semibold' : 'text-cyan-300 font-semibold'}>
                {node.validUntil}
              </span>
            </div>
          </div>

          {/* Temporal Decay Progress */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Memory Freshness:</span>
              <span className={isDecayed ? 'text-rose-400' : 'text-emerald-400'}>
                {isDecayed ? '100% Stale (Decayed)' : 'Live Anchor'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isDecayed ? 'bg-rose-500 w-full' : 'bg-gradient-to-r from-cyan-400 to-emerald-400 w-full'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Drift Impact Metric */}
        {node.driftImpact !== undefined && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-medium text-slate-300 block">
                  Context Drift Contribution
                </span>
                <span className="text-[10px] text-slate-500">
                  Impact on overall session goal deviation
                </span>
              </div>
            </div>
            <span className="text-sm font-bold font-mono text-cyan-300 px-2 py-1 rounded bg-slate-800 border border-slate-700">
              {(node.driftImpact * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Connected Edges & Relationships */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Knowledge Graph Connections
          </div>

          {/* Outgoing */}
          {outgoingEdges.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-cyan-400" />
                Outgoing ({outgoingEdges.length})
              </span>
              <div className="space-y-1.5">
                {outgoingEdges.map((e) => {
                  const targetNode = getNodeById(e.target);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => targetNode && onSelectNode(targetNode)}
                      className="w-full p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 text-left transition-all group flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 block">
                          ───[{e.relationship}]───&gt;
                        </span>
                        <span className="text-xs text-slate-200 font-medium truncate block group-hover:text-cyan-300">
                          {targetNode?.label || e.target}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {e.time_window.valid_until === 'forever' ? '∞' : e.time_window.valid_until}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Incoming */}
          {incomingEdges.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                <ArrowLeft className="w-3 h-3 text-indigo-400" />
                Incoming ({incomingEdges.length})
              </span>
              <div className="space-y-1.5">
                {incomingEdges.map((e) => {
                  const sourceNode = getNodeById(e.source);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => sourceNode && onSelectNode(sourceNode)}
                      className="w-full p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 text-left transition-all group flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-400 block">
                          &lt;───[{e.relationship}]───
                        </span>
                        <span className="text-xs text-slate-200 font-medium truncate block group-hover:text-indigo-300">
                          {sourceNode?.label || e.source}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {e.time_window.valid_until === 'forever' ? '∞' : e.time_window.valid_until}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Entity Metadata Key-Value */}
        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-cyan-400" />
              Entity Attributes
            </div>
            <div className="divide-y divide-slate-800/80 text-xs font-mono">
              {Object.entries(node.metadata).map(([k, v]) => (
                <div key={k} className="py-1.5 flex justify-between gap-2">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-slate-200 text-right font-medium">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
