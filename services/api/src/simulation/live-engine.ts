// Live match simulation engine — 1 real second = ~1 match minute

export interface MatchEvent {
  type: 'kickoff' | 'goal' | 'yellow_card' | 'red_card' | 'var_check' | 'halftime' | 'second_half' | 'goal_disallowed' | 'fulltime';
  minute: number;
  team?: 'home' | 'away';
  player?: string;
  description: string;
  homeScore: number;
  awayScore: number;
}

export interface LiveMatchState {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'pre' | 'first_half' | 'halftime' | 'second_half' | 'fulltime';
  events: MatchEvent[];
  subscribers: Set<(event: MatchEvent) => void>;
}

const HOME_PLAYERS = ['Saka', 'Ødegaard', 'Havertz', 'Martinelli', 'Rice', 'Trossard', 'White', 'Saliba'];
const AWAY_PLAYERS = ['Palmer', 'Jackson', 'Mudryk', 'Gallagher', 'Fernández', 'Disasi', 'Gusto', 'Sanchez'];

const GOAL_DESCRIPTIONS = [
  (p: string, min: number) => `${p} slots it low into the corner! Clinical finish. ${min}'`,
  (p: string, min: number) => `Thunderous strike from ${p}! No chance for the keeper. ${min}'`,
  (p: string, min: number) => `${p} heads it home from the corner! ${min}'`,
  (p: string, min: number) => `${p} on the break — tucks it away coolly. ${min}'`,
  (p: string, min: number) => `${p} with a tap-in from close range. ${min}'`,
];

const YELLOW_DESCS = [
  (p: string) => `${p} goes into the book for a late challenge`,
  (p: string) => `${p} cautioned for persistent fouling`,
  (p: string) => `${p} shown yellow for dissent`,
];

const activeMatches = new Map<string, LiveMatchState>();

export const getLiveMatch = (matchId: string) => activeMatches.get(matchId);
export const getAllLiveMatches = () => [...activeMatches.values()].map((m) => ({ matchId: m.matchId, homeTeam: m.homeTeam, awayTeam: m.awayTeam, competition: m.competition, homeScore: m.homeScore, awayScore: m.awayScore, minute: m.minute, status: m.status }));

export const startLiveMatch = (
  matchId: string,
  homeTeam: string,
  awayTeam: string,
  competition: string
): LiveMatchState => {
  if (activeMatches.has(matchId)) return activeMatches.get(matchId)!;

  const state: LiveMatchState = {
    matchId, homeTeam, awayTeam, competition,
    homeScore: 0, awayScore: 0, minute: 0,
    status: 'pre', events: [], subscribers: new Set()
  };
  activeMatches.set(matchId, state);

  const broadcast = (event: MatchEvent) => {
    state.events.push(event);
    for (const cb of state.subscribers) cb(event);
  };

  const rng = (n: number) => Math.floor(Math.random() * n);
  const pick = <T>(arr: T[]) => arr[rng(arr.length)]!;

  // Kickoff after 1 second
  setTimeout(() => {
    state.status = 'first_half';
    broadcast({ type: 'kickoff', minute: 0, description: `Kickoff! ${homeTeam} vs ${awayTeam} — ${competition}`, homeScore: 0, awayScore: 0 });

    // Tick every 800ms = ~1 match minute
    const tick = setInterval(() => {
      state.minute++;
      const min = state.minute;

      if (min === 45) {
        state.status = 'halftime';
        broadcast({ type: 'halftime', minute: 45, description: `Half time! ${homeTeam} ${state.homeScore}–${state.awayScore} ${awayTeam}`, homeScore: state.homeScore, awayScore: state.awayScore });
        setTimeout(() => {
          state.status = 'second_half';
          broadcast({ type: 'second_half', minute: 46, description: 'Second half underway!', homeScore: state.homeScore, awayScore: state.awayScore });
        }, 3000);
        return;
      }

      if (min > 90) {
        state.status = 'fulltime';
        broadcast({ type: 'fulltime', minute: 90, description: `Full time! ${homeTeam} ${state.homeScore}–${state.awayScore} ${awayTeam}. FT.`, homeScore: state.homeScore, awayScore: state.awayScore });
        clearInterval(tick);
        setTimeout(() => activeMatches.delete(matchId), 30000);
        return;
      }

      if (min === 45) return; // handled above

      // Goal chance: ~3% per minute each team
      const goalChance = rng(100);
      if (goalChance < 3) {
        const side = Math.random() < 0.5 ? 'home' : 'away';
        const player = side === 'home' ? pick(HOME_PLAYERS) : pick(AWAY_PLAYERS);
        if (side === 'home') state.homeScore++;
        else state.awayScore++;
        const desc = pick(GOAL_DESCRIPTIONS);
        broadcast({ type: 'goal', minute: min, team: side, player, description: desc(player, min), homeScore: state.homeScore, awayScore: state.awayScore });
      } else if (goalChance === 3 && min > 20) {
        // VAR check
        broadcast({ type: 'var_check', minute: min, description: `VAR check underway... ${min}'`, homeScore: state.homeScore, awayScore: state.awayScore });
      } else if (goalChance === 4) {
        // Yellow
        const side = Math.random() < 0.5 ? 'home' : 'away';
        const player = side === 'home' ? pick(HOME_PLAYERS) : pick(AWAY_PLAYERS);
        broadcast({ type: 'yellow_card', minute: min, team: side, player, description: pick(YELLOW_DESCS)(player) + ` ${min}'`, homeScore: state.homeScore, awayScore: state.awayScore });
      }
    }, 800);
  }, 1000);

  return state;
};
