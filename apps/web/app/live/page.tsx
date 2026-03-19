'use client';
import { useState, useEffect, useRef } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Match { id: string; status: string; homeTeam: { name: string } | null; awayTeam: { name: string } | null; competition: { name: string } | null; kickoffAt: string; homeScore: number | null; awayScore: number | null }
interface LiveEvent { type: string; minute: number; team?: string; player?: string; description: string; homeScore: number; awayScore: number }
interface LiveState { matchId: string; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; minute: number; status: string; events: LiveEvent[] }

const EVENT_ICONS: Record<string, string> = { kickoff: '⚽', goal: '⚽', yellow_card: '🟨', red_card: '🟥', var_check: '📺', halftime: '🔔', second_half: '▶️', fulltime: '🏁', goal_disallowed: '❌', connecting: '📡' };
const EVENT_COLORS: Record<string, string> = { goal: '#16a34a', yellow_card: '#eab308', red_card: '#ef4444', halftime: '#3b82f6', fulltime: '#a855f7', var_check: '#6b7a99', kickoff: '#16a34a', second_half: '#3b82f6' };

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connecting, setConnecting] = useState(false);
  const eventsRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetch(`${API}/api/matches?limit=200`)
      .then((r) => r.json())
      .then((d: { matches: Match[] }) => {
        setMatches(d.matches);
        const first = d.matches[0];
        if (first) setSelectedId(first.id);
      });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    setEvents([]);
    setLiveState(null);
    setConnecting(true);

    // Start the simulation, then connect SSE
    fetch(`${API}/api/live/start/${selectedId}`)
      .then(() => {
        const es = new EventSource(`${API}/api/live/stream/${selectedId}`);
        esRef.current = es;

        es.addEventListener('state', (e) => {
          const data = JSON.parse(e.data) as LiveState;
          setLiveState(data);
          setEvents(data.events);
          setConnecting(false);
        });

        es.addEventListener('event', (e) => {
          const ev = JSON.parse(e.data) as LiveEvent;
          setLiveState((prev) => prev ? { ...prev, homeScore: ev.homeScore, awayScore: ev.awayScore, minute: ev.minute, status: ev.type === 'halftime' ? 'halftime' : ev.type === 'fulltime' ? 'fulltime' : prev.status } : null);
          setEvents((prev) => [ev, ...prev].slice(0, 50));
        });

        es.addEventListener('connecting', (e) => {
          const data = JSON.parse(e.data) as { message: string };
          setConnecting(false);
          setEvents([{ type: 'connecting', minute: 0, description: data.message, homeScore: 0, awayScore: 0 }]);
        });

        es.onerror = () => setConnecting(false);
      });

    return () => { if (esRef.current) { esRef.current.close(); esRef.current = null; } };
  }, [selectedId]);

  useEffect(() => {
    if (eventsRef.current) eventsRef.current.scrollTop = 0;
  }, [events.length]);

  const m = matches.find((x) => x.id === selectedId);

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Live Engine</div>
        <h1 className="hero-title">Live<br />Match Centre</h1>
        <p className="hero-sub">Real-time match simulation via SSE — goals, cards, VAR, halftime. Select any match.</p>
      </div>

      {/* Match selector */}
      <div className="section-header"><span className="section-title">Select match to simulate</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28, maxHeight: 200, overflowY: 'auto' }}>
        {matches.map((x) => (
          <div key={x.id} onClick={() => setSelectedId(x.id)}
            style={{ background: selectedId === x.id ? 'var(--surface2)' : 'var(--surface)', border: `1px solid ${selectedId === x.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{x.homeTeam?.name} vs {x.awayTeam?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{x.competition?.name}</div>
          </div>
        ))}
      </div>

      {/* Live scoreboard */}
      {m && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>
            {liveState?.status === 'fulltime' ? '⬜ FULL TIME' : liveState?.status === 'halftime' ? '⏸ HALF TIME' : liveState?.status !== 'pre' ? '🔴 LIVE' : '⚫ SIMULATION'}
            {liveState && liveState.minute > 0 && liveState.status !== 'halftime' && liveState.status !== 'fulltime' ? ` ${liveState.minute}'` : ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{liveState?.homeTeam ?? m.homeTeam?.name}</div>
            </div>
            <div style={{ minWidth: 120, textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 4, lineHeight: 1 }}>
                {liveState ? `${liveState.homeScore} – ${liveState.awayScore}` : connecting ? '…' : '0 – 0'}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{liveState?.awayTeam ?? m.awayTeam?.name}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{m.competition?.name}</div>
        </div>
      )}

      {/* Event feed */}
      <div className="section-header"><span className="section-title">Match events</span></div>
      <div ref={eventsRef} style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 480, overflowY: 'auto' }}>
        {connecting && <div className="empty">Starting simulation...</div>}
        {events.length === 0 && !connecting && <div className="empty" style={{ padding: 24 }}>Select a match above to start the live simulation</div>}
        {events.map((ev, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${ev.type === 'goal' ? 'var(--accent)' : ev.type === 'yellow_card' ? '#eab308' : 'var(--border)'}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, animation: i === 0 ? 'slideIn .3s ease' : 'none' }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{EVENT_ICONS[ev.type] ?? '•'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: ev.type === 'goal' ? 700 : 500, color: EVENT_COLORS[ev.type] ?? 'var(--text)' }}>{ev.description}</div>
              {ev.player && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{ev.team === 'home' ? (liveState?.homeTeam ?? '') : (liveState?.awayTeam ?? '')} · {ev.player}</div>}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--muted)', minWidth: 60, textAlign: 'right' }}>{ev.homeScore}–{ev.awayScore}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
