'use client';
import { useState, useEffect } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

const LEAGUE_MAP: Record<string, { name: string; flag: string }> = {
  ENG: { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  ESP: { name: 'La Liga', flag: '🇪🇸' },
  DEU: { name: 'Bundesliga', flag: '🇩🇪' },
  ITA: { name: 'Serie A', flag: '🇮🇹' },
};

interface Manager { id: string; slug: string; name: string; nationality: string | null }
interface Team {
  id: string; slug: string; name: string; countryCode: string | null;
  founded: number | null; stadium: string | null; stadiumCapacity: number | null;
  nickname: string | null; primaryColor: string | null; description: string | null;
  manager: Manager | null;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filter, setFilter] = useState('ENG');

  useEffect(() => {
    fetch(`${API}/api/teams`).then((r) => r.json()).then((d: { teams: Team[] }) => setTeams(d.teams));
  }, []);

  const grouped = teams.reduce<Record<string, Team[]>>((acc, t) => {
    const key = t.countryCode ?? 'OTHER';
    (acc[key] ??= []).push(t);
    return acc;
  }, {});

  const leagues = Object.keys(grouped).filter((k) => k in LEAGUE_MAP);
  const shown = grouped[filter] ?? [];

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Clubs</div>
        <h1 className="hero-title">Teams</h1>
        <p className="hero-sub">All clubs across Europe's top leagues — click a team to explore their stats, squad, and history.</p>
      </div>

      {/* League tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {leagues.map((code) => (
          <button key={code} onClick={() => setFilter(code)}
            style={{ background: filter === code ? 'var(--accent)' : 'var(--surface)', border: `1px solid ${filter === code ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>
            {LEAGUE_MAP[code]?.flag} {LEAGUE_MAP[code]?.name ?? code} <span style={{ color: filter === code ? 'rgba(255,255,255,0.7)' : 'var(--muted)', fontSize: 11, marginLeft: 4 }}>({grouped[code]?.length})</span>
          </button>
        ))}
      </div>

      {/* Teams grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {shown.map((team) => (
          <a key={team.id} href={`/teams/${team.slug}`}
            style={{ display: 'block', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, cursor: 'pointer', textDecoration: 'none', transition: 'border-color .15s, transform .15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = team.primaryColor ?? 'var(--accent)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}>
            {/* Badge */}
            <div style={{ width: 48, height: 48, borderRadius: 12, background: team.primaryColor ? `${team.primaryColor}22` : 'var(--surface2)', border: `2px solid ${team.primaryColor ?? 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 20, fontWeight: 800, color: team.primaryColor ?? 'var(--text)' }}>
              {team.name[0]}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{team.name}</div>
            {team.nickname && <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>"{team.nickname}"</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {team.founded && <span style={{ fontSize: 11, background: 'var(--surface2)', borderRadius: 4, padding: '2px 6px', color: 'var(--muted)' }}>Est. {team.founded}</span>}
              {team.stadium && <span style={{ fontSize: 11, background: 'var(--surface2)', borderRadius: 4, padding: '2px 6px', color: 'var(--muted)' }}>🏟 {team.stadium}</span>}
            </div>
            {team.manager && (
              <div style={{ fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                Manager: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{team.manager.name}</span>
              </div>
            )}
          </a>
        ))}
        {shown.length === 0 && <div className="empty">No teams found</div>}
      </div>
    </>
  );
}
