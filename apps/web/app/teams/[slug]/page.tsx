'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Player {
  id: string; slug: string; displayName: string; primaryPosition: string | null;
  nationality: string | null; birthDate: string | null; heightCm: number | null;
  stats: {
    appearances: number; goals: number; assists: number; shots: number; xg: number;
    xa: number; passes: number; passAccuracy: number; yellowCards: number; redCards: number;
    minutesPlayed: number; distanceKm: number; topSpeedKmh: number;
  } | null;
}

interface TeamDetail {
  team: {
    id: string; slug: string; name: string; countryCode: string | null;
    founded: number | null; stadium: string | null; stadiumCapacity: number | null;
    nickname: string | null; description: string | null; primaryColor: string | null;
    manager: { id: string; slug: string; name: string; nationality: string | null } | null;
  };
  stats: {
    overall: { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number; cleanSheets: number };
    home: { played: number; won: number; drawn: number; lost: number; gf: number; ga: number };
    away: { played: number; won: number; drawn: number; lost: number; gf: number; ga: number };
    form: { matchId: string; opponent: string; score: string; result: 'W' | 'D' | 'L'; kickoffAt: string }[];
  } | null;
  squad: Player[];
  recentMatches: { matchId: string; kickoffAt: string; homeTeam: string | null; awayTeam: string | null; homeScore: number | null; awayScore: number | null; competition: string | null }[];
}

const RESULT_COLOR = { W: '#16a34a', D: '#3b82f6', L: '#ef4444' };
const POS_COLOR: Record<string, string> = { GK: '#f59e0b', DEF: '#3b82f6', MID: '#8b5cf6', FWD: '#ef4444', ATT: '#ef4444' };

export default function TeamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<TeamDetail | null>(null);
  const [tab, setTab] = useState<'season' | 'squad' | 'history'>('season');

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/teams/${slug}`).then((r) => r.json()).then(setData);
  }, [slug]);

  if (!data) return <div className="empty">Loading...</div>;

  const { team, stats, squad, recentMatches } = data;
  const color = team.primaryColor ?? '#16a34a';

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <a href="/teams" style={{ fontSize: 13, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← All Teams</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: `${color}22`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color, flexShrink: 0 }}>
            {team.name[0]}
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(22px,5vw,36px)', fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>{team.name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {team.nickname && <span style={{ fontSize: 12, color: 'var(--muted)' }}>"{team.nickname}"</span>}
              {team.founded && <span style={{ fontSize: 12, background: 'var(--surface2)', borderRadius: 4, padding: '2px 8px', color: 'var(--muted)' }}>Est. {team.founded}</span>}
              {team.manager && (
                <a href={`/managers/${team.manager.slug}`} style={{ fontSize: 12, background: `${color}22`, borderRadius: 4, padding: '2px 8px', color }}>
                  {team.manager.name}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {(['season', 'squad', 'history'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${color}` : '2px solid transparent', padding: '10px 18px', cursor: 'pointer', color: tab === t ? 'var(--text)' : 'var(--muted)', fontSize: 14, fontWeight: 600, textTransform: 'capitalize', marginBottom: -1 }}>
            {t === 'season' ? 'Season Stats' : t === 'squad' ? 'Squad' : 'History'}
          </button>
        ))}
      </div>

      {/* ── SEASON STATS ── */}
      {tab === 'season' && stats && (
        <div>
          {/* Form */}
          <div style={{ marginBottom: 24 }}>
            <div className="section-header"><span className="section-title">Recent Form</span></div>
            <div style={{ display: 'flex', gap: 8 }}>
              {stats.form.map((f, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: RESULT_COLOR[f.result], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                    {f.result}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{f.score}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', maxWidth: 40, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.opponent}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall stats */}
          <div className="section-header"><span className="section-title">2025–26 Season</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Played', value: stats.overall.played },
              { label: 'Won', value: stats.overall.won, color: '#16a34a' },
              { label: 'Drawn', value: stats.overall.drawn, color: '#3b82f6' },
              { label: 'Lost', value: stats.overall.lost, color: '#ef4444' },
              { label: 'Goals For', value: stats.overall.gf },
              { label: 'Goals Against', value: stats.overall.ga },
              { label: 'Goal Diff', value: (stats.overall.gd > 0 ? '+' : '') + stats.overall.gd, color: stats.overall.gd >= 0 ? '#16a34a' : '#ef4444' },
              { label: 'Points', value: stats.overall.points, color },
              { label: 'Clean Sheets', value: stats.overall.cleanSheets },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color: s.color ?? 'var(--text)', fontSize: 24 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Home vs Away */}
          <div className="section-header"><span className="section-title">Home vs Away</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            {[{ label: 'Home', d: stats.home }, { label: 'Away', d: stats.away }].map(({ label, d }) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[{ l: 'P', v: d.played }, { l: 'W', v: d.won }, { l: 'D', v: d.drawn }, { l: 'L', v: d.lost }, { l: 'GF', v: d.gf }, { l: 'GA', v: d.ga }].map((x) => (
                    <div key={x.l} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>{x.l}</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recent matches */}
          <div className="section-header"><span className="section-title">Recent Matches</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentMatches.slice(0, 8).map((m) => {
              const isHome = m.homeTeam?.toLowerCase().includes(team.name.toLowerCase().slice(0, 4));
              return (
                <div key={m.matchId} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{m.homeTeam} <span style={{ color: 'var(--muted)' }}>vs</span> {m.awayTeam}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, minWidth: 60, textAlign: 'center' }}>{m.homeScore ?? 0}–{m.awayScore ?? 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', minWidth: 80, textAlign: 'right' }}>{m.competition}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SQUAD ── */}
      {tab === 'squad' && (
        <div>
          <div className="section-header"><span className="section-title">Squad — 2025–26</span></div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Player', 'Pos', 'Nation', 'Apps', 'G', 'A', 'Shots', 'xG', 'Pass%', 'YC', 'RC', 'Mins'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Player' ? 'left' : 'center', color: 'var(--muted)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {squad.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '10px 10px' }}>
                      <a href={`/players/${p.slug}`} style={{ fontWeight: 700, color: 'var(--text)' }}>{p.displayName}</a>
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                      {p.primaryPosition && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${POS_COLOR[p.primaryPosition] ?? '#6b7a99'}22`, color: POS_COLOR[p.primaryPosition] ?? 'var(--muted)' }}>
                          {p.primaryPosition}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', color: 'var(--muted)', fontSize: 12 }}>{p.nationality ?? '—'}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>{p.stats?.appearances ?? 0}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>{p.stats?.goals ?? 0}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', color: '#3b82f6', fontWeight: 600 }}>{p.stats?.assists ?? 0}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>{p.stats?.shots ?? 0}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>{p.stats?.xg?.toFixed(1) ?? '0.0'}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center' }}>{p.stats?.passAccuracy?.toFixed(0) ?? '0'}%</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', color: '#eab308' }}>{p.stats?.yellowCards ?? 0}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', color: '#ef4444' }}>{p.stats?.redCards ?? 0}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'center', color: 'var(--muted)' }}>{p.stats?.minutesPlayed ?? 0}</td>
                  </tr>
                ))}
                {squad.length === 0 && (
                  <tr><td colSpan={12} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No squad data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div>
          {team.description && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>About</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)' }}>{team.description}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            {team.founded && (
              <div className="stat-card">
                <div className="stat-label">Founded</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{team.founded}</div>
              </div>
            )}
            {team.stadium && (
              <div className="stat-card">
                <div className="stat-label">Stadium</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{team.stadium}</div>
                {team.stadiumCapacity && <div className="stat-sub">{team.stadiumCapacity.toLocaleString()} capacity</div>}
              </div>
            )}
            {team.countryCode && (
              <div className="stat-card">
                <div className="stat-label">Country</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{team.countryCode}</div>
              </div>
            )}
          </div>

          {team.manager && (
            <div>
              <div className="section-header"><span className="section-title">Current Manager</span></div>
              <a href={`/managers/${team.manager.slug}`}
                style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textDecoration: 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color }}>
                  {team.manager.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{team.manager.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{team.manager.nationality}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 18 }}>→</div>
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
