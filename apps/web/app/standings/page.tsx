'use client';
import { useState, useEffect } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

const COMPETITIONS = [
  { slug: 'premier-league', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { slug: 'la-liga', name: 'La Liga', flag: '🇪🇸' },
  { slug: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
  { slug: 'serie-a', name: 'Serie A', flag: '🇮🇹' },
  { slug: 'champions-league', name: 'Champions League', flag: '⭐' },
];

interface TableRow {
  position: number; name: string; slug: string;
  played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; gd: number; points: number;
  form: string[];
}

const FORM_COLORS: Record<string, string> = { W: '#16a34a', D: '#3b82f6', L: '#ef4444' };

export default function StandingsPage() {
  const [comp, setComp] = useState('premier-league');
  const [table, setTable] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [compName, setCompName] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/standings/${comp}`)
      .then((r) => r.json())
      .then((d: { table: TableRow[]; competition: { name: string } }) => {
        setTable(d.table);
        setCompName(d.competition.name);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [comp]);

  const compInfo = COMPETITIONS.find((c) => c.slug === comp);

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Live Standings</div>
        <h1 className="hero-title">League<br />Tables</h1>
        <p className="hero-sub">{compName || 'Loading...'} · 2025-26 season · Matchday 28</p>
      </div>

      {/* Competition selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {COMPETITIONS.map((c) => (
          <button key={c.slug} onClick={() => setComp(c.slug)}
            style={{ background: comp === c.slug ? 'var(--accent)' : 'var(--surface)', border: '1px solid', borderColor: comp === c.slug ? 'var(--accent)' : 'var(--border)', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 600, color: comp === c.slug ? '#fff' : 'var(--muted)', cursor: 'pointer' }}>
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      {loading && <div className="empty">Loading table...</div>}

      {!loading && table.length === 0 && <div className="empty">No results yet for this competition.</div>}

      {table.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 44px 44px 44px 44px 44px 44px 44px 52px 100px', padding: '10px 16px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)' }}>
            <span>#</span><span>Team</span><span style={{ textAlign: 'center' }}>P</span><span style={{ textAlign: 'center' }}>W</span><span style={{ textAlign: 'center' }}>D</span><span style={{ textAlign: 'center' }}>L</span><span style={{ textAlign: 'center' }}>GF</span><span style={{ textAlign: 'center' }}>GA</span><span style={{ textAlign: 'center' }}>GD</span><span style={{ textAlign: 'center' }}>Pts</span><span style={{ textAlign: 'center' }}>Form</span>
          </div>

          {table.map((row, i) => {
            const zoneColor = row.position <= 4 ? '#1e3a5f' : row.position >= table.length - 2 ? '#3f1515' : 'transparent';
            return (
              <div key={row.slug}
                style={{ display: 'grid', gridTemplateColumns: '36px 1fr 44px 44px 44px 44px 44px 44px 44px 52px 100px', padding: '11px 16px', borderBottom: i < table.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', background: zoneColor, transition: 'background .15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = zoneColor)}>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.position <= 4 ? '#3b82f6' : row.position >= table.length - 2 ? '#ef4444' : 'var(--muted)' }}>{row.position}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{row.name}</span>
                {[row.played, row.won, row.drawn, row.lost, row.gf, row.ga].map((v, j) => (
                  <span key={j} style={{ textAlign: 'center', fontSize: 13, color: j === 1 ? 'var(--accent)' : j === 3 ? '#ef4444' : 'var(--text)' }}>{v}</span>
                ))}
                <span style={{ textAlign: 'center', fontSize: 13, color: row.gd > 0 ? 'var(--accent)' : row.gd < 0 ? '#ef4444' : 'var(--muted)' }}>{row.gd > 0 ? '+' : ''}{row.gd}</span>
                <span style={{ textAlign: 'center', fontSize: 15, fontWeight: 800, color: row.position <= 3 ? 'var(--accent)' : 'var(--text)' }}>{row.points}</span>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                  {row.form.map((f, j) => (
                    <span key={j} style={{ width: 16, height: 16, borderRadius: 3, background: FORM_COLORS[f] ?? 'var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>{f}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {table.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#1e3a5f', marginRight: 4 }} />Champions League</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#3f1515', marginRight: 4 }} />Relegation</span>
        </div>
      )}
    </>
  );
}
