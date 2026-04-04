'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface PlayerDetail {
  player: {
    id: string; slug: string; displayName: string; primaryPosition: string | null;
    nationality: string | null; birthDate: string | null; heightCm: number | null;
    weightKg: number | null; description: string | null;
    team: { id: string; slug: string; name: string; primaryColor: string | null } | null;
  };
  stats: {
    id: number; seasonLabel: string; competitionSlug: string;
    appearances: number; starts: number; minutesPlayed: number;
    goals: number; assists: number; shots: number; shotsOnTarget: number;
    xg: number; xa: number; passes: number; passAccuracy: number;
    keyPasses: number; dribblesCompleted: number; tackles: number; interceptions: number;
    yellowCards: number; redCards: number; freeKicks: number;
    penaltiesScored: number; penaltiesTaken: number; throwIns: number;
    distanceKm: number; topSpeedKmh: number;
  }[];
  career: {
    id: number; startedAt: string; endedAt: string | null; isCurrent: boolean;
    appearances: number; goals: number; assists: number;
    team: { id: string; slug: string; name: string; primaryColor: string | null } | null;
  }[];
}

const POS_COLOR: Record<string, string> = { GK: '#f59e0b', DEF: '#3b82f6', MID: '#8b5cf6', FWD: '#ef4444', ATT: '#ef4444' };

function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 700 }}>{value}{sub && <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>{sub}</span>}</span>
    </div>
  );
}

export default function PlayerDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PlayerDetail | null>(null);
  const [tab, setTab] = useState<'stats' | 'career'>('stats');

  useEffect(() => {
    if (!slug) return;
    fetch(`${API}/api/players/${slug}`).then((r) => r.json()).then(setData);
  }, [slug]);

  if (!data) return <div className="empty">Loading...</div>;

  const { player, stats, career } = data;
  const currentStats = stats[0];
  const color = player.team?.primaryColor ?? POS_COLOR[player.primaryPosition ?? ''] ?? '#6b7a99';

  const age = player.birthDate
    ? Math.floor((Date.now() - new Date(player.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <>
      {/* Back */}
      <a href="/players" style={{ fontSize: 13, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>← All Players</a>

      {/* Player header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, background: `${color}22`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color, flexShrink: 0 }}>
          {player.displayName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h1 style={{ fontSize: 'clamp(22px,5vw,34px)', fontWeight: 900, letterSpacing: -0.5, marginBottom: 6 }}>{player.displayName}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {player.primaryPosition && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: `${POS_COLOR[player.primaryPosition] ?? '#6b7a99'}22`, color: POS_COLOR[player.primaryPosition] ?? 'var(--muted)' }}>
                {player.primaryPosition}
              </span>
            )}
            {player.team && (
              <a href={`/teams/${player.team.slug}`} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: `${color}22`, color }}>
                {player.team.name}
              </a>
            )}
            {player.nationality && <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: 'var(--surface2)', color: 'var(--muted)' }}>{player.nationality}</span>}
            {age && <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: 'var(--surface2)', color: 'var(--muted)' }}>Age {age}</span>}
            {player.heightCm && <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, background: 'var(--surface2)', color: 'var(--muted)' }}>{player.heightCm}cm</span>}
          </div>
        </div>
      </div>

      {/* Quick stat bar */}
      {currentStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10, marginBottom: 28 }}>
          {[
            { l: 'Apps', v: currentStats.appearances },
            { l: 'Goals', v: currentStats.goals, c: '#16a34a' },
            { l: 'Assists', v: currentStats.assists, c: '#3b82f6' },
            { l: 'xG', v: currentStats.xg.toFixed(1) },
            { l: 'xA', v: currentStats.xa.toFixed(1) },
            { l: 'Minutes', v: currentStats.minutesPlayed },
          ].map((s) => (
            <div key={s.l} className="stat-card" style={{ textAlign: 'center' }}>
              <div className="stat-label" style={{ textAlign: 'center' }}>{s.l}</div>
              <div className="stat-value" style={{ fontSize: 22, color: (s as { c?: string }).c ?? 'var(--text)', textAlign: 'center' }}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {(['stats', 'career'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: 'none', border: 'none', borderBottom: tab === t ? `2px solid ${color}` : '2px solid transparent', padding: '10px 18px', cursor: 'pointer', color: tab === t ? 'var(--text)' : 'var(--muted)', fontSize: 14, fontWeight: 600, textTransform: 'capitalize', marginBottom: -1 }}>
            {t === 'stats' ? 'Season Stats' : 'Career History'}
          </button>
        ))}
      </div>

      {/* ── STATS ── */}
      {tab === 'stats' && currentStats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Attacking */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Attacking</div>
            <StatRow label="Goals" value={currentStats.goals} />
            <StatRow label="Assists" value={currentStats.assists} />
            <StatRow label="Shots" value={currentStats.shots} />
            <StatRow label="Shots on Target" value={currentStats.shotsOnTarget} />
            <StatRow label="xG" value={currentStats.xg.toFixed(2)} sub="expected goals" />
            <StatRow label="xA" value={currentStats.xa.toFixed(2)} sub="expected assists" />
            <StatRow label="Key Passes" value={currentStats.keyPasses} />
            <StatRow label="Dribbles Completed" value={currentStats.dribblesCompleted} />
            <StatRow label="Penalties Scored" value={`${currentStats.penaltiesScored}/${currentStats.penaltiesTaken}`} />
            <StatRow label="Free Kicks" value={currentStats.freeKicks} />
          </div>

          {/* Passing & Physical */}
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Passing</div>
              <StatRow label="Passes" value={currentStats.passes} />
              <StatRow label="Pass Accuracy" value={`${currentStats.passAccuracy.toFixed(1)}%`} />
              <StatRow label="Key Passes" value={currentStats.keyPasses} />
              <StatRow label="Throw-ins" value={currentStats.throwIns} />
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Defensive</div>
              <StatRow label="Tackles" value={currentStats.tackles} />
              <StatRow label="Interceptions" value={currentStats.interceptions} />
              <StatRow label="Yellow Cards" value={currentStats.yellowCards} />
              <StatRow label="Red Cards" value={currentStats.redCards} />
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Physical</div>
              <StatRow label="Minutes Played" value={currentStats.minutesPlayed} />
              <StatRow label="Starts" value={`${currentStats.starts}/${currentStats.appearances}`} sub="starts/apps" />
              <StatRow label="Distance Run" value={`${currentStats.distanceKm.toFixed(1)} km`} />
              <StatRow label="Top Speed" value={`${currentStats.topSpeedKmh.toFixed(1)} km/h`} />
            </div>
          </div>
        </div>
      )}
      {tab === 'stats' && !currentStats && <div className="empty">No stats available for current season</div>}

      {/* ── CAREER ── */}
      {tab === 'career' && (
        <div>
          {player.description && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}>{player.description}</p>
            </div>
          )}
          <div className="section-header"><span className="section-title">Career History</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {career.map((c) => {
              const tc = c.team?.primaryColor ?? '#6b7a99';
              return (
                <div key={c.id} style={{ background: 'var(--surface)', border: `1px solid ${c.isCurrent ? tc : 'var(--border)'}`, borderRadius: 12, padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${tc}22`, border: `2px solid ${tc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: tc, flexShrink: 0 }}>
                    {c.team?.name?.[0] ?? '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {c.team ? (
                        <a href={`/teams/${c.team.slug}`} style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{c.team.name}</a>
                      ) : <span style={{ fontSize: 15, fontWeight: 700 }}>Unknown</span>}
                      {c.isCurrent && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: `${tc}33`, color: tc }}>CURRENT</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {c.startedAt.slice(0, 4)} – {c.endedAt ? c.endedAt.slice(0, 4) : 'Present'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
                    <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>Apps</div><div style={{ fontSize: 15, fontWeight: 700 }}>{c.appearances}</div></div>
                    <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>Goals</div><div style={{ fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{c.goals}</div></div>
                    <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>Assists</div><div style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6' }}>{c.assists}</div></div>
                  </div>
                </div>
              );
            })}
            {career.length === 0 && <div className="empty">No career history available</div>}
          </div>
        </div>
      )}
    </>
  );
}
