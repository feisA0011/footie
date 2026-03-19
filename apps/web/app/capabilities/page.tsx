'use client';
import { useState, useEffect } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export default function CapabilitiesPage() {
  const [caps, setCaps] = useState<{ capabilities: { domain: string[]; workers: string[]; surfaces: string[] }; status: string } | null>(null);

  useEffect(() => {
    fetch(`${API}/api/capabilities`).then((r) => r.json()).then(setCaps).catch(() => {});
  }, []);

  const endpoints = [
    { method: 'GET', path: '/health', desc: 'Service liveness check', auth: false },
    { method: 'GET', path: '/api/matches', desc: 'All matches — filter by ?status= ?competition= ?limit=', auth: false },
    { method: 'GET', path: '/api/teams', desc: 'All canonical teams', auth: false },
    { method: 'GET', path: '/api/players', desc: 'All indexed players', auth: false },
    { method: 'GET', path: '/api/competitions', desc: 'All active competitions', auth: false },
    { method: 'GET', path: '/api/search?q=', desc: 'FTS5 full-text search — teams, players, competitions', auth: false },
    { method: 'GET', path: '/api/narrative/:matchId', desc: 'Generated match preview or post-match report', auth: false },
    { method: 'GET', path: '/api/pipeline/run', desc: 'Run ingestion pipeline and return full result', auth: false },
    { method: 'GET', path: '/v1/matches', desc: 'Partner API — versioned, stable contracts', auth: true },
    { method: 'GET', path: '/v1/teams', desc: 'Partner API — teams list', auth: true },
    { method: 'GET', path: '/v1/players', desc: 'Partner API — players list', auth: true },
    { method: 'GET', path: '/v1/search?q=', desc: 'Partner API — search', auth: true },
    { method: 'GET', path: '/widget/match/:id', desc: 'Embeddable match card JSON + HTML snippet', auth: false },
  ];

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">API Surface</div>
        <h1 className="hero-title">Platform<br />Capabilities</h1>
        <p className="hero-sub">
          {caps ? <>Service status: <strong style={{ color: 'var(--accent)' }}>{caps.status}</strong> · {endpoints.length} endpoints</>
            : 'Connecting to API...'}
        </p>
      </div>

      <div className="section-header"><span className="section-title">Endpoints ({endpoints.length})</span></div>
      <div className="worker-list" style={{ marginBottom: 32 }}>
        {endpoints.map((e) => (
          <div key={e.path} className="worker-row">
            <div className="worker-dot" style={{ background: e.auth ? '#a855f7' : undefined }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', minWidth: 40 }}>{e.method}</span>
            <div className="worker-name" style={{ fontSize: 12, fontFamily: 'monospace' }}>{e.path}</div>
            <div className="worker-purpose">{e.desc}</div>
            {e.auth && <span className="worker-deps" style={{ color: '#a855f7' }}>X-Api-Key</span>}
            <a href={`${API}${e.path.replace('/:matchId', '/mtc_e5ae94e5').replace('?q=', '?q=arsenal')}`}
              target="_blank" rel="noopener noreferrer"
              className="worker-deps" style={{ color: 'var(--accent)' }}>Open →</a>
          </div>
        ))}
      </div>

      {caps && (
        <>
          <div className="section-header"><span className="section-title">Domain · Workers · Surfaces</span></div>
          <div className="cap-grid">
            <div className="cap-card">
              <div className="cap-title">Domain Entities</div>
              <ul className="cap-list">{caps.capabilities.domain.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
            <div className="cap-card">
              <div className="cap-title">Workers</div>
              <ul className="cap-list">{caps.capabilities.workers.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
            <div className="cap-card">
              <div className="cap-title">Surfaces</div>
              <ul className="cap-list">{caps.capabilities.surfaces.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
