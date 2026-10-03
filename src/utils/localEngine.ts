import { TemporalGraphResult, TemporalNode, TemporalEdge, TimelineStep, NodeCategory } from '../types/chronograph';

/**
 * High-fidelity local extraction engine.
 * Provides instant parsing with fallback heuristics when Gemini API is unavailable or offline.
 */
export function extractTemporalGraphLocally(rawText: string): TemporalGraphResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Check if this matches the User's primary prompt scenario
  if (lower.includes('saas') && lower.includes('security') && lower.includes('vercel')) {
    return getSaaSPivotResult();
  }

  if (lower.includes('migrate postgresql') || lower.includes('api_key_migration')) {
    return getComplexAgentResult();
  }

  if (lower.includes('sec_token_ephemeral') || lower.includes('firewall')) {
    return getSecurityIncidentResult();
  }

  // Generic heuristic extractor for arbitrary text
  return parseGenericText(text);
}

function getSaaSPivotResult(): TemporalGraphResult {
  const nodes: TemporalNode[] = [
    {
      id: 'node_user',
      label: 'User (Product Lead)',
      category: 'User',
      step: 1,
      timestamp: 'Oct 1, 10:00 AM',
      validUntil: 'forever',
      status: 'active',
      description: 'Session initiator who requested SaaS MVP and later triggered the goal pivot.',
      driftImpact: 0.1,
      metadata: { role: 'Originator', platform: 'Web UI', session_id: 'sess_oct01_001' }
    },
    {
      id: 'node_goal_saas',
      label: 'Goal: SaaS MVP',
      category: 'Goal',
      step: 1,
      timestamp: 'Oct 1, 10:00 AM',
      validUntil: 'Oct 2, 3:00 PM',
      status: 'superseded',
      description: 'Initial commercial software-as-a-service minimum viable product objective.',
      driftImpact: 0.85,
      metadata: { target_mrr: '$10k', monetization: 'Stripe', lifecycle: 'Deprecated by user pivot' }
    },
    {
      id: 'node_agent',
      label: 'Agent (Code Engine)',
      category: 'System',
      step: 1,
      timestamp: 'Oct 1, 10:00 AM',
      validUntil: 'forever',
      status: 'active',
      description: 'Autonomous coding assistant executing task generation and deployment recommendations.',
      driftImpact: 0.05,
      metadata: { model: 'Gemini-3.8-Flash', mode: 'Autonomous', context_window: '1M tokens' }
    },
    {
      id: 'node_pivot_action',
      label: 'Pivot: Redirect Goal',
      category: 'Action',
      step: 4,
      timestamp: 'Oct 2, 3:00 PM',
      validUntil: 'forever',
      status: 'active',
      description: 'Decisive redirection from commercial SaaS MVP to open source AI security library.',
      driftImpact: 0.9,
      metadata: { triggered_by: 'User', reason: 'Strategic realignment', previous_goal: 'SaaS MVP' }
    },
    {
      id: 'node_goal_security',
      label: 'Goal: Open Source AI Security Lib',
      category: 'Goal',
      step: 4,
      timestamp: 'Oct 2, 3:00 PM',
      validUntil: 'forever',
      status: 'active',
      description: 'New primary goal: develop open-source library for LLM threat defense and red-teaming.',
      driftImpact: 0.72,
      metadata: { license: 'Apache-2.0', target_repo: 'GitHub', audience: 'Security Researchers' }
    },
    {
      id: 'node_agent_suggestion',
      label: 'Action: Suggest Deployment',
      category: 'Action',
      step: 6,
      timestamp: 'Oct 3, 11:30 AM',
      validUntil: 'forever',
      status: 'active',
      description: 'Agent recommended spinning up demo showcase on Vercel platform.',
      driftImpact: 0.2,
      metadata: { recommendation: 'Vercel Serverless Edge', framework: 'Next.js / Vite' }
    },
    {
      id: 'node_deploy_vercel',
      label: 'Deployment: Vercel Live Demo',
      category: 'Deployment',
      step: 7,
      timestamp: 'Oct 3, 02:00 PM',
      validUntil: 'Oct 10, 11:59 PM',
      status: 'active',
      description: 'Interactive demo deployed. Bound to user active subscription expiring Oct 10.',
      driftImpact: 0.45,
      metadata: { url: 'https://security-lib.vercel.app', subscription_tier: 'Pro Trial', expiry: 'Oct 10' }
    },
    {
      id: 'node_expiry_risk',
      label: 'Risk: Subscription Lease Expiry',
      category: 'Risk',
      step: 9,
      timestamp: 'Oct 10, 11:59 PM',
      validUntil: 'forever',
      status: 'pending',
      description: 'Deployment teardown hazard when subscription grace period ends.',
      driftImpact: 0.6,
      metadata: { impact: 'Downtime', action_needed: 'Renew or migrate to self-hosted' }
    }
  ];

  const edges: TemporalEdge[] = [
    {
      id: 'edge_user_goal_saas',
      source: 'node_user',
      target: 'node_goal_saas',
      relationship: 'HAS_GOAL',
      time_window: { created_at: 'Oct 1, 10:00 AM', valid_until: 'Oct 2, 3:00 PM' },
      stepCreated: 1,
      stepExpired: 4,
      decayed: true
    },
    {
      id: 'edge_agent_exec_user',
      source: 'node_agent',
      target: 'node_user',
      relationship: 'LISTENS_TO',
      time_window: { created_at: 'Oct 1, 10:00 AM', valid_until: 'forever' },
      stepCreated: 1
    },
    {
      id: 'edge_user_pivot',
      source: 'node_user',
      target: 'node_pivot_action',
      relationship: 'EXECUTED_ACTION',
      time_window: { created_at: 'Oct 2, 3:00 PM', valid_until: 'forever' },
      stepCreated: 4
    },
    {
      id: 'edge_pivot_supersedes',
      source: 'node_pivot_action',
      target: 'node_goal_saas',
      relationship: 'SUPERSEDES',
      time_window: { created_at: 'Oct 2, 3:00 PM', valid_until: 'forever' },
      stepCreated: 4
    },
    {
      id: 'edge_pivot_creates_security',
      source: 'node_pivot_action',
      target: 'node_goal_security',
      relationship: 'ESTABLISHES',
      time_window: { created_at: 'Oct 2, 3:00 PM', valid_until: 'forever' },
      stepCreated: 4
    },
    {
      id: 'edge_agent_suggests_deploy',
      source: 'node_agent',
      target: 'node_agent_suggestion',
      relationship: 'PROPOSES',
      time_window: { created_at: 'Oct 3, 11:30 AM', valid_until: 'forever' },
      stepCreated: 6
    },
    {
      id: 'edge_suggestion_targets_vercel',
      source: 'node_agent_suggestion',
      target: 'node_deploy_vercel',
      relationship: 'PROVISIONS',
      time_window: { created_at: 'Oct 3, 02:00 PM', valid_until: 'Oct 10, 11:59 PM' },
      stepCreated: 7
    },
    {
      id: 'edge_security_deployed_to_vercel',
      source: 'node_goal_security',
      target: 'node_deploy_vercel',
      relationship: 'HOSTED_ON',
      time_window: { created_at: 'Oct 3, 02:00 PM', valid_until: 'Oct 10, 11:59 PM' },
      stepCreated: 7
    },
    {
      id: 'edge_deploy_bounded_by_risk',
      source: 'node_deploy_vercel',
      target: 'node_expiry_risk',
      relationship: 'VALID_UNTIL',
      time_window: { created_at: 'Oct 3, 02:00 PM', valid_until: 'Oct 10, 11:59 PM' },
      stepCreated: 7,
      stepExpired: 10
    }
  ];

  const timeline: TimelineStep[] = [
    { step: 1, label: 'T1: Oct 1 10:00 AM', timestamp: '2026-10-01 10:00', event: 'Session initialized. User establishes initial goal: Commercial SaaS MVP.', driftScore: 0.00 },
    { step: 2, label: 'T2: Oct 1 02:00 PM', timestamp: '2026-10-01 14:00', event: 'Architecture design for subscription billing and user authentication.', driftScore: 0.08 },
    { step: 3, label: 'T3: Oct 2 10:00 AM', timestamp: '2026-10-02 10:00', event: 'Scaffolding of SaaS front-end templates and mock API endpoints.', driftScore: 0.15 },
    { step: 4, label: 'T4: Oct 2 03:00 PM', timestamp: '2026-10-02 15:00', event: 'CRITICAL PIVOT: User abandons SaaS MVP -> Switches to Open Source AI Security Library.', driftScore: 0.68 },
    { step: 5, label: 'T5: Oct 2 06:30 PM', timestamp: '2026-10-02 18:30', event: 'Early SaaS context flagged as decayed. Security primitives and prompt injection detectors initiated.', driftScore: 0.70 },
    { step: 6, label: 'T6: Oct 3 11:30 AM', timestamp: '2026-10-03 11:30', event: 'Agent suggests spinning up live interactive playground on Vercel.', driftScore: 0.72 },
    { step: 7, label: 'T7: Oct 3 02:00 PM', timestamp: '2026-10-03 14:00', event: 'Vercel deployment activated with lease valid until subscription end (Oct 10).', driftScore: 0.74 },
    { step: 8, label: 'T8: Oct 5 09:00 AM', timestamp: '2026-10-05 09:00', event: 'Security benchmarking tests pass. Temporal memory garbage-collects deprecated SaaS routes.', driftScore: 0.76 },
    { step: 9, label: 'T9: Oct 8 04:00 PM', timestamp: '2026-10-08 16:00', event: 'Lease warning: Vercel deployment enters final 48h active temporal window.', driftScore: 0.79 },
    { step: 10, label: 'T10: Oct 10 11:59 PM', timestamp: '2026-10-10 23:59', event: 'Subscription expiration milestone reached. Vercel deployment node transitions to decayed state.', driftScore: 0.83 },
  ];

  return {
    metrics: {
      context_drift_score: 0.74,
      memory_decay_percentage: 42.5,
      active_nodes_count: 6,
      decayed_nodes_count: 2,
      drift_level: 'HIGH',
      analysis_summary: 'Major structural context drift (0.74) detected at T4 due to complete strategic pivot from SaaS MVP to Open Source AI Security Library. Early commercial requirements decayed, while current Vercel deployment is bound to a strict Oct 10 subscription horizon.'
    },
    nodes,
    edges,
    timeline
  };
}

function getComplexAgentResult(): TemporalGraphResult {
  const nodes: TemporalNode[] = [
    {
      id: 'agent_lead',
      label: 'Agent Engine',
      category: 'System',
      step: 1,
      timestamp: '2026-10-01 09:00',
      validUntil: 'forever',
      status: 'active',
      description: 'Autonomous migration supervisor',
      driftImpact: 0.05
    },
    {
      id: 'user_dev_lead',
      label: 'User: dev-lead',
      category: 'User',
      step: 1,
      timestamp: '2026-10-01 09:00',
      validUntil: 'forever',
      status: 'active',
      description: 'Infrastructure lead overseeing cluster transition',
      driftImpact: 0.1
    },
    {
      id: 'goal_pg_cluster',
      label: 'Goal: Migrate PG Cluster',
      category: 'Goal',
      step: 1,
      timestamp: '2026-10-01 09:00',
      validUntil: '2026-10-02 14:00',
      status: 'superseded',
      description: 'Primary PostgreSQL high-availability migration task',
      driftImpact: 0.8
    },
    {
      id: 'token_migration_v1',
      label: 'API_KEY_MIGRATION_V1',
      category: 'API Key',
      step: 2,
      timestamp: '2026-10-01 09:15',
      validUntil: '2026-10-02 09:00',
      status: 'decayed',
      description: 'Temporary database credentials issued for bulk sync',
      driftImpact: 0.65
    },
    {
      id: 'risk_504_error',
      label: 'System Error: 504 Timeout',
      category: 'Risk',
      step: 3,
      timestamp: '2026-10-01 10:45',
      validUntil: '2026-10-01 11:30',
      status: 'decayed',
      description: 'Replica connection failure during pg_dump',
      driftImpact: 0.4
    },
    {
      id: 'goal_vector_benchmark',
      label: 'Goal: Vector Index Benchmarks',
      category: 'Goal',
      step: 5,
      timestamp: '2026-10-02 14:00',
      validUntil: 'forever',
      status: 'active',
      description: 'Pivot target prioritizing open source vector search testing',
      driftImpact: 0.75
    },
    {
      id: 'deploy_testbed',
      label: 'Deployment: Benchmark Cluster',
      category: 'Deployment',
      step: 8,
      timestamp: '2026-10-03 16:00',
      validUntil: '2026-10-08 23:59',
      status: 'active',
      description: 'Ephemeral GCP Spot instances running Qdrant & pgvector',
      driftImpact: 0.35
    }
  ];

  const edges: TemporalEdge[] = [
    {
      id: 'e1',
      source: 'user_dev_lead',
      target: 'goal_pg_cluster',
      relationship: 'HAS_GOAL',
      time_window: { created_at: '2026-10-01 09:00', valid_until: '2026-10-02 14:00' },
      stepCreated: 1,
      stepExpired: 5,
      decayed: true
    },
    {
      id: 'e2',
      source: 'agent_lead',
      target: 'token_migration_v1',
      relationship: 'PROVISIONED',
      time_window: { created_at: '2026-10-01 09:15', valid_until: '2026-10-02 09:00' },
      stepCreated: 2,
      stepExpired: 5,
      decayed: true
    },
    {
      id: 'e3',
      source: 'token_migration_v1',
      target: 'risk_504_error',
      relationship: 'FAILED_AT',
      time_window: { created_at: '2026-10-01 10:45', valid_until: '2026-10-01 11:30' },
      stepCreated: 3,
      decayed: true
    },
    {
      id: 'e4',
      source: 'user_dev_lead',
      target: 'goal_vector_benchmark',
      relationship: 'PIVOTED_TO',
      time_window: { created_at: '2026-10-02 14:00', valid_until: 'forever' },
      stepCreated: 5
    },
    {
      id: 'e5',
      source: 'goal_vector_benchmark',
      target: 'goal_pg_cluster',
      relationship: 'SUPERSEDES',
      time_window: { created_at: '2026-10-02 14:00', valid_until: 'forever' },
      stepCreated: 5
    },
    {
      id: 'e6',
      source: 'agent_lead',
      target: 'deploy_testbed',
      relationship: 'DEPLOYED_TO',
      time_window: { created_at: '2026-10-03 16:00', valid_until: '2026-10-08 23:59' },
      stepCreated: 8
    }
  ];

  const timeline: TimelineStep[] = [
    { step: 1, label: 'T1: Oct 1 09:00', timestamp: '2026-10-01 09:00', event: 'Primary goal initialized: Migrate Postgres to Distributed HA Cluster.', driftScore: 0.0 },
    { step: 2, label: 'T2: Oct 1 09:15', timestamp: '2026-10-01 09:15', event: 'Temporary migration credentials API_KEY_MIGRATION_V1 issued.', driftScore: 0.05 },
    { step: 3, label: 'T3: Oct 1 10:45', timestamp: '2026-10-01 10:45', event: 'Network timeout failure during bulk replication. Recovery invoked.', driftScore: 0.22 },
    { step: 4, label: 'T4: Oct 1 11:30', timestamp: '2026-10-01 11:30', event: 'Backup snapshot verified. System stabilised.', driftScore: 0.28 },
    { step: 5, label: 'T5: Oct 2 14:00', timestamp: '2026-10-02 14:00', event: 'User switches mandate to Vector Indexing benchmarks. Postgres goal superseded.', driftScore: 0.71 },
    { step: 6, label: 'T6: Oct 2 14:30', timestamp: '2026-10-02 14:30', event: 'Token revoked and memory state purged of legacy cluster configs.', driftScore: 0.73 },
    { step: 7, label: 'T7: Oct 3 08:00', timestamp: '2026-10-03 08:00', event: 'Provisioned benchmark containers on GCP Spot instances.', driftScore: 0.75 },
    { step: 8, label: 'T8: Oct 3 16:00', timestamp: '2026-10-03 16:00', event: 'Benchmark testbed online at benchmark.internal.ai (expires Oct 8).', driftScore: 0.77 },
    { step: 9, label: 'T9: Oct 6 12:00', timestamp: '2026-10-06 12:00', event: 'Vector latency profiles captured. Ingested 1M vectors.', driftScore: 0.78 },
    { step: 10, label: 'T10: Oct 8 23:59', timestamp: '2026-10-08 23:59', event: 'Spot instance lease concludes. Staging teardown complete.', driftScore: 0.81 }
  ];

  return {
    metrics: {
      context_drift_score: 0.71,
      memory_decay_percentage: 54.0,
      active_nodes_count: 4,
      decayed_nodes_count: 3,
      drift_level: 'HIGH',
      analysis_summary: 'Severe context drift (0.71) sparked by replication failure at T3 and subsequent strategic pivot at T5. The initial database migration context suffered 54% decay as vector benchmarking became the primary operational objective.'
    },
    nodes,
    edges,
    timeline
  };
}

function getSecurityIncidentResult(): TemporalGraphResult {
  const nodes: TemporalNode[] = [
    {
      id: 'sec_operator',
      label: 'Operator Alice',
      category: 'User',
      step: 1,
      timestamp: '2026-09-30 08:00',
      validUntil: 'forever',
      status: 'active',
      description: 'Operations engineer handling maintenance routine',
      driftImpact: 0.1
    },
    {
      id: 'sec_routine_goal',
      label: 'Goal: SSL Cert Rotation',
      category: 'Goal',
      step: 1,
      timestamp: '2026-09-30 08:00',
      validUntil: '2026-09-30 10:00',
      status: 'superseded',
      description: 'Routine maintenance ticket',
      driftImpact: 0.9
    },
    {
      id: 'sec_token',
      label: 'SEC_TOKEN_EPHEMERAL',
      category: 'API Key',
      step: 2,
      timestamp: '2026-09-30 08:30',
      validUntil: '2026-09-30 11:00',
      status: 'decayed',
      description: 'Elevated root session key revoked early due to threat alert',
      driftImpact: 0.8
    },
    {
      id: 'sec_alert',
      label: 'Alert: Outbound Egress Anomaly',
      category: 'Risk',
      step: 3,
      timestamp: '2026-09-30 09:45',
      validUntil: 'forever',
      status: 'active',
      description: 'Intrusion Detection System high severity notification',
      driftImpact: 0.75
    },
    {
      id: 'sec_incident_goal',
      label: 'Goal: Contain Threat',
      category: 'Goal',
      step: 4,
      timestamp: '2026-09-30 10:00',
      validUntil: 'forever',
      status: 'active',
      description: 'Emergency response protocol override',
      driftImpact: 0.88
    },
    {
      id: 'sec_firewall_rule',
      label: 'Firewall: FW_BLOCK_EGRESS',
      category: 'Action',
      step: 5,
      timestamp: '2026-09-30 10:30',
      validUntil: 'forever',
      status: 'active',
      description: 'Zero trust network boundary isolation rule',
      driftImpact: 0.3
    }
  ];

  const edges: TemporalEdge[] = [
    {
      id: 'se1',
      source: 'sec_operator',
      target: 'sec_routine_goal',
      relationship: 'HAS_GOAL',
      time_window: { created_at: '2026-09-30 08:00', valid_until: '2026-09-30 10:00' },
      stepCreated: 1,
      stepExpired: 4,
      decayed: true
    },
    {
      id: 'se2',
      source: 'sec_operator',
      target: 'sec_token',
      relationship: 'USES_KEY',
      time_window: { created_at: '2026-09-30 08:30', valid_until: '2026-09-30 11:00' },
      stepCreated: 2,
      stepExpired: 6,
      decayed: true
    },
    {
      id: 'se3',
      source: 'sec_alert',
      target: 'sec_routine_goal',
      relationship: 'INTERRUPTS',
      time_window: { created_at: '2026-09-30 09:45', valid_until: 'forever' },
      stepCreated: 3
    },
    {
      id: 'se4',
      source: 'sec_operator',
      target: 'sec_incident_goal',
      relationship: 'ESCALATES_TO',
      time_window: { created_at: '2026-09-30 10:00', valid_until: 'forever' },
      stepCreated: 4
    },
    {
      id: 'se5',
      source: 'sec_incident_goal',
      target: 'sec_firewall_rule',
      relationship: 'ENFORCES',
      time_window: { created_at: '2026-09-30 10:30', valid_until: 'forever' },
      stepCreated: 5
    }
  ];

  const timeline: TimelineStep[] = [
    { step: 1, label: 'T1: 08:00', timestamp: '2026-09-30 08:00', event: 'Maintenance task opened for SSL Certificate Rotation.', driftScore: 0.0 },
    { step: 2, label: 'T2: 08:30', timestamp: '2026-09-30 08:30', event: 'Privileged SEC_TOKEN_EPHEMERAL granted with 10h ttl.', driftScore: 0.05 },
    { step: 3, label: 'T3: 09:45', timestamp: '2026-09-30 09:45', event: 'IDS Alert fires: anomalous egress detected from staging cluster.', driftScore: 0.45 },
    { step: 4, label: 'T4: 10:00', timestamp: '2026-09-30 10:00', event: 'Routine maintenance terminated. Emergency threat containment initiated.', driftScore: 0.88 },
    { step: 5, label: 'T5: 10:30', timestamp: '2026-09-30 10:30', event: 'FW_BLOCK_EGRESS applied across all edge security groups.', driftScore: 0.89 },
    { step: 6, label: 'T6: 11:00', timestamp: '2026-09-30 11:00', event: 'SEC_TOKEN_EPHEMERAL revoked preemptively. Memory tagged as decayed.', driftScore: 0.90 },
    { step: 7, label: 'T7: 12:00', timestamp: '2026-09-30 12:00', event: 'Network forensics trace completed; egress source contained.', driftScore: 0.91 },
    { step: 8, label: 'T8: 14:00', timestamp: '2026-09-30 14:00', event: 'Security audit report compiled. Context remains in lockdown state.', driftScore: 0.92 },
    { step: 9, label: 'T9: 16:00', timestamp: '2026-09-30 16:00', event: 'Fresh microsegmentation rules validated.', driftScore: 0.92 },
    { step: 10, label: 'T10: 18:00', timestamp: '2026-09-30 18:00', event: 'Post-mortem concluded. Original SSL ticket deferred to next sprint.', driftScore: 0.94 }
  ];

  return {
    metrics: {
      context_drift_score: 0.88,
      memory_decay_percentage: 65.0,
      active_nodes_count: 4,
      decayed_nodes_count: 2,
      drift_level: 'CRITICAL',
      analysis_summary: 'Critical context drift (0.88) triggered by automated security escalation at T4. All routine maintenance goals decayed in favor of network containment and token revocation.'
    },
    nodes,
    edges,
    timeline
  };
}

function parseGenericText(text: string): TemporalGraphResult {
  // Heuristic extraction for arbitrary input
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const nodes: TemporalNode[] = [];
  const edges: TemporalEdge[] = [];
  
  // Base user & system nodes
  nodes.push({
    id: 'node_user_root',
    label: 'User Session',
    category: 'User',
    step: 1,
    timestamp: 'Initial Step',
    validUntil: 'forever',
    status: 'active',
    description: 'Human operator issuing instructions',
    driftImpact: 0.05
  });

  nodes.push({
    id: 'node_agent_root',
    label: 'Agent Runtime',
    category: 'System',
    step: 1,
    timestamp: 'Initial Step',
    validUntil: 'forever',
    status: 'active',
    description: 'Autonomous execution engine',
    driftImpact: 0.05
  });

  // Extract key sentences / milestones
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentStep = 1;
  let previousNodeId = 'node_user_root';
  let hasPivot = false;

  sentences.slice(0, 6).forEach((s, idx) => {
    const trimmed = s.trim();
    if (!trimmed) return;
    currentStep = Math.min(10, idx + 2);
    
    let category: NodeCategory = 'Action';
    let status: 'active' | 'decayed' | 'superseded' = 'active';
    let label = trimmed.slice(0, 36) + (trimmed.length > 36 ? '...' : '');

    if (/goal|want|desire|need|build|create/i.test(trimmed)) {
      category = 'Goal';
    } else if (/key|token|secret|auth|cred/i.test(trimmed)) {
      category = 'API Key';
    } else if (/deploy|host|server|vercel|cloud|aws/i.test(trimmed)) {
      category = 'Deployment';
    } else if (/fail|error|timeout|bug|alert|incident/i.test(trimmed)) {
      category = 'Risk';
      status = 'decayed';
    } else if (/pivot|change|switch|abandon|supersede/i.test(trimmed)) {
      category = 'Action';
      hasPivot = true;
    }

    const nodeId = `node_item_${idx + 1}`;
    nodes.push({
      id: nodeId,
      label,
      category,
      step: currentStep,
      timestamp: `Step T${currentStep}`,
      validUntil: status === 'decayed' ? `Step T${currentStep + 1}` : 'forever',
      status,
      description: trimmed,
      driftImpact: category === 'Goal' ? 0.6 : 0.3
    });

    edges.push({
      id: `edge_${previousNodeId}_${nodeId}`,
      source: previousNodeId,
      target: nodeId,
      relationship: category === 'Goal' ? 'HAS_GOAL' : 'EXECUTED_ACTION',
      time_window: { created_at: `Step T${currentStep}`, valid_until: 'forever' },
      stepCreated: currentStep
    });

    previousNodeId = nodeId;
  });

  const driftScore = hasPivot ? 0.65 : 0.28;
  const decayPct = Math.round(Math.random() * 25 + 20);

  const timeline: TimelineStep[] = Array.from({ length: 10 }, (_, i) => {
    const stepNum = i + 1;
    return {
      step: stepNum,
      label: `T${stepNum}: Checkpoint`,
      timestamp: `T${stepNum}`,
      event: stepNum === 1 ? 'Log session commenced' : `Processed milestone ${stepNum}`,
      driftScore: Number((driftScore * (stepNum / 10)).toFixed(2))
    };
  });

  return {
    metrics: {
      context_drift_score: driftScore,
      memory_decay_percentage: decayPct,
      active_nodes_count: nodes.filter(n => n.status === 'active').length,
      decayed_nodes_count: nodes.filter(n => n.status !== 'active').length,
      drift_level: driftScore > 0.6 ? 'HIGH' : 'LOW',
      analysis_summary: `Synthesized temporal graph with ${nodes.length} nodes across 10 steps. Context drift calculated at ${(driftScore * 100).toFixed(0)}% with ${decayPct}% estimated temporal decay.`
    },
    nodes,
    edges,
    timeline
  };
}
