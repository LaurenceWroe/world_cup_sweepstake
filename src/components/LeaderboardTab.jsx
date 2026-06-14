import { DRAW, PLAYERS, FLAGS, PRIZE_STRUCTURE, PLAYER_COLORS, TOTAL_POT } from "../data/draw";

function computeScores(prizes, eliminated) {
  return PLAYERS.map((person, i) => {
    const teams = DRAW[person];
    let prizeMoney = 0;
    let prizeCount = 0;

    PRIZE_STRUCTURE.forEach((p) => {
      const winner = prizes[p.key];
      if (winner && teams.includes(winner)) {
        prizeMoney += Math.floor(TOTAL_POT * p.pct / 100);
        prizeCount++;
      }
    });

    const alive = teams.filter((t) => !eliminated.includes(t));
    const color = PLAYER_COLORS[i % PLAYER_COLORS.length];

    return { person, teams, alive, prizeMoney, prizeCount, color };
  }).sort((a, b) => {
    if (b.prizeMoney !== a.prizeMoney) return b.prizeMoney - a.prizeMoney;
    return b.alive.length - a.alive.length;
  });
}

export default function LeaderboardTab({ prizes, eliminated, onSelectPlayer }) {
  const scores = computeScores(prizes, eliminated);
  const prizesSet = PRIZE_STRUCTURE.filter((p) => prizes[p.key]).length;

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">Leaderboard</h2>
        <span className="section-sub">{prizesSet}/{PRIZE_STRUCTURE.length} prizes decided</span>
      </div>

      <div className="leaderboard">
        {scores.map((row, rank) => {
          const allOut = row.alive.length === 0;
          return (
            <button
              key={row.person}
              className={`lb-row ${rank < 3 ? "lb-top" : ""} ${allOut ? "lb-out" : ""}`}
              onClick={() => onSelectPlayer(row.person)}
              title="Click for player portal"
            >
              <div className="lb-rank" style={{ color: rankColor(rank) }}>
                {rankIcon(rank)}
              </div>
              <div className="lb-name" style={{ color: row.color }}>{row.person}</div>
              <div className="lb-teams">
                {row.teams.map((t) => (
                  <span
                    key={t}
                    className="lb-team-chip"
                    style={{ opacity: eliminated.includes(t) ? 0.35 : 1 }}
                  >
                    {FLAGS[t]} {t}
                  </span>
                ))}
              </div>
              <div className="lb-prizes">
                {PRIZE_STRUCTURE.map((p) => {
                  const won = prizes[p.key] && row.teams.includes(prizes[p.key]);
                  if (!won) return null;
                  return (
                    <span key={p.key} className="lb-prize-chip" title={p.label}>
                      {p.emoji}
                    </span>
                  );
                })}
              </div>
              <div className="lb-money" style={{ color: row.prizeMoney > 0 ? "#51cf66" : (allOut ? "#444" : "#666") }}>
                {row.prizeMoney > 0 ? `£${row.prizeMoney}` : allOut ? "💀" : "—"}
              </div>
            </button>
          );
        })}
      </div>

      <p className="lb-hint">Tap a player to open their portal ↗</p>
    </div>
  );
}

function rankIcon(rank) {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return `#${rank + 1}`;
}

function rankColor(rank) {
  if (rank === 0) return "#d4af37";
  if (rank === 1) return "#b0b8c8";
  if (rank === 2) return "#cd7f32";
  return "#555";
}
