'use client';
import { useState, useEffect } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Match {
  id: string; status: string; kickoffAt: string;
  homeScore: number | null; awayScore: number | null;
  homeTeam: { name: string }; awayTeam: { name: string };
  competition: { name: string };
}
interface Narrative { type: string; headline: string; body: string; tags: string[] }

export default function NarrativePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/matches`).then((r) => r.json()).then((d: { matches: Match[] }) => {
      setMatches(d.matches);
      if (d.matches[0]) setSelected(d.matches[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setNarrative(null);
    fetch(`${API}/api/narrative/${selected}`).then((r) => r.json()).then((d: { narrative: Narrative }) => {
      setNarrative(d.narrative);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selected]);

  const m = matches.find((x) => x.id === selected);

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Narrative Worker</div>
        <h1 className="hero-title">Match<br />Intelligence</h1>
        <p className="hero-sub">Auto-generated match previews and post-match reports from the canonical truth layer.</p>
      </div>

      <div className="section-header"><span className="section-title">Select a match</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
        {matches.map((x) => (
          <div key={x.id} onClick={() => setSelected(x.id)}
            style={{ background: selected === x.id ? 'var(--surface2)' : 'var(--surface)', border: `1px solid ${selected === x.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{x.homeTeam?.name} vs {x.awayTeam?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{x.competition?.name}</div>
            <span className={`match-status ${x.status === 'finished' ? 'status-finished' : 'status-scheduled'}`}>{x.status.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {m && (
        <>
          <div className="section-header">
            <span className="section-title">Generated Narrative — {narrative?.type ?? '...'}</span>
          </div>
          {loading && <div className="empty">Generating narrative...</div>}
          {narrative && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 28px', marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>{narrative.type}</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>{narrative.headline}</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 14 }}>{narrative.body}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                {narrative.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 11, background: 'var(--surface2)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 4 }}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
