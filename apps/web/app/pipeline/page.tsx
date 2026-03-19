const API = process.env['FOOTIE_API_URL'] ?? 'http://localhost:3001';

interface PublishRecord {
  recordId: string;
  batchId: string;
  promotedAt: string;
  entityIds: string[];
  validationIssueCount: number;
}

interface PipelineResult {
  batchId: string;
  matchCount: number;
  valid: boolean;
  issueCount: number;
  publishRecord: PublishRecord;
  dataset: {
    competitions: { id: string; name: string }[];
    seasons: { id: string; label: string }[];
    teams: { id: string; name: string }[];
    matches: { id: string; status: string }[];
  };
}

const WORKERS = [
  { name: 'orchestrator', purpose: 'Coordinates workflows and windows', deps: [] },
  { name: 'fixture-schedule', purpose: 'Determines fixture ingestion windows', deps: ['orchestrator'] },
  { name: 'ingestion', purpose: 'Fetches raw provider payloads', deps: ['fixture-schedule'] },
  { name: 'entity-resolution', purpose: 'Maps provider IDs → canonical IDs', deps: ['ingestion'] },
  { name: 'normalization', purpose: 'Transforms raw data to canonical form', deps: ['entity-resolution'] },
  { name: 'validation', purpose: 'Runs audit and rule packs', deps: ['normalization'] },
  { name: 'enrichment', purpose: 'Calculates derived metrics (xG, xA)', deps: ['normalization'] },
  { name: 'publishing', purpose: 'Promotes to published stores', deps: ['validation', 'enrichment'] },
  { name: 'monitoring', purpose: 'Tracks freshness and quality', deps: ['publishing'] },
  { name: 'narrative', purpose: 'Generates explainable match summaries', deps: ['publishing'] }
];

async function getPipelineResult(): Promise<PipelineResult> {
  const res = await fetch(`${API}/api/pipeline/run`, { cache: 'no-store' });
  if (!res.ok) throw new Error('API unreachable');
  return res.json() as Promise<PipelineResult>;
}

export default async function PipelinePage() {
  let result: PipelineResult | null = null;
  let error: string | null = null;

  try {
    result = await getPipelineResult();
  } catch {
    error = 'Could not reach API — start the API server with: cd services/api && pnpm dev';
  }

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Data Pipeline</div>
        <h1 className="hero-title">Ingestion<br />Control Plane</h1>
        <p className="hero-sub">
          End-to-end pipeline: provider adapters → normalization → validation → publish
        </p>
      </div>

      {error && <div className="empty">{error}</div>}

      {result && (
        <>
          <div className="section-header">
            <span className="section-title">Last Run — {result.batchId}</span>
          </div>
          <div className="pipeline-grid">
            <div className="stat-card">
              <div className="stat-label">Matches ingested</div>
              <div className="stat-value blue">{result.matchCount}</div>
              <div className="stat-sub">fixture provider</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Validation</div>
              <div className={`stat-value ${result.valid ? 'green' : ''}`}>{result.valid ? 'PASS' : 'FAIL'}</div>
              <div className="stat-sub">{result.issueCount} issue{result.issueCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Teams resolved</div>
              <div className="stat-value blue">{result.dataset.teams.length}</div>
              <div className="stat-sub">canonical entities</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Publish record</div>
              <div className="stat-value green" style={{ fontSize: 14, fontFamily: 'monospace', marginTop: 4 }}>{result.publishRecord.recordId}</div>
              <div className="stat-sub">promoted {new Date(result.publishRecord.promotedAt).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC</div>
            </div>
          </div>

          <div className="section-header" style={{ marginTop: 8 }}>
            <span className="section-title">Canonical dataset</span>
          </div>
          <div className="pipeline-grid" style={{ marginBottom: 32 }}>
            {[
              { label: 'Competitions', items: result.dataset.competitions.map(c => c.name) },
              { label: 'Seasons', items: result.dataset.seasons.map(s => s.label) },
              { label: 'Teams', items: result.dataset.teams.map(t => t.name) }
            ].map(({ label, items }) => (
              <div key={label} className="stat-card">
                <div className="stat-label">{label}</div>
                {items.map((item) => (
                  <div key={item} style={{ fontSize: 13, marginTop: 6 }}>{item}</div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-header">
        <span className="section-title">Worker Graph ({WORKERS.length} workers)</span>
      </div>
      <div className="worker-list">
        {WORKERS.map((w) => (
          <div key={w.name} className="worker-row">
            <div className="worker-dot" style={{ background: w.name === 'publishing' || w.name === 'validation' ? '#3b82f6' : undefined }} />
            <div className="worker-name">{w.name}</div>
            <div className="worker-purpose">{w.purpose}</div>
            {w.deps.length > 0 && (
              <div className="worker-deps">← {w.deps.join(', ')}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
