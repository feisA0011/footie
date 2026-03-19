'use client';
import { useState, useEffect, useMemo } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Team { id: string; slug: string; name: string; primaryColor: string | null }
interface Player {
  id: string; slug: string; displayName: string; primaryPosition: string | null;
  nationality: string | null; currentTeamId: string | null; heightCm: number | null;
  team: Team | null;
}

const POS_COLOR: Record<string, string> = { GK: '#f59e0b', DEF: '#3b82f6', MID: '#8b5cf6', FWD: '#ef4444', ATT: '#ef4444' };
const POSITIONS = ['All', 'GK', 'DEF', 'MID', 'FWD'];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API}/api/players`).then((r) => r.json()).then((d: { players: Player[] }) => setPlayers(d.players));
  }, []);

  const shown = useMemo(() =>
    players.filter((p) =>
      (filter === 'All' || p.primaryPosition === filter) &&
      (search === '' || p.displayName.toLowerCase().includes(search.toLowerCase()) ||
        p.team?.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nationality?.toLowerCase().includes(search.toLowerCase()))
    ), [players, filter, search]);

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Roster</div>
        <h1 className="hero-title">Players</h1>
        <p className="hero-sub">Every player across the top leagues — click to view detailed stats, xG, career history and more.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {POSITIONS.map((pos) => (
          <button key={pos} onClick={() => setFilter(pos)}
            style={{ background: filter === pos ? (POS_COLOR[pos] ?? 'var(--accent)') : 'var(--surface)', border: `1px solid ${filter === pos ? (POS_COLOR[pos] ?? 'var(--accent)') : 'var(--border)'}`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
            {pos}
          </button>
        ))}
      </div>

      <div className="search-bar" style={{ marginBottom: 24 }}>
        <input type="text" placeholder="Search players, teams, nationality..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="search-icon">⌕</span>
      </div>

      {/* Player cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {shown.map((p) => {
          const color = p.team?.primaryColor ?? POS_COLOR[p.primaryPosition ?? ''] ?? '#6b7a99';
          return (
            <a key={p.id} href={`/players/${p.slug}`}
              style={{ display: 'block', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, textDecoration: 'none', transition: 'border-color .15s, transform .15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = color; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color, flexShrink: 0 }}>
                  {p.displayName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2 }}>{p.displayName}</div>
                  {p.team && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{p.team.name}</div>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.primaryPosition && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: `${POS_COLOR[p.primaryPosition] ?? '#6b7a99'}22`, color: POS_COLOR[p.primaryPosition] ?? 'var(--muted)' }}>
                    {p.primaryPosition}
                  </span>
                )}
                {p.nationality && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'var(--surface2)', color: 'var(--muted)' }}>{p.nationality}</span>}
                {p.heightCm && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: 'var(--surface2)', color: 'var(--muted)' }}>{p.heightCm}cm</span>}
              </div>
            </a>
          );
        })}
        {shown.length === 0 && <div className="empty" style={{ gridColumn: '1/-1' }}>No players found</div>}
      </div>
    </>
  );
}
