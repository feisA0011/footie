'use client';
import { useState, useEffect } from 'react';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Team { id: string; slug: string; name: string; primaryColor: string | null }
interface Manager {
  id: string; slug: string; name: string; nationality: string | null;
  birthDate: string | null; description: string | null;
  currentTeam: Team | null;
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);

  useEffect(() => {
    fetch(`${API}/api/managers`).then((r) => r.json()).then((d: { managers: Manager[] }) => setManagers(d.managers));
  }, []);

  return (
    <>
      <div className="hero">
        <div className="hero-eyebrow">Dugout</div>
        <h1 className="hero-title">Managers</h1>
        <p className="hero-sub">The tacticians behind the clubs — click to explore career history, win rates, and trophies.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {managers.map((m) => {
          const color = m.currentTeam?.primaryColor ?? '#6b7a99';
          const age = m.birthDate
            ? Math.floor((Date.now() - new Date(m.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
            : null;
          return (
            <a key={m.id} href={`/managers/${m.slug}`}
              style={{ display: 'block', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, textDecoration: 'none', transition: 'border-color .15s, transform .15s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = color; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${color}22`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color, flexShrink: 0 }}>
                  {m.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{m.nationality}{age ? ` · Age ${age}` : ''}</div>
                </div>
              </div>

              {m.currentTeam ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: `${color}11`, border: `1px solid ${color}33`, borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color }}>
                    {m.currentTeam.name[0]}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>{m.currentTeam.name}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color, opacity: 0.7 }}>CURRENT</span>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>No current club</div>
              )}
            </a>
          );
        })}
        {managers.length === 0 && <div className="empty">Loading managers...</div>}
      </div>
    </>
  );
}
