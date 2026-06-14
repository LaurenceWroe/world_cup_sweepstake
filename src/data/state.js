// All mutable tournament state lives here so it can be
// persisted to localStorage in one place.

export const DEFAULT_STATE = {
  // Prize outcomes — keyed by PRIZE_STRUCTURE.key, value = team name
  prizes: {
    winner: "",
    runnerUp: "",
    third: "",
    topScorer: "",
    redCard: "",
    woodenSpoon: "",
  },

  // Eliminated teams (array of team name strings)
  eliminated: [],

  // Match results
  matches: [],
  // match shape: { id, date, team1, score1, score2, team2, stage }

  // Group standings per group letter
  // shape: { A: [ { team, played, won, drawn, lost, gf, ga, pts } ], ... }
  groups: {},
};

export const STAGES = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Third Place Play-off",
  "Final",
];
