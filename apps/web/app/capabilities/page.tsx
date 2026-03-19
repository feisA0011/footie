const API = process.env['FOOTIE_API_URL'] ?? 'http://localhost:3001';

interface Capabilities {
  service: string;
  status: string;
  capabilities: {
    domain: string[];
    workers: string[];
    surfaces: string[];
  };
}

async function getCapabilities(): Promise<Capabilities> {
  const res = await fetch(`${API}/api/capabilities`, { cache: 'no-store' });
  if (!res.ok) throw new Error('API unreachable');
  return res.json() as Promise<Capabilities>;
}

export default async function CapabilitiesPage() {
  let data: Capabilities | null = null;
  let error: string | null = null;

  try {
    data = await getCapabilities();
  } catch {
    error = 'Could not reach API — start the API server with: cd services/api && pnpm dev';
  }

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">API Surface</div>
        <h1 className="hero-title">Platform<br />Capabilities</h1>
        <p className="hero-sub">
          Typed, stable read APIs backed by canonical published truth.
          {data && <> Service: <strong style={{ color: 'var(--accent)' }}>{data.status}</strong></>}
        </p>
      </div>

      {error && <div className="empty">{error}</div>}

      {data && (
        <>
          <div className="section-header">
            <span className="section-title">API Endpoints</span>
          </div>
          <div className="worker-list" style={{ marginBottom: 32, fontFamily: 'monospace' }}>
            {[
              { method: 'GET', path: '/health', desc: 'Service liveness check' },
              { method: 'GET', path: '/api/snapshot', desc: 'Full health + capabilities snapshot' },
              { method: 'GET', path: '/api/capabilities', desc: 'Available domain, workers & surfaces' },
              { method: 'GET', path: '/api/matches', desc: 'Enriched match list from canonical dataset' },
              { method: 'GET', path: '/api/pipeline/run', desc: 'Run full ingestion pipeline and return result' }
            ].map((e) => (
              <div key={e.path} className="worker-row">
                <div className="worker-dot" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', minWidth: 40 }}>{e.method}</span>
                <div className="worker-name" style={{ fontSize: 13 }}>{e.path}</div>
                <div className="worker-purpose">{e.desc}</div>
                <a
                  href={`http://localhost:3001${e.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="worker-deps"
                  style={{ color: 'var(--accent)', cursor: 'pointer' }}
                >
                  Open →
                </a>
              </div>
            ))}
          </div>

          <div className="section-header">
            <span className="section-title">Domain · Workers · Surfaces</span>
          </div>
          <div className="cap-grid">
            <div className="cap-card">
              <div className="cap-title">Domain Entities</div>
              <ul className="cap-list">
                {data.capabilities.domain.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
            <div className="cap-card">
              <div className="cap-title">Workers</div>
              <ul className="cap-list">
                {data.capabilities.workers.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </div>
            <div className="cap-card">
              <div className="cap-title">Surfaces</div>
              <ul className="cap-list">
                {data.capabilities.surfaces.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
