import Database from 'better-sqlite3';
import { resolve } from 'node:path';
import { createCanonicalId } from '@footie/domain';

const DB_PATH = process.env['FOOTIE_DB_PATH'] ?? resolve(process.cwd(), 'footie.db');
const NOW = new Date().toISOString();

// ─── Competitions ─────────────────────────────────────────────────────────────
const COMPETITIONS = [
  { slug: 'premier-league', name: 'Premier League', countryCode: 'ENG', level: 1 },
  { slug: 'la-liga', name: 'La Liga', countryCode: 'ESP', level: 1 },
  { slug: 'champions-league', name: 'UEFA Champions League', countryCode: null, level: null },
  { slug: 'bundesliga', name: 'Bundesliga', countryCode: 'DEU', level: 1 },
  { slug: 'serie-a', name: 'Serie A', countryCode: 'ITA', level: 1 }
];

// ─── Managers ─────────────────────────────────────────────────────────────────
const MANAGERS = [
  { slug: 'mikel-arteta', name: 'Mikel Arteta', nationality: 'ESP', birthDate: '1982-03-26', teamSlug: 'arsenal', description: 'Former Arsenal midfielder who returned as manager in December 2019. Led Arsenal to Premier League title contention and developed one of the most progressive attacking styles in England.' },
  { slug: 'pep-guardiola', name: 'Pep Guardiola', nationality: 'ESP', birthDate: '1971-01-18', teamSlug: 'manchester-city', description: 'Widely regarded as the greatest manager of his generation. Has won 7 Premier League titles with Man City and revolutionised positional football worldwide.' },
  { slug: 'arne-slot', name: 'Arne Slot', nationality: 'NED', birthDate: '1978-09-17', teamSlug: 'liverpool', description: 'Dutch tactician who succeeded Jürgen Klopp at Liverpool in 2024. Former Feyenoord manager known for high-pressing, organised football.' },
  { slug: 'enzo-maresca', name: 'Enzo Maresca', nationality: 'ITA', birthDate: '1980-02-10', teamSlug: 'chelsea', description: 'Italian coach who led Leicester to the Championship title before joining Chelsea in 2024. Developed under Pep Guardiola at Man City.' },
  { slug: 'ange-postecoglou', name: 'Ange Postecoglou', nationality: 'AUS', birthDate: '1965-08-27', teamSlug: 'tottenham', description: 'Australian manager known for attacking, high-intensity football. Won back-to-back Scottish titles with Celtic before joining Spurs in 2023.' },
  { slug: 'eddie-howe', name: 'Eddie Howe', nationality: 'ENG', birthDate: '1977-11-29', teamSlug: 'newcastle', description: 'Newcastle United manager since 2021. Has transformed the club following Saudi ownership, securing Champions League qualification.' },
  { slug: 'unai-emery', name: 'Unai Emery', nationality: 'ESP', birthDate: '1971-11-03', teamSlug: 'aston-villa', description: 'Experienced European football manager with four UEFA Europa League titles. Led Aston Villa to Champions League qualification in 2024.' },
  { slug: 'carlo-ancelotti', name: 'Carlo Ancelotti', nationality: 'ITA', birthDate: '1959-06-10', teamSlug: 'real-madrid', description: 'Most decorated manager in Champions League history with five titles. Second stint at Real Madrid since 2021, winning La Liga and UCL.' },
  { slug: 'hansi-flick', name: 'Hansi Flick', nationality: 'DEU', birthDate: '1965-02-24', teamSlug: 'barcelona', description: 'Joined Barcelona in 2024 after winning the Champions League with Bayern Munich and managing the German national team.' },
  { slug: 'vincent-kompany', name: 'Vincent Kompany', nationality: 'BEL', birthDate: '1986-04-10', teamSlug: 'bayern-munich', description: 'Former Man City captain who took an extraordinary route into management via Anderlecht and Burnley before joining Bayern Munich in 2024.' },
  { slug: 'simone-inzaghi', name: 'Simone Inzaghi', nationality: 'ITA', birthDate: '1976-01-05', teamSlug: 'inter-milan', description: 'Led Inter Milan to Serie A and Coppa Italia, reaching Champions League final in 2023. Known for a precise 3-5-2 system.' },
  { slug: 'fabian-hurzeler', name: 'Fabian Hürzeler', nationality: 'DEU', birthDate: '1993-02-21', teamSlug: 'brighton', description: 'Youngest manager in Premier League history. Joined Brighton in 2024 after an impressive tenure at St. Pauli.' },
];

// ─── Teams ────────────────────────────────────────────────────────────────────
const TEAMS = [
  // Premier League
  { slug: 'arsenal', name: 'Arsenal', countryCode: 'ENG', founded: 1886, stadium: 'Emirates Stadium', capacity: 60704, nickname: 'The Gunners', color: '#EF0107', description: 'One of the most successful clubs in English football history, Arsenal were founded in 1886 in Woolwich. Famed for the Invincibles 2003-04 season under Arsène Wenger when they went unbeaten. Currently competing for the Premier League title under Mikel Arteta.' },
  { slug: 'chelsea', name: 'Chelsea', countryCode: 'ENG', founded: 1905, stadium: 'Stamford Bridge', capacity: 40834, nickname: 'The Blues', color: '#034694', description: 'West London club founded in 1905, Chelsea enjoyed enormous success under Roman Abramovich\'s ownership, winning two Champions League titles and five Premier League titles. Under new American ownership, rebuilding for the future.' },
  { slug: 'manchester-city', name: 'Manchester City', countryCode: 'ENG', founded: 1880, stadium: 'Etihad Stadium', capacity: 53400, nickname: 'The Citizens', color: '#6CABDD', description: 'Transformed by Sheikh Mansour\'s 2008 takeover, City have become England\'s dominant force under Pep Guardiola. Won four consecutive Premier League titles (2021-24) and the Champions League in 2023.' },
  { slug: 'liverpool', name: 'Liverpool', countryCode: 'ENG', founded: 1892, stadium: 'Anfield', capacity: 61276, nickname: 'The Reds', color: '#C8102E', description: 'England\'s most successful European club with six Champions League titles. Under Jürgen Klopp, they won the Premier League in 2020. Now under Arne Slot, maintaining their status as title contenders.' },
  { slug: 'tottenham', name: 'Tottenham Hotspur', countryCode: 'ENG', founded: 1882, stadium: 'Tottenham Hotspur Stadium', capacity: 62850, nickname: 'Spurs', color: '#132257', description: 'North London club famous for their attacking traditions and the motto "To dare is to do." Have the second-largest stadium in the PL. Reached the Champions League final in 2019 under Mauricio Pochettino.' },
  { slug: 'manchester-united', name: 'Manchester United', countryCode: 'ENG', founded: 1878, stadium: 'Old Trafford', capacity: 74310, nickname: 'The Red Devils', color: '#DA291C', description: 'The most successful club in English football history with 20 league titles. Dominated by Sir Alex Ferguson\'s 27-year reign. Currently rebuilding under INEOS ownership after a turbulent post-Ferguson era.' },
  { slug: 'newcastle', name: 'Newcastle United', countryCode: 'ENG', founded: 1892, stadium: 'St. James\' Park', capacity: 52258, nickname: 'The Magpies', color: '#241F20', description: 'Northeast England giants with a fanatical supporter base. Following Saudi Public Investment Fund takeover in 2021, Eddie Howe has led a remarkable transformation, returning Newcastle to the Champions League.' },
  { slug: 'aston-villa', name: 'Aston Villa', countryCode: 'ENG', founded: 1874, stadium: 'Villa Park', capacity: 42660, nickname: 'The Villans', color: '#95BFE5', description: 'One of England\'s founding clubs and former champions of Europe (1982). Under Unai Emery, Villa returned to the Champions League for the first time in decades with a transformative 2023-24 season.' },
  { slug: 'brighton', name: 'Brighton & Hove Albion', countryCode: 'ENG', founded: 1901, stadium: 'Amex Stadium', capacity: 31800, nickname: 'The Seagulls', color: '#0057B8', description: 'Under Tony Bloom\'s data-driven ownership, Brighton became a top-half Premier League club and Europa League regulars. Famous for their analytics approach and player development under Roberto De Zerbi.' },
  { slug: 'west-ham', name: 'West Ham United', countryCode: 'ENG', founded: 1895, stadium: 'London Stadium', capacity: 62500, nickname: 'The Hammers', color: '#7A263A', description: 'East London club known for producing England internationals. Moved to the Olympic Stadium in 2016 and won the UEFA Europa Conference League in 2023 under David Moyes.' },
  { slug: 'fulham', name: 'Fulham', countryCode: 'ENG', founded: 1879, stadium: 'Craven Cottage', capacity: 29600, nickname: 'The Cottagers', color: '#CC0000', description: 'Thames-side club with a charming Victorian ground. Yo-yo between Premier League and Championship, consistently competing at the top half of the Premier League under Marco Silva.' },
  { slug: 'brentford', name: 'Brentford', countryCode: 'ENG', founded: 1889, stadium: 'Gtech Community Stadium', capacity: 17250, nickname: 'The Bees', color: '#FF2000', description: 'Data-driven west London club who made their first top-flight appearance in 74 years in 2021-22. Known for an innovative recruitment model and their new stadium opened in 2020.' },
  { slug: 'crystal-palace', name: 'Crystal Palace', countryCode: 'ENG', founded: 1905, stadium: 'Selhurst Park', capacity: 25456, nickname: 'The Eagles', color: '#1B458F', description: 'South London club with a loyal fanbase and one of the best atmospheres in English football. Known for passionate supporters and a compact, intense home ground.' },
  { slug: 'everton', name: 'Everton', countryCode: 'ENG', founded: 1878, stadium: 'Goodison Park', capacity: 39414, nickname: 'The Toffees', color: '#003399', description: 'One of English football\'s founding members, Everton spent 2024-25 at their historic Goodison Park before moving to a new riverside stadium. Nine-time league champions.' },
  { slug: 'wolverhampton', name: 'Wolverhampton Wanderers', countryCode: 'ENG', founded: 1877, stadium: 'Molineux', capacity: 31700, nickname: 'Wolves', color: '#FDB913', description: 'Midlands club transformed by Fosun International ownership. Three-time league champions and Europa League semi-finalists in 2019-20 under Nuno Espírito Santo.' },
  { slug: 'nottingham-forest', name: 'Nottingham Forest', countryCode: 'ENG', founded: 1865, stadium: "City Ground", capacity: 30445, nickname: 'Forest', color: '#DD0000', description: 'One of football\'s most remarkable stories: back-to-back European Cup winners in 1979 and 1980 under Brian Clough. Returned to the Premier League in 2022 after 23 years away.' },
  { slug: 'bournemouth', name: 'AFC Bournemouth', countryCode: 'ENG', founded: 1899, stadium: 'Vitality Stadium', capacity: 11307, nickname: 'The Cherries', color: '#DA291C', description: 'Small club that made a remarkable journey from near-liquidation to Premier League regulars. Built on the back of Eddie Howe\'s management, now thriving under Andoni Iraola\'s dynamic coaching.' },
  { slug: 'leicester', name: 'Leicester City', countryCode: 'ENG', founded: 1884, stadium: 'King Power Stadium', capacity: 32261, nickname: 'The Foxes', color: '#003090', description: 'Achieved the greatest upset in Premier League history, winning the 2015-16 title at 5000-1 odds under Claudio Ranieri. Promoted back to the top flight for 2024-25 under Steve Cooper.' },
  { slug: 'ipswich', name: 'Ipswich Town', countryCode: 'ENG', founded: 1878, stadium: 'Portman Road', capacity: 30000, nickname: 'The Tractor Boys', color: '#0044A9', description: 'Historic club from Suffolk making their return to the top flight in 2024-25. Transformed under Kieran McKenna after two successive promotions from League One.' },
  { slug: 'southampton', name: 'Southampton', countryCode: 'ENG', founded: 1885, stadium: 'St Mary\'s Stadium', capacity: 32384, nickname: 'The Saints', color: '#D71920', description: 'South coast club famous for their academy that produced Gareth Bale, Theo Walcott, and many more. Back in the Premier League for 2024-25 after Championship promotion.' },
  // La Liga
  { slug: 'real-madrid', name: 'Real Madrid', countryCode: 'ESP', founded: 1902, stadium: 'Santiago Bernabéu', capacity: 81044, nickname: 'Los Blancos', color: '#FEBE10', description: 'The most successful club in Champions League history with 15 titles. Backed by Florentino Pérez\'s galáctico policy, currently home to Mbappé, Vinícius, and Bellingham under Ancelotti.' },
  { slug: 'barcelona', name: 'FC Barcelona', countryCode: 'ESP', founded: 1899, stadium: 'Estadi Olímpic Lluís Companys', capacity: 55926, nickname: 'Barça / Blaugrana', color: '#A50044', description: 'Five-time Champions League winners and home of the legendary Messi-Xavi-Iniesta era. Currently in their Spotify Camp Nou renovation, playing at the Estadi Olímpic. Rebuilding under Hansi Flick with Lamine Yamal.' },
  { slug: 'atletico-madrid', name: 'Atlético de Madrid', countryCode: 'ESP', founded: 1903, stadium: 'Cívitas Metropolitano', capacity: 68456, nickname: 'Los Colchoneros', color: '#CB3524', description: 'Diego Simeone\'s Atlético are renowned for defensive solidity and fighting spirit. Two La Liga titles (2014, 2021) and two Champions League finals under Simeone\'s reign since 2011.' },
  { slug: 'sevilla', name: 'Sevilla FC', countryCode: 'ESP', founded: 1890, stadium: 'Estadio Ramón Sánchez Pizjuán', capacity: 43883, nickname: 'Los Nervionenses', color: '#D4AF37', description: 'Record seven-time UEFA Europa League winners, making Sevilla one of European football\'s most consistent cups performers. Known for their recruiting model and passionate local fanbase.' },
  // Bundesliga
  { slug: 'bayern-munich', name: 'Bayern Munich', countryCode: 'DEU', founded: 1900, stadium: 'Allianz Arena', capacity: 75024, nickname: 'Die Bayern / Rekordmeister', color: '#DC052D', description: 'Germany\'s dominant force, Bayern Munich have won 10 consecutive Bundesliga titles (2013-2023). Two-time treble winners. Under Vincent Kompany rebuilding with Harry Kane leading the attack.' },
  { slug: 'borussia-dortmund', name: 'Borussia Dortmund', countryCode: 'DEU', founded: 1909, stadium: 'Signal Iduna Park', capacity: 81365, nickname: 'BVB / Die Schwarzgelben', color: '#FDE100', description: 'Home of the iconic Yellow Wall — the largest standing terrace in European football. Reached the Champions League final in 2024. Famous for developing young talent including Haaland, Sancho, and Bellingham.' },
  { slug: 'bayer-leverkusen', name: 'Bayer Leverkusen', countryCode: 'DEU', founded: 1904, stadium: 'BayArena', capacity: 30210, nickname: 'Die Werkself / Neverkusen (former)', color: '#E32221', description: 'Historic Champions League runners-up, nicknamed "Neverkusen" for trophy near-misses, but Xabi Alonso\'s side shattered the curse by winning the 2023-24 Bundesliga unbeaten, ending Bayern\'s 11-year streak.' },
  // Serie A
  { slug: 'inter-milan', name: 'Inter Milan', countryCode: 'ITA', founded: 1908, stadium: 'Giuseppe Meazza (San Siro)', capacity: 75923, nickname: 'Nerazzurri / La Beneamata', color: '#010E80', description: 'The Nerazzurri won their 20th Scudetto — making them joint-most decorated in Italian football — in 2023-24. Reached the Champions League final in 2023. Currently Europe\'s benchmark for defensive organisation.' },
  { slug: 'ac-milan', name: 'AC Milan', countryCode: 'ITA', founded: 1899, stadium: 'Giuseppe Meazza (San Siro)', capacity: 75923, nickname: 'Rossoneri / Il Diavolo', color: '#FB090B', description: 'Seven-time Champions League winners sharing San Siro with rivals Inter. Won Serie A in 2021-22 under Stefano Pioli. Planning a new stadium with Inter. Currently under Sérgio Conceição.' },
  { slug: 'juventus', name: 'Juventus', countryCode: 'ITA', founded: 1897, stadium: 'Allianz Stadium', capacity: 41507, nickname: 'La Vecchia Signora', color: '#000000', description: 'Italy\'s most decorated club with 36 Serie A titles and the only Italian side to win the European Cup/Champions League under separate coaches. Won nine consecutive Serie A titles (2012-2020). Rebuilding under Thiago Motta.' },
  { slug: 'napoli', name: 'SSC Napoli', countryCode: 'ITA', founded: 1926, stadium: 'Diego Armando Maradona Stadium', capacity: 54726, nickname: 'Gli Azzurri', color: '#12A0C3', description: 'Synonymous with Diego Maradona, who inspired their two Serie A titles in 1987 and 1990. Won a historic third Scudetto in 2022-23 under Luciano Spalletti. Their stadium renamed in Maradona\'s honour in 2020.' },
];

// ─── Players with stats ────────────────────────────────────────────────────────
const PLAYERS = [
  {
    slug: 'bukayo-saka', displayName: 'Bukayo Saka', position: 'RW', birthDate: '2001-09-05', nationality: 'ENG',
    teamSlug: 'arsenal', heightCm: 178, weightKg: 72,
    description: 'Arsenal and England winger — arguably the most complete wide player in the Premier League. Brilliant dribbler, finisher, and creator.',
    stats: { appearances: 28, starts: 27, minutesPlayed: 2395, goals: 14, assists: 9, shots: 87, shotsOnTarget: 42, xg: 12.3, xa: 8.7, passes: 1680, passAccuracy: 83.2, keyPasses: 48, dribblesCompleted: 62, tackles: 38, interceptions: 22, yellowCards: 2, redCards: 0, freeKicks: 41, penaltiesScored: 3, penaltiesTaken: 4, throwIns: 28, distanceKm: 293.4, topSpeedKmh: 34.2 },
    career: [{ teamSlug: 'arsenal', start: '2019-07-01', end: null, apps: 228, goals: 68, assists: 60 }]
  },
  {
    slug: 'martin-odegaard', displayName: 'Martin Ødegaard', position: 'AM', birthDate: '1998-12-17', nationality: 'NOR',
    teamSlug: 'arsenal', heightCm: 178, weightKg: 68,
    description: 'Arsenal captain and creative fulcrum. Norwegian playmaker with exceptional vision, technique, and leadership.',
    stats: { appearances: 25, starts: 24, minutesPlayed: 2060, goals: 8, assists: 7, shots: 54, shotsOnTarget: 24, xg: 6.8, xa: 7.2, passes: 2140, passAccuracy: 88.5, keyPasses: 62, dribblesCompleted: 34, tackles: 41, interceptions: 19, yellowCards: 3, redCards: 0, freeKicks: 67, penaltiesScored: 0, penaltiesTaken: 0, throwIns: 12, distanceKm: 261.8, topSpeedKmh: 30.8 },
    career: [{ teamSlug: 'real-madrid', start: '2015-01-01', end: '2021-08-01', apps: 11, goals: 0, assists: 2 }, { teamSlug: 'arsenal', start: '2021-08-01', end: null, apps: 162, goals: 42, assists: 47 }]
  },
  {
    slug: 'erling-haaland', displayName: 'Erling Haaland', position: 'ST', birthDate: '2000-07-21', nationality: 'NOR',
    teamSlug: 'manchester-city', heightCm: 194, weightKg: 88,
    description: 'The most prolific striker of his generation. Haaland\'s combination of pace, power, and finishing is unmatched. Set the Premier League record of 36 goals in 2022-23.',
    stats: { appearances: 26, starts: 25, minutesPlayed: 2180, goals: 22, assists: 5, shots: 141, shotsOnTarget: 78, xg: 19.8, xa: 3.4, passes: 580, passAccuracy: 72.1, keyPasses: 18, dribblesCompleted: 12, tackles: 4, interceptions: 3, yellowCards: 3, redCards: 0, freeKicks: 8, penaltiesScored: 4, penaltiesTaken: 5, throwIns: 0, distanceKm: 198.4, topSpeedKmh: 35.9 },
    career: [{ teamSlug: 'borussia-dortmund', start: '2020-01-01', end: '2022-06-01', apps: 89, goals: 86, assists: 23 }, { teamSlug: 'manchester-city', start: '2022-07-01', end: null, apps: 94, goals: 91, assists: 18 }]
  },
  {
    slug: 'kevin-de-bruyne', displayName: 'Kevin De Bruyne', position: 'CM', birthDate: '1991-06-28', nationality: 'BEL',
    teamSlug: 'manchester-city', heightCm: 181, weightKg: 70,
    description: 'Widely considered the best midfielder in the world during his peak. Exceptional vision, range of passing, and goal-scoring ability make him City\'s all-time great.',
    stats: { appearances: 22, starts: 19, minutesPlayed: 1740, goals: 4, assists: 14, shots: 42, shotsOnTarget: 18, xg: 3.8, xa: 13.2, passes: 2480, passAccuracy: 87.4, keyPasses: 81, dribblesCompleted: 18, tackles: 28, interceptions: 14, yellowCards: 2, redCards: 0, freeKicks: 78, penaltiesScored: 1, penaltiesTaken: 1, throwIns: 14, distanceKm: 224.6, topSpeedKmh: 31.2 },
    career: [{ teamSlug: 'chelsea', start: '2012-01-01', end: '2014-06-01', apps: 9, goals: 0, assists: 0 }, { teamSlug: 'manchester-city', start: '2015-08-01', end: null, apps: 298, goals: 76, assists: 171 }]
  },
  {
    slug: 'mohamed-salah', displayName: 'Mohamed Salah', position: 'RW', birthDate: '1992-06-15', nationality: 'EGY',
    teamSlug: 'liverpool', heightCm: 175, weightKg: 71,
    description: 'Liverpool and Egypt legend. Has reinvented himself from a pure winger to a complete attacking player. Set Premier League records for goals in a 38-game season.',
    stats: { appearances: 28, starts: 27, minutesPlayed: 2380, goals: 19, assists: 12, shots: 102, shotsOnTarget: 52, xg: 16.8, xa: 11.4, passes: 1420, passAccuracy: 80.3, keyPasses: 58, dribblesCompleted: 71, tackles: 28, interceptions: 16, yellowCards: 1, redCards: 0, freeKicks: 32, penaltiesScored: 5, penaltiesTaken: 6, throwIns: 22, distanceKm: 278.2, topSpeedKmh: 33.6 },
    career: [{ teamSlug: 'chelsea', start: '2014-01-01', end: '2016-06-01', apps: 19, goals: 2, assists: 4 }, { teamSlug: 'liverpool', start: '2017-06-01', end: null, apps: 345, goals: 222, assists: 96 }]
  },
  {
    slug: 'trent-alexander-arnold', displayName: 'Trent Alexander-Arnold', position: 'RB', birthDate: '1998-10-07', nationality: 'ENG',
    teamSlug: 'liverpool', heightCm: 175, weightKg: 69,
    description: 'Redefined the full-back position with his extraordinary passing range and creative ability. Local Liverpool boy who came through the academy.',
    stats: { appearances: 24, starts: 23, minutesPlayed: 2020, goals: 3, assists: 11, shots: 38, shotsOnTarget: 16, xg: 2.8, xa: 10.8, passes: 2820, passAccuracy: 84.6, keyPasses: 72, dribblesCompleted: 24, tackles: 48, interceptions: 32, yellowCards: 4, redCards: 0, freeKicks: 58, penaltiesScored: 0, penaltiesTaken: 0, throwIns: 182, distanceKm: 254.8, topSpeedKmh: 32.4 },
    career: [{ teamSlug: 'liverpool', start: '2016-10-01', end: null, apps: 283, goals: 22, assists: 82 }]
  },
  {
    slug: 'cole-palmer', displayName: 'Cole Palmer', position: 'AM', birthDate: '2002-05-06', nationality: 'ENG',
    teamSlug: 'chelsea', heightCm: 185, weightKg: 74,
    description: 'Chelsea\'s star man and England international. Elegant, technically brilliant attacking midfielder who scored four goals in a single Premier League game in 2024.',
    stats: { appearances: 27, starts: 26, minutesPlayed: 2260, goals: 16, assists: 11, shots: 89, shotsOnTarget: 44, xg: 13.4, xa: 10.2, passes: 1860, passAccuracy: 82.8, keyPasses: 68, dribblesCompleted: 58, tackles: 26, interceptions: 18, yellowCards: 2, redCards: 0, freeKicks: 52, penaltiesScored: 6, penaltiesTaken: 7, throwIns: 16, distanceKm: 271.4, topSpeedKmh: 32.8 },
    career: [{ teamSlug: 'manchester-city', start: '2020-07-01', end: '2023-08-01', apps: 18, goals: 4, assists: 4 }, { teamSlug: 'chelsea', start: '2023-08-01', end: null, apps: 68, goals: 38, assists: 26 }]
  },
  {
    slug: 'kylian-mbappe', displayName: 'Kylian Mbappé', position: 'ST', birthDate: '1998-12-20', nationality: 'FRA',
    teamSlug: 'real-madrid', heightCm: 178, weightKg: 73,
    description: 'World Cup winner and one of the fastest footballers ever recorded. Joined Real Madrid in 2024 on a free transfer after a legendary PSG career. The player of his generation.',
    stats: { appearances: 26, starts: 24, minutesPlayed: 2080, goals: 26, assists: 8, shots: 118, shotsOnTarget: 64, xg: 22.4, xa: 7.8, passes: 1040, passAccuracy: 78.2, keyPasses: 38, dribblesCompleted: 82, tackles: 14, interceptions: 8, yellowCards: 2, redCards: 0, freeKicks: 28, penaltiesScored: 8, penaltiesTaken: 9, throwIns: 18, distanceKm: 264.8, topSpeedKmh: 38.2 },
    career: [{ teamSlug: 'real-madrid', start: '2024-07-01', end: null, apps: 40, goals: 38, assists: 14 }]
  },
  {
    slug: 'vinicius-jr', displayName: 'Vinícius Jr.', position: 'LW', birthDate: '2000-07-12', nationality: 'BRA',
    teamSlug: 'real-madrid', heightCm: 176, weightKg: 73,
    description: 'Ballon d\'Or 2024. Brazilian superstar synonymous with dazzling dribbling, flair, and crucial goals in big moments. Champions League final hero in 2024.',
    stats: { appearances: 24, starts: 23, minutesPlayed: 1980, goals: 18, assists: 9, shots: 96, shotsOnTarget: 48, xg: 14.8, xa: 8.6, passes: 1180, passAccuracy: 79.4, keyPasses: 44, dribblesCompleted: 94, tackles: 18, interceptions: 12, yellowCards: 5, redCards: 1, freeKicks: 22, penaltiesScored: 2, penaltiesTaken: 3, throwIns: 14, distanceKm: 248.6, topSpeedKmh: 36.8 },
    career: [{ teamSlug: 'real-madrid', start: '2018-07-01', end: null, apps: 244, goals: 96, assists: 74 }]
  },
  {
    slug: 'jude-bellingham', displayName: 'Jude Bellingham', position: 'CM', birthDate: '2003-06-29', nationality: 'ENG',
    teamSlug: 'real-madrid', heightCm: 186, weightKg: 83,
    description: 'England\'s future captain, World Cup standout, and Champions League winner. Bellingham\'s mix of technique, intelligence, and athleticism makes him exceptional at just 21.',
    stats: { appearances: 25, starts: 23, minutesPlayed: 1960, goals: 12, assists: 7, shots: 68, shotsOnTarget: 34, xg: 9.8, xa: 6.4, passes: 1880, passAccuracy: 85.8, keyPasses: 52, dribblesCompleted: 48, tackles: 54, interceptions: 38, yellowCards: 4, redCards: 0, freeKicks: 38, penaltiesScored: 1, penaltiesTaken: 1, throwIns: 12, distanceKm: 258.4, topSpeedKmh: 33.8 },
    career: [{ teamSlug: 'borussia-dortmund', start: '2020-07-01', end: '2023-06-01', apps: 132, goals: 23, assists: 30 }, { teamSlug: 'real-madrid', start: '2023-07-01', end: null, apps: 63, goals: 28, assists: 18 }]
  },
  {
    slug: 'lamine-yamal', displayName: 'Lamine Yamal', position: 'RW', birthDate: '2007-07-13', nationality: 'ESP',
    teamSlug: 'barcelona', heightCm: 180, weightKg: 67,
    description: 'The most exciting teenager in world football. Euro 2024 winner at 16. Yamal\'s dribbling, composure, and eye for goal at such a young age suggests he will define the next decade.',
    stats: { appearances: 27, starts: 25, minutesPlayed: 2180, goals: 11, assists: 13, shots: 78, shotsOnTarget: 36, xg: 9.2, xa: 12.4, passes: 1540, passAccuracy: 81.6, keyPasses: 64, dribblesCompleted: 86, tackles: 22, interceptions: 14, yellowCards: 3, redCards: 0, freeKicks: 44, penaltiesScored: 0, penaltiesTaken: 0, throwIns: 28, distanceKm: 266.8, topSpeedKmh: 34.8 },
    career: [{ teamSlug: 'barcelona', start: '2023-10-01', end: null, apps: 72, goals: 22, assists: 24 }]
  },
  {
    slug: 'pedri', displayName: 'Pedri', position: 'CM', birthDate: '2002-11-25', nationality: 'ESP',
    teamSlug: 'barcelona', heightCm: 174, weightKg: 60,
    description: 'The midfield heir to Xavi. Pedri\'s technical brilliance, intelligent movement, and physical resilience have made him a generational talent at Barça since joining aged 18.',
    stats: { appearances: 24, starts: 22, minutesPlayed: 1880, goals: 6, assists: 10, shots: 48, shotsOnTarget: 22, xg: 4.8, xa: 9.4, passes: 2640, passAccuracy: 90.2, keyPasses: 72, dribblesCompleted: 56, tackles: 48, interceptions: 28, yellowCards: 3, redCards: 0, freeKicks: 34, penaltiesScored: 0, penaltiesTaken: 0, throwIns: 8, distanceKm: 246.2, topSpeedKmh: 30.4 },
    career: [{ teamSlug: 'barcelona', start: '2020-08-01', end: null, apps: 162, goals: 22, assists: 38 }]
  },
  {
    slug: 'harry-kane', displayName: 'Harry Kane', position: 'ST', birthDate: '1993-07-28', nationality: 'ENG',
    teamSlug: 'bayern-munich', heightCm: 188, weightKg: 86,
    description: 'England\'s all-time leading scorer and one of the most complete strikers of his era. Joined Bayern Munich in 2023 after a record-breaking Spurs career. Bundesliga\'s top scorer in his debut season.',
    stats: { appearances: 26, starts: 25, minutesPlayed: 2180, goals: 24, assists: 6, shots: 128, shotsOnTarget: 68, xg: 21.4, xa: 5.2, passes: 920, passAccuracy: 74.8, keyPasses: 38, dribblesCompleted: 14, tackles: 8, interceptions: 4, yellowCards: 2, redCards: 0, freeKicks: 18, penaltiesScored: 5, penaltiesTaken: 6, throwIns: 10, distanceKm: 242.4, topSpeedKmh: 32.4 },
    career: [{ teamSlug: 'tottenham', start: '2011-07-01', end: '2023-07-01', apps: 435, goals: 280, assists: 62 }, { teamSlug: 'bayern-munich', start: '2023-08-01', end: null, apps: 72, goals: 68, assists: 16 }]
  },
  {
    slug: 'alexander-isak', displayName: 'Alexander Isak', position: 'ST', birthDate: '1999-09-21', nationality: 'SWE',
    teamSlug: 'newcastle', heightCm: 190, weightKg: 75,
    description: 'Elegant Swedish striker with wonderful technical ability and finishing. Arguably the Premier League\'s best striker in 2024-25. Increasingly linked with Europe\'s elite clubs.',
    stats: { appearances: 26, starts: 25, minutesPlayed: 2120, goals: 18, assists: 3, shots: 98, shotsOnTarget: 52, xg: 15.4, xa: 2.8, passes: 760, passAccuracy: 76.8, keyPasses: 22, dribblesCompleted: 38, tackles: 8, interceptions: 6, yellowCards: 1, redCards: 0, freeKicks: 14, penaltiesScored: 2, penaltiesTaken: 2, throwIns: 8, distanceKm: 236.8, topSpeedKmh: 34.6 },
    career: [{ teamSlug: 'newcastle', start: '2022-08-01', end: null, apps: 76, goals: 52, assists: 10 }]
  },
  {
    slug: 'ollie-watkins', displayName: 'Ollie Watkins', position: 'ST', birthDate: '1995-12-30', nationality: 'ENG',
    teamSlug: 'aston-villa', heightCm: 181, weightKg: 70,
    description: 'England international striker who has flourished under Unai Emery. Work rate, pressing, and goals make him one of the PL\'s top strikers. Scored decisive semi-final goal vs Netherlands at Euro 2024.',
    stats: { appearances: 27, starts: 25, minutesPlayed: 2180, goals: 13, assists: 8, shots: 84, shotsOnTarget: 42, xg: 11.2, xa: 6.8, passes: 780, passAccuracy: 74.2, keyPasses: 28, dribblesCompleted: 28, tackles: 14, interceptions: 8, yellowCards: 2, redCards: 0, freeKicks: 12, penaltiesScored: 1, penaltiesTaken: 1, throwIns: 10, distanceKm: 284.6, topSpeedKmh: 33.2 },
    career: [{ teamSlug: 'aston-villa', start: '2020-09-01', end: null, apps: 182, goals: 82, assists: 40 }]
  },
];

// ─── PL results ───────────────────────────────────────────────────────────────
const PL_RESULTS: { home: string; away: string; kickoff: string; hs: number; as: number }[] = [
  { home: 'arsenal', away: 'wolverhampton', kickoff: '2025-08-16T14:00:00Z', hs: 2, as: 0 },
  { home: 'manchester-city', away: 'chelsea', kickoff: '2025-08-16T16:30:00Z', hs: 1, as: 1 },
  { home: 'liverpool', away: 'ipswich', kickoff: '2025-08-16T14:00:00Z', hs: 3, as: 0 },
  { home: 'tottenham', away: 'leicester', kickoff: '2025-08-16T14:00:00Z', hs: 2, as: 1 },
  { home: 'newcastle', away: 'southampton', kickoff: '2025-08-16T14:00:00Z', hs: 4, as: 0 },
  { home: 'aston-villa', away: 'west-ham', kickoff: '2025-08-16T14:00:00Z', hs: 3, as: 1 },
  { home: 'brighton', away: 'everton', kickoff: '2025-08-16T14:00:00Z', hs: 1, as: 1 },
  { home: 'nottingham-forest', away: 'brentford', kickoff: '2025-08-16T14:00:00Z', hs: 0, as: 2 },
  { home: 'fulham', away: 'crystal-palace', kickoff: '2025-08-16T14:00:00Z', hs: 1, as: 0 },
  { home: 'bournemouth', away: 'manchester-united', kickoff: '2025-08-16T14:00:00Z', hs: 2, as: 1 },
  { home: 'chelsea', away: 'arsenal', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 1 },
  { home: 'wolverhampton', away: 'liverpool', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 3 },
  { home: 'leicester', away: 'manchester-city', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 4 },
  { home: 'ipswich', away: 'newcastle', kickoff: '2025-08-23T14:00:00Z', hs: 1, as: 2 },
  { home: 'manchester-united', away: 'brighton', kickoff: '2025-08-23T14:00:00Z', hs: 1, as: 2 },
  { home: 'everton', away: 'aston-villa', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 2 },
  { home: 'west-ham', away: 'tottenham', kickoff: '2025-08-23T14:00:00Z', hs: 1, as: 3 },
  { home: 'brentford', away: 'fulham', kickoff: '2025-08-23T14:00:00Z', hs: 2, as: 1 },
  { home: 'crystal-palace', away: 'bournemouth', kickoff: '2025-08-23T14:00:00Z', hs: 1, as: 0 },
  { home: 'southampton', away: 'nottingham-forest', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 2 },
  { home: 'arsenal', away: 'brighton', kickoff: '2025-08-30T14:00:00Z', hs: 2, as: 1 },
  { home: 'liverpool', away: 'manchester-city', kickoff: '2025-08-30T16:30:00Z', hs: 1, as: 0 },
  { home: 'newcastle', away: 'tottenham', kickoff: '2025-08-30T14:00:00Z', hs: 2, as: 2 },
  { home: 'manchester-city', away: 'nottingham-forest', kickoff: '2025-09-14T14:00:00Z', hs: 5, as: 1 },
  { home: 'arsenal', away: 'leicester', kickoff: '2025-09-14T14:00:00Z', hs: 3, as: 0 },
  { home: 'liverpool', away: 'chelsea', kickoff: '2025-09-21T16:30:00Z', hs: 2, as: 0 },
  { home: 'newcastle', away: 'manchester-city', kickoff: '2025-09-28T14:00:00Z', hs: 1, as: 1 },
  { home: 'tottenham', away: 'arsenal', kickoff: '2025-10-12T16:30:00Z', hs: 1, as: 2 },
  { home: 'manchester-city', away: 'liverpool', kickoff: '2025-10-25T16:30:00Z', hs: 2, as: 1 },
  { home: 'arsenal', away: 'chelsea', kickoff: '2025-11-01T17:30:00Z', hs: 3, as: 1 },
  { home: 'liverpool', away: 'aston-villa', kickoff: '2025-11-08T15:00:00Z', hs: 2, as: 1 },
  { home: 'newcastle', away: 'chelsea', kickoff: '2025-11-22T15:00:00Z', hs: 1, as: 2 },
  { home: 'arsenal', away: 'nottingham-forest', kickoff: '2025-11-29T15:00:00Z', hs: 3, as: 1 },
  { home: 'manchester-city', away: 'tottenham', kickoff: '2025-12-06T15:00:00Z', hs: 4, as: 0 },
  { home: 'liverpool', away: 'brighton', kickoff: '2025-12-13T15:00:00Z', hs: 3, as: 1 },
  { home: 'chelsea', away: 'newcastle', kickoff: '2025-12-20T15:00:00Z', hs: 1, as: 1 },
  { home: 'tottenham', away: 'manchester-united', kickoff: '2025-12-26T12:30:00Z', hs: 3, as: 0 },
  { home: 'arsenal', away: 'aston-villa', kickoff: '2025-12-26T15:00:00Z', hs: 2, as: 0 },
  { home: 'manchester-city', away: 'brighton', kickoff: '2026-01-04T17:30:00Z', hs: 3, as: 1 },
  { home: 'liverpool', away: 'manchester-united', kickoff: '2026-01-04T17:30:00Z', hs: 2, as: 0 },
  { home: 'aston-villa', away: 'tottenham', kickoff: '2026-01-18T15:00:00Z', hs: 1, as: 2 },
  { home: 'chelsea', away: 'liverpool', kickoff: '2026-01-25T16:30:00Z', hs: 1, as: 2 },
  { home: 'arsenal', away: 'manchester-city', kickoff: '2026-02-01T17:30:00Z', hs: 2, as: 2 },
  { home: 'newcastle', away: 'aston-villa', kickoff: '2026-02-15T15:00:00Z', hs: 3, as: 0 },
  { home: 'manchester-united', away: 'arsenal', kickoff: '2026-02-22T16:30:00Z', hs: 0, as: 3 },
  { home: 'brighton', away: 'manchester-city', kickoff: '2026-03-01T15:00:00Z', hs: 1, as: 2 },
  { home: 'tottenham', away: 'chelsea', kickoff: '2026-03-08T16:30:00Z', hs: 2, as: 1 },
  { home: 'liverpool', away: 'newcastle', kickoff: '2026-03-14T17:30:00Z', hs: 2, as: 1 },
  { home: 'manchester-city', away: 'liverpool', kickoff: '2026-03-19T17:30:00Z', hs: 2, as: 1 },
  // MD29 upcoming
  { home: 'arsenal', away: 'chelsea', kickoff: '2026-03-19T19:45:00Z', hs: -1, as: -1 },
  { home: 'tottenham', away: 'aston-villa', kickoff: '2026-03-20T20:00:00Z', hs: -1, as: -1 },
  { home: 'newcastle', away: 'manchester-united', kickoff: '2026-03-22T14:00:00Z', hs: -1, as: -1 },
];

const OTHER_MATCHES = [
  { comp: 'la-liga', home: 'real-madrid', away: 'barcelona', kickoff: '2026-03-22T20:00:00Z', hs: -1, as: -1 },
  { comp: 'la-liga', home: 'atletico-madrid', away: 'real-madrid', kickoff: '2026-03-15T20:00:00Z', hs: 1, as: 1 },
  { comp: 'la-liga', home: 'barcelona', away: 'sevilla', kickoff: '2026-03-08T20:00:00Z', hs: 4, as: 1 },
  { comp: 'champions-league', home: 'arsenal', away: 'real-madrid', kickoff: '2026-04-08T20:00:00Z', hs: -1, as: -1 },
  { comp: 'champions-league', home: 'manchester-city', away: 'bayern-munich', kickoff: '2026-04-09T20:00:00Z', hs: -1, as: -1 },
  { comp: 'champions-league', home: 'liverpool', away: 'barcelona', kickoff: '2026-04-15T20:00:00Z', hs: -1, as: -1 },
  { comp: 'bundesliga', home: 'bayern-munich', away: 'borussia-dortmund', kickoff: '2026-03-21T17:30:00Z', hs: -1, as: -1 },
  { comp: 'bundesliga', home: 'bayer-leverkusen', away: 'bayern-munich', kickoff: '2026-03-07T17:30:00Z', hs: 2, as: 3 },
  { comp: 'serie-a', home: 'inter-milan', away: 'ac-milan', kickoff: '2026-03-23T19:45:00Z', hs: -1, as: -1 },
  { comp: 'serie-a', home: 'juventus', away: 'inter-milan', kickoff: '2026-03-16T19:45:00Z', hs: 0, as: 2 },
  { comp: 'serie-a', home: 'napoli', away: 'juventus', kickoff: '2026-03-09T19:45:00Z', hs: 1, as: 0 },
];

// ─── Manager stints ───────────────────────────────────────────────────────────
const MANAGER_STINTS = [
  { managerSlug: 'mikel-arteta', teamSlug: 'arsenal', start: '2019-12-20', end: null, isCurrent: true, matches: 248, wins: 150, draws: 44, losses: 54, trophies: 'FA Cup 2020, Community Shield 2020, 2023', notes: 'Led Arsenal to consecutive second-place PL finishes in 2022-23 and 2023-24.' },
  { managerSlug: 'mikel-arteta', teamSlug: 'manchester-city', start: '2016-07-01', end: '2019-12-20', isCurrent: false, matches: 0, wins: 0, draws: 0, losses: 0, trophies: '', notes: 'Assistant manager to Pep Guardiola at Man City' },
  { managerSlug: 'pep-guardiola', teamSlug: 'manchester-city', start: '2016-07-01', end: null, isCurrent: true, matches: 412, wins: 302, draws: 52, losses: 58, trophies: 'PL 2018,2019,2021,2022,2023,2024, UCL 2023, FA Cup 2019,2023, EFL Cup 2018,2019,2020,2021,2024', notes: 'Most successful manager in Man City history by a distance.' },
  { managerSlug: 'pep-guardiola', teamSlug: 'barcelona', start: '2008-06-01', end: '2012-06-01', isCurrent: false, matches: 247, wins: 179, draws: 38, losses: 30, trophies: 'La Liga ×3, UCL ×2, Copa del Rey ×2', notes: 'Transformed Barcelona into the greatest club side in history' },
  { managerSlug: 'arne-slot', teamSlug: 'liverpool', start: '2024-06-01', end: null, isCurrent: true, matches: 38, wins: 28, draws: 4, losses: 6, trophies: '', notes: 'Strong debut season maintaining Liverpool\'s title challenge.' },
  { managerSlug: 'enzo-maresca', teamSlug: 'chelsea', start: '2024-06-01', end: null, isCurrent: true, matches: 36, wins: 14, draws: 8, losses: 14, trophies: '', notes: 'Installed after leading Leicester to Championship title in 2023-24.' },
  { managerSlug: 'ange-postecoglou', teamSlug: 'tottenham', start: '2023-06-01', end: null, isCurrent: true, matches: 76, wins: 40, draws: 10, losses: 26, trophies: '', notes: 'Reached Europa League final 2024. High-scoring but inconsistent.' },
  { managerSlug: 'eddie-howe', teamSlug: 'newcastle', start: '2021-11-08', end: null, isCurrent: true, matches: 148, wins: 72, draws: 34, losses: 42, trophies: '', notes: 'Transformed Newcastle after takeover, Champions League in 2023.' },
  { managerSlug: 'unai-emery', teamSlug: 'aston-villa', start: '2022-10-24', end: null, isCurrent: true, matches: 98, wins: 60, draws: 16, losses: 22, trophies: '', notes: 'Led Villa to Champions League. Four Europa League titles total.' },
  { managerSlug: 'carlo-ancelotti', teamSlug: 'real-madrid', start: '2021-06-01', end: null, isCurrent: true, matches: 186, wins: 138, draws: 22, losses: 26, trophies: 'La Liga ×2, UCL 2022, 2024, Copa del Rey, Supercopa ×3', notes: 'Second stint at Madrid: won everything available including back-to-back UCL.' },
  { managerSlug: 'hansi-flick', teamSlug: 'barcelona', start: '2024-06-01', end: null, isCurrent: true, matches: 34, wins: 26, draws: 4, losses: 4, trophies: '', notes: 'Exceptional start — best run in years, with Lamine Yamal shining.' },
  { managerSlug: 'vincent-kompany', teamSlug: 'bayern-munich', start: '2024-07-01', end: null, isCurrent: true, matches: 34, wins: 26, draws: 2, losses: 6, trophies: '', notes: 'Strong debut Bundesliga season after departing Burnley.' },
  { managerSlug: 'simone-inzaghi', teamSlug: 'inter-milan', start: '2021-06-01', end: null, isCurrent: true, matches: 174, wins: 116, draws: 26, losses: 32, trophies: 'Serie A 2023-24, Coppa Italia 2022, 2023', notes: 'Best manager in Serie A since Mourinho\'s Inter.' },
  { managerSlug: 'fabian-hurzeler', teamSlug: 'brighton', start: '2024-06-01', end: null, isCurrent: true, matches: 34, wins: 14, draws: 8, losses: 12, trophies: '', notes: 'Youngest PL manager at 31. Impressive start at Brighton.' },
];

// ─── Seed function ────────────────────────────────────────────────────────────
const seed = () => {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Competitions
  const upsertComp = db.prepare(`INSERT INTO competitions (id, slug, name, country_code, level, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name`);
  const compIds: Record<string, string> = {};
  for (const c of COMPETITIONS) { const id = createCanonicalId('competition', c.slug); compIds[c.slug] = id; upsertComp.run(id, c.slug, c.name, c.countryCode ?? null, c.level ?? null, NOW); }

  // Seasons
  const upsertSeason = db.prepare(`INSERT INTO seasons (id, competition_id, label, start_date, end_date, is_current, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET is_current=excluded.is_current`);
  const seasonIds: Record<string, string> = {};
  for (const comp of COMPETITIONS) { const id = createCanonicalId('season', `${comp.slug}-2025-26`); seasonIds[comp.slug] = id; upsertSeason.run(id, compIds[comp.slug]!, '2025-26', '2025-08-01', '2026-05-31', 1, NOW); }

  // Managers (insert first, before teams FK)
  const upsertManager = db.prepare(`INSERT INTO managers (id, slug, name, nationality, birth_date, description, current_team_id, created_at) VALUES (?, ?, ?, ?, ?, ?, null, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name`);
  const managerIds: Record<string, string> = {};
  for (const m of MANAGERS) { const id = createCanonicalId('player', m.slug); managerIds[m.slug] = id; upsertManager.run(id, m.slug, m.name, m.nationality, m.birthDate, m.description, NOW); }

  // Teams
  const teamManagerMap: Record<string, string> = {};
  for (const m of MANAGERS) if (m.teamSlug) teamManagerMap[m.teamSlug] = m.slug;
  const upsertTeam = db.prepare(`INSERT INTO teams (id, slug, name, country_code, founded, stadium, stadium_capacity, nickname, description, primary_color, manager_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, description=excluded.description`);
  const teamIds: Record<string, string> = {};
  for (const t of TEAMS) {
    const id = createCanonicalId('team', t.slug);
    teamIds[t.slug] = id;
    const managerId = teamManagerMap[t.slug] ? managerIds[teamManagerMap[t.slug]!] : null;
    upsertTeam.run(id, t.slug, t.name, t.countryCode, t.founded, t.stadium, t.capacity, t.nickname, t.description, t.color, managerId ?? null, NOW);
  }

  // Update managers with current_team_id
  const updateMgrTeam = db.prepare(`UPDATE managers SET current_team_id = ? WHERE id = ?`);
  for (const m of MANAGERS) if (m.teamSlug && teamIds[m.teamSlug] && managerIds[m.slug]) updateMgrTeam.run(teamIds[m.teamSlug], managerIds[m.slug]);

  // Players
  const upsertPlayer = db.prepare(`INSERT INTO players (id, slug, display_name, primary_position, birth_date, nationality, current_team_id, height_cm, weight_kg, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name, current_team_id=excluded.current_team_id`);
  const playerIds: Record<string, string> = {};
  for (const p of PLAYERS) {
    const id = createCanonicalId('player', p.slug);
    playerIds[p.slug] = id;
    upsertPlayer.run(id, p.slug, p.displayName, p.position, p.birthDate, p.nationality, teamIds[p.teamSlug] ?? null, p.heightCm, p.weightKg, p.description, NOW);
  }

  // Player stats
  const upsertStats = db.prepare(`INSERT INTO player_stats (player_id, team_id, season_label, competition_slug, appearances, starts, minutes_played, goals, assists, shots, shots_on_target, xg, xa, passes, pass_accuracy, key_passes, dribbles_completed, tackles, interceptions, yellow_cards, red_cards, free_kicks, penalties_scored, penalties_taken, throw_ins, distance_km, top_speed_kmh) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(player_id, team_id, season_label, competition_slug) DO UPDATE SET goals=excluded.goals`);
  for (const p of PLAYERS) {
    const s = p.stats;
    upsertStats.run(playerIds[p.slug], teamIds[p.teamSlug], '2025-26', 'premier-league', s.appearances, s.starts, s.minutesPlayed, s.goals, s.assists, s.shots, s.shotsOnTarget, s.xg, s.xa, s.passes, s.passAccuracy, s.keyPasses, s.dribblesCompleted, s.tackles, s.interceptions, s.yellowCards, s.redCards, s.freeKicks, s.penaltiesScored, s.penaltiesTaken, s.throwIns, s.distanceKm, s.topSpeedKmh);
  }

  // Player career
  const upsertCareer = db.prepare(`INSERT OR IGNORE INTO player_career (player_id, team_id, started_at, ended_at, is_current, appearances, goals, assists) VALUES (?,?,?,?,?,?,?,?)`);
  for (const p of PLAYERS) for (const c of p.career) if (teamIds[c.teamSlug]) upsertCareer.run(playerIds[p.slug], teamIds[c.teamSlug], c.start, c.end, c.end ? 0 : 1, c.apps, c.goals, c.assists);

  // Manager stints
  const upsertStint = db.prepare(`INSERT OR IGNORE INTO manager_stints (manager_id, team_id, started_at, ended_at, is_current, matches, wins, draws, losses, trophies, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  for (const s of MANAGER_STINTS) if (managerIds[s.managerSlug] && teamIds[s.teamSlug]) upsertStint.run(managerIds[s.managerSlug], teamIds[s.teamSlug], s.start, s.end, s.isCurrent ? 1 : 0, s.matches, s.wins, s.draws, s.losses, s.trophies ?? null, s.notes ?? null);

  // Matches
  const upsertMatch = db.prepare(`INSERT INTO matches (id, season_id, competition_id, kickoff_at, home_team_id, away_team_id, status, home_score, away_score, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET status=excluded.status, home_score=excluded.home_score, away_score=excluded.away_score, updated_at=excluded.updated_at`);
  let matchCount = 0;
  for (const m of PL_RESULTS) { const finished = m.hs >= 0; const id = createCanonicalId('match', `${m.kickoff}-${m.home}-${m.away}`); if (teamIds[m.home] && teamIds[m.away]) { upsertMatch.run(id, seasonIds['premier-league'], compIds['premier-league'], m.kickoff, teamIds[m.home], teamIds[m.away], finished ? 'finished' : 'scheduled', finished ? m.hs : null, finished ? m.as : null, NOW, NOW); matchCount++; } }
  for (const m of OTHER_MATCHES) { const finished = m.hs >= 0; const id = createCanonicalId('match', `${m.kickoff}-${m.home}-${m.away}`); if (teamIds[m.home] && teamIds[m.away] && compIds[m.comp] && seasonIds[m.comp]) { upsertMatch.run(id, seasonIds[m.comp], compIds[m.comp], m.kickoff, teamIds[m.home], teamIds[m.away], finished ? 'finished' : 'scheduled', finished ? m.hs : null, finished ? m.as : null, NOW, NOW); matchCount++; } }

  // FTS
  db.prepare(`DELETE FROM search_fts`).run();
  const fts = db.prepare(`INSERT INTO search_fts(entity_id, entity_type, display_name, keywords) VALUES (?, ?, ?, ?)`);
  for (const t of TEAMS) { const id = teamIds[t.slug]; if (id) fts.run(id, 'team', t.name, `${t.name} ${t.slug.replaceAll('-', ' ')} ${t.nickname ?? ''}`); }
  for (const p of PLAYERS) { const id = playerIds[p.slug]; if (id) fts.run(id, 'player', p.displayName, `${p.displayName} ${p.slug.replaceAll('-', ' ')} ${p.position ?? ''} ${p.nationality ?? ''}`); }
  for (const m of MANAGERS) { const id = managerIds[m.slug]; if (id) fts.run(id, 'manager', m.name, `${m.name} ${m.slug.replaceAll('-', ' ')} manager coach ${m.nationality ?? ''}`); }
  for (const c of COMPETITIONS) { const id = compIds[c.slug]; if (id) fts.run(id, 'competition', c.name, `${c.name} ${c.slug.replaceAll('-', ' ')}`); }

  db.close();
  console.log(`Seeded: ${COMPETITIONS.length} comps, ${TEAMS.length} teams, ${MANAGERS.length} managers, ${PLAYERS.length} players, ${matchCount} matches`);
};

seed();
