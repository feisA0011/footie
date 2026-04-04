'use client';
import { useState, useEffect } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Team { id: string; name: string; slug: string }
interface Competition { id: string; name: string; slug: string }
interface Season { id: string; label: string }
interface Match {
  id: string; kickoffAt: string; status: string;
  homeScore: number | null; awayScore: number | null;
  homeTeam: Team; awayTeam: Team;
  competition: Competition; season: Season;
}
interface SearchResult { entityId: string; entityType: string; displayName: string }
interface MatchesResponse { matches?: Match[] }
interface SearchResponse { results?: SearchResult[] }

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}
function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' UTC';
}
function getCompetitions(matches: Match[]) {
  const competitions = new Map<string, { slug: string; name: string }>();
  for (const match of matches) {
    const slug = match.competition?.slug;
    const name = match.competition?.name;
    if (!slug || !name || competitions.has(slug)) continue;
    competitions.set(slug, { slug, name });
  }
  return [...competitions.values()];
}
function StatusBadge({ status }: { status: string }) {
  const cls = status === 'live' ? 'status-live' : status === 'finished' ? 'status-finished' : 'status-scheduled';
  return <span className={`match-status ${cls}`}>{status === 'live' ? '● LIVE' : status.toUpperCase()}</span>;
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filtered, setFiltered] = useState<Match[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeComp, setActiveComp] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/api/matches`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Matches request failed with ${r.status}`);
        return r.json() as Promise<MatchesResponse>;
      })
      .then((d) => {
        if (!Array.isArray(d.matches)) throw new Error('Invalid matches payload');
        if (cancelled) return;
        setMatches(d.matches);
        setFiltered(d.matches);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setMatches([]);
        setFiltered([]);
        setError('API unavailable — check services/api and database bootstrap.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeComp === 'all') { setFiltered(matches); return; }
    setFiltered(matches.filter((m) => m.competition?.slug === activeComp));
  }, [activeComp, matches]);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    let cancelled = false;

    const t = setTimeout(() => {
      fetch(`${API}/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(async (r) => {
          if (!r.ok) return { results: [] } as SearchResponse;
          return r.json() as Promise<SearchResponse>;
        })
        .then((d) => {
          if (!cancelled) {
            setSearchResults(Array.isArray(d.results) ? d.results : []);
          }
        })
        .catch(() => {
          if (!cancelled) setSearchResults([]);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery]);

  const competitions = getCompetitions(matches);

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Live Intelligence Layer</div>
        <h1 className="hero-title">Search the<br />football graph</h1>
        <p className="hero-sub">
          {loading ? 'Connecting to API...' : error ? error : `${matches.length} matches · ${competitions.length} competitions · 5 leagues`}
        </p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search players, teams, competitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        {searchResults.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginTop: 4, zIndex: 20, overflow: 'hidden' }}>
            {searchResults.map((r) => (
              <div key={r.entityId} onClick={() => setSearchQuery('')} style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', minWidth: 60, textAlign: 'center' }}>{r.entityType}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{r.displayName}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto', fontFamily: 'monospace' }}>{r.entityId}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competition filter tabs */}
      {!loading && !error && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[{ slug: 'all', name: 'All' }, ...competitions].map((c) => (
            <button key={c.slug} onClick={() => setActiveComp(c.slug)}
              style={{ background: activeComp === c.slug ? 'var(--accent)' : 'var(--surface)', border: '1px solid', borderColor: activeComp === c.slug ? 'var(--accent)' : 'var(--border)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: activeComp === c.slug ? '#fff' : 'var(--muted)', cursor: 'pointer', transition: 'all .15s' }}>
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="section-header">
        <span className="section-title">Fixtures &amp; Results {filtered.length !== matches.length ? `(${filtered.length})` : ''}</span>
        <a href="/pipeline" className="section-link">Pipeline →</a>
      </div>

      {loading && <div className="empty">Loading matches...</div>}
      {error && <div className="empty">{error}</div>}

      <div className="match-grid">
        {filtered.map((match) => (
          <div key={match.id} className="match-card">
            <div className="home-side">
              <div className="team-badge" style={{ background: 'var(--surface2)', color: 'var(--accent)' }}>{initials(match.homeTeam?.name ?? '?')}</div>
              <div className="team"><span className="team-name home">{match.homeTeam?.name}</span></div>
            </div>
            <div className="match-center">
              {match.status === 'finished' && match.homeScore != null
                ? <span className="match-score">{match.homeScore} – {match.awayScore}</span>
                : <span className="match-vs">VS</span>}
              <StatusBadge status={match.status} />
              <span className="match-time">{formatKickoff(match.kickoffAt)}</span>
              <span className="match-time" style={{ color: '#4b6080', fontSize: 11 }}>{match.competition?.name} · {match.season?.label}</span>
            </div>
            <div className="away-side">
              <div className="team-badge" style={{ background: 'var(--surface2)', color: 'var(--accent)' }}>{initials(match.awayTeam?.name ?? '?')}</div>
              <div className="team"><span className="team-name away">{match.awayTeam?.name}</span></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
