export interface LogPreset {
  id: string;
  title: string;
  subtitle: string;
  text: string;
}

export const LOG_PRESETS: LogPreset[] = [
  {
    id: 'saas_pivot_deploy',
    title: 'SaaS Pivot & Expiring Deploy (User Brief)',
    subtitle: 'Oct 1 SaaS MVP -> Oct 2 Security Library pivot -> Oct 3 Vercel deploy (exp. Oct 10)',
    text: `User started session on Oct 1 at 10:00 AM wanting to build a SaaS MVP. On Oct 2 at 3:00 PM, user changed goal from SaaS MVP to Open Source AI Security Library. Agent suggested Vercel deployment on Oct 3, valid until Oct 10 subscription ends.`,
  },
  {
    id: 'complex_agent_execution',
    title: 'Load Complex Log (Agent Migration & Drift)',
    subtitle: 'Database migration, token issuance, timeout failure, and goal drift',
    text: `[2026-10-01 09:00:00] [SYSTEM] Session initialized for User 'dev-lead'. Primary Goal assigned: 'Migrate PostgreSQL Database to Distributed Cluster'.
[2026-10-01 09:15:00] [ACTION] Agent provisioned temporary access token API_KEY_MIGRATION_V1 (valid_until: 2026-10-02 09:00:00).
[2026-10-01 10:45:00] [SYSTEM] FAILED_AT: Replica sync timed out with 504 Gateway Error.
[2026-10-01 11:30:00] [ACTION] Agent executed rollback to baseline backup.
[2026-10-02 14:00:00] [USER] User redirected priority: 'Stop cluster migration. Pivot goal to Open Source Vector Indexing benchmarks'.
[2026-10-02 14:30:00] [ACTION] Previous goal 'Migrate PostgreSQL' marked SUPERSEDED. Access token API_KEY_MIGRATION_V1 revoked.
[2026-10-03 08:00:00] [ACTION] Agent spun up Benchmark Testbed on GCP Spot instances.
[2026-10-03 16:00:00] [DEPLOY] Deployment live at benchmark.internal.ai (valid_until: 2026-10-08 23:59:00 budget cut-off).`,
  },
  {
    id: 'security_token_incident',
    title: 'Security Incident & Context Drift',
    subtitle: 'Emergency root token leak, firewall lockdown, and goal override',
    text: `Session start 2026-09-30 08:00. Operator requested maintenance goal: 'Routine SSL Certificate Rotation'.
At 08:30, token SEC_TOKEN_EPHEMERAL issued with valid_until 2026-09-30 18:00.
At 09:45, IDS Alert 'Anomalous outbound egress to unknown ASN' triggered.
At 10:00, Emergency Incident Response declared. Goal shifted from 'SSL Certificate Rotation' to 'Contain Threat & Network Isolation'.
At 10:30, Firewall rule FW_BLOCK_EGRESS applied (valid_until: forever).
At 11:00, SEC_TOKEN_EPHEMERAL revoked immediately (status: decayed). Context drift spiked as routine maintenance was halted.`,
  },
];
