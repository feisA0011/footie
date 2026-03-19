'use client';
import { useState, useEffect } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Worker { name: string; purpose: string; deps: string[] }

const WORKERS: Worker[] = [
  { name: 'orchestrator', purpose: 'Coordinates workflows and ingestion windows', deps: [] },
  { name: 'fixture-schedule', purpose: 'Determines fixture ingestion windows', deps: ['orchestrator'] },
  { name: 'ingestion', purpose: 'Fetches raw provider payloads via adapters', deps: ['fixture-schedule'] },
  { name: 'entity-resolution', purpose: 'Maps provider IDs to canonical IDs', deps: ['ingestion'] },
  { name: 'normalization', purpose: 'Transforms raw data to canonical form', deps: ['entity-resolution'] },
  { name: 'validation', purpose: 'Runs audit rules and constraint checks', deps: ['normalization'] },
  { name: 'enrichment', purpose: 'Calculates derived metrics (xG, xA, form)', deps: ['normalization'] },
  { name: 'publishing', purpose: 'Promotes to published stores', deps: ['validation', 'enrichment'] },
  { name: 'monitoring', purpose: 'Tracks freshness, quality, and drift', deps: ['publishing'] },
  { name: 'narrative', purpose: 'Generates explainable match previews and reports', deps: ['publishing'] }
];

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<Record<string, unknown> | null>(null);
  const [stats, setStats] = useState<{ teams: number; players: number; competitions: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/pipeline/run`).then((r) => r.json()),
      fetch(`${API}/api/teams`).then((r) => r.json()),
      fetch(`${API}/api/players`).then((r) => r.json()),
      fetch(`${API}/api/competitions`).then((r) => r.json()),
    ]).then(([p, t, pl, c]) => {
      setPipeline(p as Record<string, unknown>);
      setStats({ teams: (t as { meta: { total: number } }).meta.total, players: (pl as { meta: { total: number } }).meta.total, competitions: (c as { meta: { total: number } }).meta.total });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Data Pipeline</div>
        <h1 className="hero-title">Ingestion<br />Control Plane</h1>
        <p className="hero-sub">Fixture adapter → normalize → validate → publish. Workers run in a typed DAG.</p>
      </div>

      {loading && <div className="empty">Running pipeline...</div>}

      {pipeline && stats && (
        <>
          <div className="section-header"><span className="section-title">Canonical Store</span></div>
          <div className="pipeline-grid">
            {[
              { label: 'Matches', value: (pipeline['matchCount'] as number), color: 'blue', sub: 'ingested this run' },
              { label: 'Teams', value: stats.teams, color: 'green', sub: 'canonical entities' },
              { label: 'Players', value: stats.players, color: 'blue', sub: 'indexed in FTS' },
              { label: 'Competitions', value: stats.competitions, color: 'green', sub: 'active leagues' },
              { label: 'Validation', value: pipeline['valid'] ? 'PASS' : 'FAIL', color: pipeline['valid'] ? 'green' : '', sub: `${pipeline['issueCount']} issues` },
              { label: 'Batch', value: String(pipeline['batchId']).split('_').pop()?.toUpperCase(), color: 'blue', sub: (pipeline['publishRecord'] as { recordId: string })?.recordId }
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="stat-card">
                <div className="stat-label">{label}</div>
                <div className={`stat-value ${color}`} style={String(value).length > 6 ? { fontSize: 14, marginTop: 8, fontFamily: 'monospace' } : {}}>{String(value)}</div>
                <div className="stat-sub">{sub}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-header" style={{ marginTop: 8 }}><span className="section-title">Worker Graph — {WORKERS.length} workers</span></div>
      <div className="worker-list">
        {WORKERS.map((w, i) => (
          <div key={w.name} className="worker-row">
            <div className="worker-dot" style={{ background: ['publishing', 'validation'].includes(w.name) ? '#3b82f6' : w.name === 'narrative' ? '#a855f7' : undefined }} />
            <div style={{ fontSize: 11, color: 'var(--muted)', minWidth: 24, textAlign: 'right' }}>{i + 1}</div>
            <div className="worker-name">{w.name}</div>
            <div className="worker-purpose">{w.purpose}</div>
            {w.deps.length > 0 && <div className="worker-deps">← {w.deps.join(', ')}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
