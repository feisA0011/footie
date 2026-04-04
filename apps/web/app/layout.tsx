import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Footie — Football Intelligence',
  description: 'Autonomous football data platform — canonical truth, validated intelligence.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <nav className="nav">
            <span className="nav-logo">⚽ <span>footie</span></span>
            <div className="nav-links">
              <a href="/">Matches</a>
              <a href="/standings">Tables</a>
              <a href="/live">Live</a>
              <a href="/teams">Teams</a>
              <a href="/players">Players</a>
              <a href="/managers">Managers</a>
              <a href="/narrative">Narrative</a>
              <a href="/capabilities">API</a>
            </div>
          </nav>
          <main className="main">{children}</main>
          <footer className="footer">
            Footie v0.1.0 · Autonomous Football Intelligence · Milestone 01
          </footer>
        </div>
      </body>
    </html>
  );
}
