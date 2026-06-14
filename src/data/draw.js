export const DRAW = {
  Amy:          ["Australia", "Senegal"],
  Anne:         ["Egypt", "France"],
  Claire:       ["Norway", "Switzerland"],
  Dad:          ["Brazil", "Scotland"],
  Emma:         ["Iran", "Iraq"],
  Gabrielle:    ["Paraguay", "Portugal"],
  Grandad:      ["Colombia", "New Zealand"],
  Henry:        ["South Korea", "Uruguay"],
  Holly:        ["Argentina", "Turkey"],
  Huggy:        ["Cape Verde", "Jordan"],
  Jacob:        ["South Africa", "Sweden"],
  Jane:         ["Japan", "Tunisia"],
  "Janny & Bruce": ["Croatia", "Haiti"],
  Jerome:       ["Panama", "Uzbekistan"],
  Laurence:     ["Saudi Arabia", "Spain"],
  Luke:         ["Austria", "Canada"],
  Mum:          ["Curacao", "Mexico"],
  Nat:          ["DR Congo", "Ivory Coast"],
  Ray:          ["England", "Morocco"],
  Rick:         ["Bosnia", "Holland"],
  Sarah:        ["Belgium", "Ecuador"],
  Tab:          ["Germany", "Ghana"],
  Tom:          ["Algeria", "USA"],
  Yasmin:       ["Czechia", "Qatar"],
};

export const PLAYERS = Object.keys(DRAW);

export const FLAGS = {
  Australia: "🇦🇺", Senegal: "🇸🇳",
  Egypt: "🇪🇬", France: "🇫🇷",
  Norway: "🇳🇴", Switzerland: "🇨🇭",
  Brazil: "🇧🇷", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Iran: "🇮🇷", Iraq: "🇮🇶",
  Paraguay: "🇵🇾", Portugal: "🇵🇹",
  Colombia: "🇨🇴", "New Zealand": "🇳🇿",
  "South Korea": "🇰🇷", Uruguay: "🇺🇾",
  Argentina: "🇦🇷", Turkey: "🇹🇷",
  "Cape Verde": "🇨🇻", Jordan: "🇯🇴",
  "South Africa": "🇿🇦", Sweden: "🇸🇪",
  Japan: "🇯🇵", Tunisia: "🇹🇳",
  Croatia: "🇭🇷", Haiti: "🇭🇹",
  Panama: "🇵🇦", Uzbekistan: "🇺🇿",
  "Saudi Arabia": "🇸🇦", Spain: "🇪🇸",
  Austria: "🇦🇹", Canada: "🇨🇦",
  Curacao: "🇨🇼", Mexico: "🇲🇽",
  "DR Congo": "🇨🇩", "Ivory Coast": "🇨🇮",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Morocco: "🇲🇦",
  Bosnia: "🇧🇦", Holland: "🇳🇱",
  Belgium: "🇧🇪", Ecuador: "🇪🇨",
  Germany: "🇩🇪", Ghana: "🇬🇭",
  Algeria: "🇩🇿", USA: "🇺🇸",
  Czechia: "🇨🇿", Qatar: "🇶🇦",
};

export const ALL_TEAMS = [...new Set(Object.values(DRAW).flat())];

export const PRIZE_STRUCTURE = [
  { key: "winner",      label: "Tournament Winner",       emoji: "🥇", pct: 40 },
  { key: "runnerUp",    label: "Runner-up",               emoji: "🥈", pct: 20 },
  { key: "third",       label: "Third Place",             emoji: "🥉", pct: 10 },
  { key: "topScorer",   label: "Top Goalscoring Nation",  emoji: "⚽", pct: 10 },
  { key: "redCard",     label: "First Red Card Nation",   emoji: "🟥", pct: 10 },
  { key: "woodenSpoon", label: "Wooden Spoon",            emoji: "🥄", pct: 10 },
];

export const TOTAL_POT = 48;

export const PLAYER_COLORS = [
  "#d4af37","#4a9eff","#ff6b6b","#51cf66","#cc5de8",
  "#ff922b","#20c997","#f06595","#74c0fc","#a9e34b",
  "#ffd43b","#66d9e8","#e599f7","#ff8787","#63e6be",
  "#a5d8ff","#ffec99","#b2f2bb","#ffa8a8","#d0bfff",
  "#4a9eff","#d4af37","#51cf66","#ff6b6b",
];
