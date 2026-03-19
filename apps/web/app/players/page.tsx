'use client';
import { useState, useEffect } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Player {
  id: string; displayName: string; primaryPosition: string | null;
  birthDate: string | null; nationality: string | null;
}

const POSITION_COLORS: Record<string, string> = {
  ST: '#ef4444', LW: '#f97316', RW: '#f97316', AM: '#eab308',
  CM: '#3b82f6', DM: '#6366f1', LB: '#22c55e', RB: '#22c55e',
  CB: '#14b8a6', GK: '#a855f7'
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch(`${API}/api/players`).then((r) => r.json()).then((d: { players: Player[] }) => setPlayers(d.players)).catch(() => {});
  }, []);

  const filtered = query.length >= 2
    ? players.filter((p) => p.displayName.toLowerCase().includes(query.toLowerCase()) || (p.nationality ?? '').toLowerCase().includes(query.toLowerCase()))
    : players;

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Intelligence Layer</div>
        <h1 className="hero-title">Players</h1>
        <p className="hero-sub">{players.length} players indexed in canonical store with FTS search</p>
      </div>

      <div className="search-bar" style={{ marginBottom: 24 }}>
        <input type="text" placeholder="Filter by name or nationality..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <div className="section-header"><span className="section-title">Roster ({filtered.length})</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {filtered.map((p) => (
          <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                {p.displayName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.displayName}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.nationality ?? '—'}</div>
              </div>
              {p.primaryPosition && (
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: POSITION_COLORS[p.primaryPosition] ?? 'var(--muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4 }}>
                  {p.primaryPosition}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>{p.id}</div>
            {p.birthDate && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Born: {p.birthDate}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
