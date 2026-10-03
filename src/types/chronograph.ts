export type NodeCategory = 
  | 'User' 
  | 'System' 
  | 'Goal' 
  | 'Action' 
  | 'Feature' 
  | 'API Key' 
  | 'Timestamp' 
  | 'Deployment' 
  | 'Environment' 
  | 'Risk';

export type NodeStatus = 'active' | 'decayed' | 'superseded' | 'pending';

export interface TimeWindow {
  created_at: string;
  valid_until: string; // ISO date, human string e.g. "Oct 10, 2026", or "forever"
}

export interface TemporalNode {
  id: string;
  label: string;
  category: NodeCategory;
  step: number; // 1 to 10
  timestamp: string;
  validUntil: string;
  status: NodeStatus;
  description?: string;
  driftImpact?: number; // 0.00 to 1.00
  metadata?: Record<string, string | number | boolean>;
  // Physics simulation coordinates
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface TemporalEdge {
  id: string;
  source: string;
  target: string;
  relationship: string; // HAS_GOAL, EXECUTED_ACTION, FAILED_AT, VALID_UNTIL, PIVOTED_TO, DEPRECATED_BY, DEPENDS_ON, etc.
  time_window: TimeWindow;
  stepCreated: number;
  stepExpired?: number;
  decayed?: boolean;
}

export interface TimelineStep {
  step: number;
  label: string;
  timestamp: string;
  event: string;
  driftScore: number;
}

export interface GraphMetrics {
  context_drift_score: number; // 0.00 to 1.00
  memory_decay_percentage: number; // 0 to 100
  active_nodes_count: number;
  decayed_nodes_count: number;
  drift_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  analysis_summary: string;
}

export interface TemporalGraphResult {
  metrics: GraphMetrics;
  nodes: TemporalNode[];
  edges: TemporalEdge[];
  timeline: TimelineStep[];
}
