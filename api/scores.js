// Vercel serverless function — proxies football-data.org so the key stays server-side.
// Makes 2 API calls per invocation (matches + standings).
// 30-min CDN cache → stays well within free-tier rate limits.

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE    = "https://api.football-data.org/v4";
const COMP    = "WC"; // FIFA World Cup

const NAME_MAP = {
  "Netherlands":             "Holland",
  "United States":           "USA",
  "Ivory Coast":             "Ivory Coast",
  "Côte d'Ivoire":           "Ivory Coast",
  "Bosnia-Herzegovina":      "Bosnia",
  "Bosnia and Herzegovina":  "Bosnia",
  "Czech Republic":          "Czechia",
  "Curaçao":                 "Curacao",
  "Cape Verde Islands":      "Cape Verde",
  "DR Congo":                "DR Congo",
  "Congo DR":                "DR Congo",
  "Republic of Congo":       "DR Congo",
};

function norm(name) {
  return NAME_MAP[name] ?? name;
}

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": API_KEY },
  });
  if (!res.ok) throw new Error(`football-data.org ${res.status}: ${path}`);
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=600");

  try {
    const [matchesData, standingsData] = await Promise.all([
      apiFetch(`/competitions/${COMP}/matches`),
      apiFetch(`/competitions/${COMP}/standings`),
    ]);

    const allMatches = matchesData.matches ?? [];
    const groups     = (standingsData.standings ?? [])
      .filter(s => s.type === "TOTAL");

    const completed = allMatches.filter(m => m.status === "FINISHED");

    // ── Matches ───────────────────────────────────────────────────────────────
    // football-data.org includes penalty goals in score.fullTime for shootout games,
    // so subtract them to get the actual goals scored in open play + extra time.
    const matches = completed
      .map(m => {
        const isPen   = m.score.duration === "PENALTY_SHOOTOUT";
        const penHome = m.score.penalties?.home ?? 0;
        const penAway = m.score.penalties?.away ?? 0;
        return {
          id:        m.id,
          date:      new Date(m.utcDate).toLocaleDateString("en-GB"),
          team1:     norm(m.homeTeam.name),
          score1:    isPen ? (m.score.fullTime.home ?? 0) - penHome : (m.score.fullTime.home ?? 0),
          team2:     norm(m.awayTeam.name),
          score2:    isPen ? (m.score.fullTime.away ?? 0) - penAway : (m.score.fullTime.away ?? 0),
          stage:     mapStage(m.stage),
          duration:  m.score.duration,
          penScore1: isPen ? penHome : null,
          penScore2: isPen ? penAway : null,
        };
      })
      .reverse();

    // ── Eliminated teams ──────────────────────────────────────────────────────
    const eliminated = [];
    const groupComplete = [];

    for (const group of groups) {
      const done = group.table.every(t => t.playedGames >= 3);
      groupComplete.push(done);
      if (done) {
        const last = group.table[3];
        if (last) eliminated.push(norm(last.team.name));
      }
    }

    if (groups.length === 12 && groupComplete.every(Boolean)) {
      const thirds = groups
        .map(g => g.table[2])
        .filter(Boolean)
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
      thirds.slice(8).forEach(t => eliminated.push(norm(t.team.name)));
    }

    // KO round losers
    completed
      .filter(m => m.stage !== "GROUP_STAGE")
      .forEach(m => {
        const loser = norm(
          m.score.winner === "HOME_TEAM" ? m.awayTeam.name : m.homeTeam.name
        );
        if (!eliminated.includes(loser)) eliminated.push(loser);
      });

    // ── Auto-detected prizes ──────────────────────────────────────────────────
    const prizes = detectPrizes(completed, groups);

    // ── Goals table ───────────────────────────────────────────────────────────
    const goalsByTeam = {};
    for (const m of completed) {
      const h      = norm(m.homeTeam.name);
      const a      = norm(m.awayTeam.name);
      const isPen  = m.score.duration === "PENALTY_SHOOTOUT";
      const hGoals = (m.score.fullTime.home ?? 0) - (isPen ? (m.score.penalties?.home ?? 0) : 0);
      const aGoals = (m.score.fullTime.away ?? 0) - (isPen ? (m.score.penalties?.away ?? 0) : 0);
      goalsByTeam[h] = (goalsByTeam[h] ?? 0) + hGoals;
      goalsByTeam[a] = (goalsByTeam[a] ?? 0) + aGoals;
    }

    // ── Upcoming fixtures ─────────────────────────────────────────────────────
    const doneStatuses = new Set(["FINISHED", "CANCELLED", "POSTPONED", "SUSPENDED", "AWARDED"]);
    const upcomingSorted = allMatches
      .filter(m => !doneStatuses.has(m.status))
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    const nextGame = upcomingSorted[0] ? {
      dateISO: upcomingSorted[0].utcDate,
      team1:   upcomingSorted[0].homeTeam?.name ? norm(upcomingSorted[0].homeTeam.name) : null,
      team2:   upcomingSorted[0].awayTeam?.name ? norm(upcomingSorted[0].awayTeam.name) : null,
      stage:   mapStage(upcomingSorted[0].stage),
    } : null;

    const upcoming = upcomingSorted.map(m => ({
      id:      m.id,
      dateISO: m.utcDate,
      team1:   m.homeTeam?.name ? norm(m.homeTeam.name) : null,
      team2:   m.awayTeam?.name ? norm(m.awayTeam.name) : null,
      stage:   mapStage(m.stage),
    }));

    res.json({ matches, eliminated, prizes, goalsByTeam, nextGame, upcoming, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// ── Prize detection ───────────────────────────────────────────────────────────

function detectPrizes(completed, groups) {
  let winner = "", runnerUp = "";
  const finalMatch = completed.find(m => m.stage === "FINAL");
  if (finalMatch) {
    const homeWon = finalMatch.score.winner === "HOME_TEAM";
    winner   = norm(homeWon ? finalMatch.homeTeam.name : finalMatch.awayTeam.name);
    runnerUp = norm(homeWon ? finalMatch.awayTeam.name : finalMatch.homeTeam.name);
  }

  let third = "";
  const thirdMatch = completed.find(m => m.stage === "THIRD_PLACE");
  if (thirdMatch) {
    const homeWon = thirdMatch.score.winner === "HOME_TEAM";
    third = norm(homeWon ? thirdMatch.homeTeam.name : thirdMatch.awayTeam.name);
  }

  const goals = {};
  for (const m of completed) {
    const h = norm(m.homeTeam.name);
    const a = norm(m.awayTeam.name);
    goals[h] = (goals[h] ?? 0) + (m.score.fullTime.home ?? 0);
    goals[a] = (goals[a] ?? 0) + (m.score.fullTime.away ?? 0);
  }
  const topScorer = Object.entries(goals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

  let woodenSpoon = "";
  if (groups.length === 12 && groups.every(g => g.table.every(t => t.playedGames >= 3))) {
    const fourths = groups.map(g => g.table[3]).filter(Boolean);
    const worst = [...fourths].sort((a, b) => {
      if (a.points !== b.points) return a.points - b.points;
      if (a.goalDifference !== b.goalDifference) return a.goalDifference - b.goalDifference;
      return a.goalsFor - b.goalsFor;
    })[0];
    if (worst) woodenSpoon = norm(worst.team.name);
  }

  return { winner, runnerUp, third, topScorer, woodenSpoon, redCard: "South Africa" };
}

// ── Stage label ───────────────────────────────────────────────────────────────

function mapStage(stage) {
  if (!stage) return "Group Stage";
  switch (stage) {
    case "GROUP_STAGE":    return "Group Stage";
    case "LAST_32":        return "Round of 32";
    case "LAST_16":        return "Round of 16";
    case "QUARTER_FINALS": return "Quarter-final";
    case "SEMI_FINALS":    return "Semi-final";
    case "THIRD_PLACE":    return "Third Place Play-off";
    case "FINAL":          return "Final";
    default:               return stage;
  }
}
