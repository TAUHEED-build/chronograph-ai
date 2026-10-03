import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  Eye, 
  EyeOff, 
  Filter, 
  HelpCircle,
  Crosshair,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { TemporalNode, TemporalEdge, NodeCategory } from '../types/chronograph';

interface GraphCanvasProps {
  nodes: TemporalNode[];
  edges: TemporalEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: TemporalNode | null) => void;
  currentStep: number;
}

export const CATEGORY_COLORS: Record<NodeCategory, { bg: string; border: string; glow: string; text: string }> = {
  User: { bg: '#083344', border: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', text: '#67e8f9' },
  System: { bg: '#0c2a4d', border: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', text: '#7dd3fc' },
  Goal: { bg: '#064e3b', border: '#10b981', glow: 'rgba(16, 185, 129, 0.45)', text: '#6ee7b7' },
  Action: { bg: '#2e1065', border: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#d8b4fe' },
  Feature: { bg: '#312e81', border: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)', text: '#a5b4fc' },
  'API Key': { bg: '#451a03', border: '#f97316', glow: 'rgba(249, 115, 22, 0.45)', text: '#fdba74' },
  Deployment: { bg: '#134e4a', border: '#14b8a6', glow: 'rgba(20, 184, 166, 0.45)', text: '#5eead4' },
  Timestamp: { bg: '#3b0764', border: '#d946ef', glow: 'rgba(217, 70, 239, 0.4)', text: '#f0abfc' },
  Environment: { bg: '#172554', border: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)', text: '#93c5fd' },
  Risk: { bg: '#4c0519', border: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)', text: '#fda4af' },
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  currentStep,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Node dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Filters
  const [showDecayed, setShowDecayed] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Initialize physics-like layout positions in circular/force spread
  useEffect(() => {
    if (!nodes.length) return;

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.36;

    const newPos: Record<string, { x: number; y: number }> = {};
    
    // Sort nodes logically (by step or category)
    const sorted = [...nodes].sort((a, b) => a.step - b.step);
    
    sorted.forEach((node, i) => {
      // Keep existing dragged position if exists
      if (positions[node.id]) {
        newPos[node.id] = positions[node.id];
        return;
      }
      
      // Seed positions based on step and category
      if (node.id === 'node_user' || node.category === 'User') {
        newPos[node.id] = { x: centerX - 220, y: centerY - 80 };
      } else if (node.id === 'node_agent' || node.category === 'System') {
        newPos[node.id] = { x: centerX - 180, y: centerY + 140 };
      } else if (node.id === 'node_goal_saas') {
        newPos[node.id] = { x: centerX - 20, y: centerY - 140 };
      } else if (node.id === 'node_pivot_action') {
        newPos[node.id] = { x: centerX + 10, y: centerY };
      } else if (node.id === 'node_goal_security') {
        newPos[node.id] = { x: centerX + 140, y: centerY - 120 };
      } else if (node.id === 'node_deploy_vercel') {
        newPos[node.id] = { x: centerX + 220, y: centerY + 80 };
      } else {
        const angle = (i / sorted.length) * 2 * Math.PI;
        const r = radius * (0.7 + (i % 3) * 0.2);
        newPos[node.id] = {
          x: centerX + Math.cos(angle) * r,
          y: centerY + Math.sin(angle) * r,
        };
      }
    });

    setPositions(newPos);
  }, [nodes]);

  // Determine visibility of nodes based on time travel step & category filters
  const visibleNodes = useMemo(() => {
    return nodes.filter((node) => {
      // Step filter: node must have been born by or before currentStep
      if (node.step > currentStep) return false;

      // Decayed visibility filter
      const isExpired = node.status === 'decayed' || node.status === 'superseded';
      if (!showDecayed && isExpired) return false;

      // Category filter
      if (selectedCategoryFilter !== 'ALL' && node.category !== selectedCategoryFilter) {
        return false;
      }

      return true;
    });
  }, [nodes, currentStep, showDecayed, selectedCategoryFilter]);

  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);

  // Filter edges where both source and target are visible
  const visibleEdges = useMemo(() => {
    return edges.filter((e) => {
      if (!visibleNodeIds.has(e.source) || !visibleNodeIds.has(e.target)) return false;
      if (e.stepCreated > currentStep) return false;
      return true;
    });
  }, [edges, visibleNodeIds, currentStep]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (draggingNodeId) {
      // Dragging a specific node
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      setPositions((prev) => ({
        ...prev,
        [draggingNodeId]: { x: mouseX, y: mouseY },
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(2.5, Math.max(0.4, prev + delta)));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const uniqueCategories = useMemo(() => {
    const set = new Set(nodes.map((n) => n.category));
    return ['ALL', ...Array.from(set)];
  }, [nodes]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full w-full bg-[#080d18] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Overlay Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Category Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 shadow-xl pointer-events-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: Toggles & Zoom buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Toggle Decayed Nodes */}
          <button
            type="button"
            onClick={() => setShowDecayed(!showDecayed)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md transition-all ${
              showDecayed
                ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                : 'bg-amber-950/40 border-amber-600/40 text-amber-300'
            }`}
            title="Toggle Visibility of Decayed/Expired Nodes"
          >
            {showDecayed ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-amber-400" />}
            <span>{showDecayed ? 'Decayed Nodes Visible' : 'Decayed Hidden'}</span>
          </button>

          {/* Zoom In/Out/Reset */}
          <div className="flex items-center bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-xl">
            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1.5">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800 mx-1" />
            <button
              type="button"
              onClick={handleResetView}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Reset View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Simulator */}
      <svg
        id="canvas-bg"
        className="w-full h-full"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.08) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      >
        <defs>
          {/* Arrowhead marker for active edges */}
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="26"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#38bdf8" />
          </marker>

          {/* Arrowhead for decayed edges */}
          <marker
            id="arrow-decayed"
            viewBox="0 0 10 10"
            refX="26"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 2 L 8 5 L 0 8 z" fill="#ef4444" opacity="0.6" />
          </marker>

          {/* Drop glow filter */}
          <filter id="node-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pan and Zoom Group */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Edges */}
          {visibleEdges.map((edge) => {
            const srcPos = positions[edge.source];
            const tgtPos = positions[edge.target];
            if (!srcPos || !tgtPos) return null;

            const isDecayed = edge.decayed || (edge.stepExpired && edge.stepExpired <= currentStep);
            const isHovered = hoveredNodeId === edge.source || hoveredNodeId === edge.target;
            const isSelected = selectedNodeId === edge.source || selectedNodeId === edge.target;

            // Compute midpoint for relationship label
            const midX = (srcPos.x + tgtPos.x) / 2;
            const midY = (srcPos.y + tgtPos.y) / 2;
            const angle = Math.atan2(tgtPos.y - srcPos.y, tgtPos.x - srcPos.x) * (180 / Math.PI);

            return (
              <g key={edge.id} className="transition-opacity duration-300">
                {/* Edge line */}
                <line
                  x1={srcPos.x}
                  y1={srcPos.y}
                  x2={tgtPos.x}
                  y2={tgtPos.y}
                  stroke={isDecayed ? '#ef4444' : (isSelected || isHovered ? '#38bdf8' : '#334155')}
                  strokeWidth={isSelected || isHovered ? 2.5 : (isDecayed ? 1.5 : 2)}
                  strokeDasharray={isDecayed ? '4,4' : undefined}
                  opacity={isDecayed ? 0.45 : (isSelected || isHovered ? 1 : 0.8)}
                  markerEnd={isDecayed ? 'url(#arrow-decayed)' : 'url(#arrow-active)'}
                />

                {/* Animated dash pulse along active edge */}
                {!isDecayed && (
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke="#06b6d4"
                    strokeWidth={isSelected ? 3 : 2}
                    strokeDasharray="6,18"
                    opacity={isSelected || isHovered ? 0.9 : 0.5}
                    className="animate-pulse"
                  />
                )}

                {/* Edge Relationship Pill */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-42}
                    y={-10}
                    width={84}
                    height={18}
                    rx={9}
                    fill={isDecayed ? '#1c1917' : '#0f172a'}
                    stroke={isDecayed ? '#7f1d1d' : (isSelected ? '#0284c7' : '#1e293b')}
                    strokeWidth={1}
                    opacity={0.92}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isDecayed ? '#f87171' : (isSelected ? '#38bdf8' : '#94a3b8')}
                    fontSize="9"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {edge.relationship}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Nodes */}
          {visibleNodes.map((node) => {
            const pos = positions[node.id] || { x: 400, y: 300 };
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isDecayed = node.status === 'decayed' || node.status === 'superseded';
            const catColors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Action;

            const radius = isSelected ? 30 : 25;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggingNodeId(node.id);
                }}
              >
                {/* Selection / Decay aura */}
                {isSelected && (
                  <circle
                    r={radius + 12}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    strokeDasharray="4,4"
                    className="animate-spin"
                    opacity={0.7}
                  />
                )}

                {/* Base Node Circle */}
                <circle
                  r={radius}
                  fill={isDecayed ? '#18181b' : catColors.bg}
                  stroke={isDecayed ? '#dc2626' : (isSelected ? '#38bdf8' : catColors.border)}
                  strokeWidth={isSelected ? 3 : (isDecayed ? 2 : 2)}
                  strokeDasharray={isDecayed ? '5,3' : undefined}
                  filter={!isDecayed ? 'url(#node-glow)' : undefined}
                  opacity={isDecayed ? 0.65 : 1}
                />

                {/* Inner Icon / Category Symbol */}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isDecayed ? '#ef4444' : catColors.text}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  pointerEvents="none"
                >
                  {node.category.slice(0, 3).toUpperCase()}
                </text>

                {/* Decayed / Superseded indicator badge */}
                {isDecayed && (
                  <g transform={`translate(${radius - 6}, ${-radius + 4})`}>
                    <circle r={8} fill="#ef4444" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      ✕
                    </text>
                  </g>
                )}

                {/* Primary Node Label Below */}
                <g transform={`translate(0, ${radius + 16})`}>
                  <rect
                    x={-Math.min(75, Math.max(35, node.label.length * 3.8))}
                    y={-8}
                    width={Math.min(150, Math.max(70, node.label.length * 7.6))}
                    height={18}
                    rx={6}
                    fill="#020617"
                    stroke={isSelected ? '#0284c7' : '#1e293b'}
                    strokeWidth={1}
                    opacity={0.9}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isDecayed ? '#94a3b8' : '#f8fafc'}
                    fontSize="10"
                    fontWeight={isSelected ? '700' : '500'}
                    className={isDecayed ? 'line-through text-slate-500' : ''}
                  >
                    {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                  </text>
                </g>

                {/* Validity window tag */}
                <text
                  y={radius + 32}
                  textAnchor="middle"
                  fill={isDecayed ? '#f87171' : '#64748b'}
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {isDecayed ? 'SUPERSEDED' : (node.validUntil === 'forever' ? 'NON-DECAYING' : `exp: ${node.validUntil}`)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Canvas Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden md:flex items-center gap-4 px-3.5 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          <span>Active Entity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-dashed border-rose-500 bg-rose-950/40" />
          <span>Decayed / Superseded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-cyan-400" />
          <span>Temporal Edge</span>
        </div>
        <span className="font-mono text-slate-500">
          Click node to inspect • Drag to rearrange
        </span>
      </div>
    </div>
  );
};
