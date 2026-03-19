'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface ManagerDetail {
  manager: {
    id: string; slug: string; name: string; nationality: string | null;
    birthDate: string | null; description: string | null;
    currentTeam: { id: string; slug: string; name: string; primaryColor: string | null } | null;
  };
  stints: {
    id: number; startedAt: string; endedAt: string | null; isCurrent: boolean;
    matches: number; wins: number; draws: number; losses: number;
    trophies: string | null; notes: string | null;
    team: { id: string; slug: string; name: string; primaryColor: string | null } | null;
  }[];
}

export default function ManagerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<ManagerDetail | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/managers/${slug}`).then((r) => r.json()).then(setData);
  }, [slug]);

  if (!data) return <div className="empty">Loading...</div>;

  const { manager, stints } = data;
  const color = manager.currentTeam?.primaryColor ?? '#6b7a99';
  const age = manager.birthDate
    ? Math.floor((Date.now() - new Date(manager.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  // Aggregate career totals
  const totals = stints.reduce(
    (acc, s) => ({ m: acc.m + s.matches, w: acc.w + s.wins, d: acc.d + s.draws, l: acc.l + s.losses }),
    { m: 0, w: 0, d: 0, l: 0 }
  );
  const winRate = totals.m > 0 ? ((totals.w / totals.m) * 100).toFixed(1) : '0.0';

  return (
    <>
      <a href="/managers" style={{ fontSize: 13, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← All Managers</a>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: `${color}22`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color, flexShrink: 0 }}>
          {manager.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(22px,5vw,34px)', fontWeight: 900, letterSpacing: -0.5, marginBottom: 6 }}>{manager.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {manager.nationality && <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: 'var(--surface2)', color: 'var(--muted)' }}>{manager.nationality}</span>}
            {age && <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: 'var(--surface2)', color: 'var(--muted)' }}>Age {age}</span>}
            {manager.currentTeam && (
              <a href={`/teams/${manager.currentTeam.slug}`} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: `${color}22`, color }}>
                {manager.currentTeam.name}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Career totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Matches', value: totals.m },
          { label: 'Wins', value: totals.w, color: '#16a34a' },
          { label: 'Draws', value: totals.d, color: '#3b82f6' },
          { label: 'Losses', value: totals.l, color: '#ef4444' },
          { label: 'Win Rate', value: `${winRate}%`, color: Number(winRate) >= 50 ? '#16a34a' : 'var(--text)' },
          { label: 'Clubs Managed', value: stints.length },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-label" style={{ textAlign: 'center' }}>{s.label}</div>
            <div className="stat-value" style={{ fontSize: 22, color: (s as { color?: string }).color ?? 'var(--text)', textAlign: 'center' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      {manager.description && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 28 }}>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{manager.description}</p>
        </div>
      )}

      {/* Stints */}
      <div className="section-header"><span className="section-title">Career History</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {stints.map((s) => {
          const tc = s.team?.primaryColor ?? '#6b7a99';
          const wr = s.matches > 0 ? ((s.wins / s.matches) * 100).toFixed(0) : '0';
          const trophyList = s.trophies ? s.trophies.split(',').map((t) => t.trim()).filter(Boolean) : [];
          return (
            <div key={s.id} style={{ background: 'var(--surface)', border: `1px solid ${s.isCurrent ? tc : 'var(--border)'}`, borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `${tc}22`, border: `2px solid ${tc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: tc, flexShrink: 0 }}>
                  {s.team?.name?.[0] ?? '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {s.team ? (
                      <a href={`/teams/${s.team.slug}`} style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{s.team.name}</a>
                    ) : <span style={{ fontSize: 16, fontWeight: 800 }}>Unknown</span>}
                    {s.isCurrent && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${tc}33`, color: tc }}>CURRENT</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {s.startedAt.slice(0, 4)} – {s.endedAt ? s.endedAt.slice(0, 4) : 'Present'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, textAlign: 'center' }}>
                  <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>P</div><div style={{ fontSize: 16, fontWeight: 800 }}>{s.matches}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>W</div><div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{s.wins}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>D</div><div style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6' }}>{s.draws}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>L</div><div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>{s.losses}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>Win%</div><div style={{ fontSize: 16, fontWeight: 800, color: Number(wr) >= 50 ? '#16a34a' : 'var(--text)' }}>{wr}%</div></div>
                </div>
              </div>
              {trophyList.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {trophyList.map((t, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f59e0b22', color: '#f59e0b', fontWeight: 600 }}>
                      🏆 {t}
                    </span>
                  ))}
                </div>
              )}
              {s.notes && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: trophyList.length > 0 ? 8 : 0 }}>{s.notes}</div>}
            </div>
          );
        })}
        {stints.length === 0 && <div className="empty">No career history available</div>}
      </div>
    </>
  );
}
