const API = process.env['FOOTIE_API_URL'] ?? 'http://localhost:3001';

interface Team {
  id: string;
  name: string;
  slug: string;
}

interface Match {
  id: string;
  kickoffAt: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  homeTeam: Team;
  awayTeam: Team;
  competition: { name: string };
  season: { label: string };
}

interface MatchesResponse {
  matches: Match[];
  meta: { total: number; competitions: number; teams: number };
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  }) + ' UTC';
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'live' ? 'status-live' : status === 'finished' ? 'status-finished' : 'status-scheduled';
  return <span className={`match-status ${cls}`}>{status === 'live' ? '● LIVE' : status.toUpperCase()}</span>;
}

async function getMatches(): Promise<MatchesResponse> {
  const res = await fetch(`${API}/api/matches`, { cache: 'no-store' });
  if (!res.ok) throw new Error('API unreachable');
  return res.json() as Promise<MatchesResponse>;
}

export default async function HomePage() {
  let data: MatchesResponse | null = null;
  let error: string | null = null;

  try {
    data = await getMatches();
  } catch {
    error = 'Could not reach API — start the API server with: cd services/api && pnpm dev';
  }

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Live Intelligence Layer</div>
        <h1 className="hero-title">Search the<br />football graph</h1>
        <p className="hero-sub">
          Canonical data · validated truth · {data ? `${data.meta.total} match${data.meta.total !== 1 ? 'es' : ''} across ${data.meta.competitions} competition${data.meta.competitions !== 1 ? 's' : ''}` : 'connecting to API...'}
        </p>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search players, teams, competitions..." readOnly />
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <div className="section-header">
        <span className="section-title">Fixtures</span>
        {data && <a href="/pipeline" className="section-link">View pipeline →</a>}
      </div>

      {error && <div className="empty">{error}</div>}

      {data && (
        <div className="match-grid">
          {data.matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="home-side">
                <div className="team-badge">{initials(match.homeTeam.name)}</div>
                <div className="team">
                  <span className="team-name home">{match.homeTeam.name}</span>
                </div>
              </div>

              <div className="match-center">
                {match.status === 'finished' ? (
                  <span className="match-score">{match.homeScore ?? 0} – {match.awayScore ?? 0}</span>
                ) : (
                  <span className="match-vs">VS</span>
                )}
                <StatusBadge status={match.status} />
                <span className="match-time">{formatKickoff(match.kickoffAt)}</span>
                <span className="match-time" style={{ color: '#4b6080' }}>{match.competition.name} · {match.season.label}</span>
              </div>

              <div className="away-side">
                <div className="team-badge">{initials(match.awayTeam.name)}</div>
                <div className="team">
                  <span className="team-name away">{match.awayTeam.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
