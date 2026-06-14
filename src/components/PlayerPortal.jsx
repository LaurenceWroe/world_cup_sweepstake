import { DRAW, FLAGS, PRIZE_STRUCTURE, PLAYER_COLORS, PLAYERS, TOTAL_POT } from "../data/draw";

export default function PlayerPortal({ player, prizes, eliminated, onClose }) {
  const teams = DRAW[player];
  const playerIndex = PLAYERS.indexOf(player);
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];

  const wonPrizes = PRIZE_STRUCTURE.filter(
    (p) => prizes[p.key] && teams.includes(prizes[p.key])
  );
  const totalWon = wonPrizes.reduce((sum, p) => sum + Math.floor(TOTAL_POT * p.pct / 100), 0);

  const stillAlive = teams.filter((t) => !eliminated.includes(t));

  // For each undecided prize, what are this player's chances?
  const undecidedPrizes = PRIZE_STRUCTURE.filter((p) => !prizes[p.key]);
  const teamsInPlay = teams.filter((t) => !eliminated.includes(t));

  // Naive odds: 1-in-(remaining teams) for each alive team
  const remainingTeams = PLAYERS.flatMap((p) => DRAW[p]).filter((t) => !eliminated.includes(t));
  const uniqueRemaining = [...new Set(remainingTeams)].length || 1;

  return (
    <div className="portal-overlay" onClick={onClose}>
      <div className="portal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="portal-close" onClick={onClose}>✕</button>

        <div className="portal-header" style={{ borderBottomColor: color }}>
          <div className="portal-player-name" style={{ color }}>{player}</div>
          <div className="portal-subtitle">Player Portal</div>
        </div>

        {/* Teams */}
        <div className="portal-section">
          <div className="portal-section-label">Your Teams</div>
          <div className="portal-teams">
            {teams.map((team) => {
              const out = eliminated.includes(team);
              return (
                <div key={team} className={`portal-team-card ${out ? "portal-team-out" : ""}`}>
                  <span className="portal-team-flag">{FLAGS[team]}</span>
                  <span className="portal-team-name">{team}</span>
                  <span className={`portal-team-status ${out ? "status-out" : "status-alive"}`}>
                    {out ? "Eliminated" : "In tournament"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prizes won */}
        {wonPrizes.length > 0 && (
          <div className="portal-section">
            <div className="portal-section-label">Prizes Won 🎉</div>
            {wonPrizes.map((p) => (
              <div key={p.key} className="portal-prize-row">
                <span>{p.emoji} {p.label}</span>
                <span className="portal-prize-amount">£{Math.floor(TOTAL_POT * p.pct / 100)}</span>
              </div>
            ))}
            <div className="portal-prize-total">Total: £{totalWon}</div>
          </div>
        )}

        {/* Chances on undecided prizes */}
        {undecidedPrizes.length > 0 && teamsInPlay.length > 0 && (
          <div className="portal-section">
            <div className="portal-section-label">Prize Chances (Forecast)</div>
            <p className="portal-odds-note">
              Based on {teamsInPlay.length} team{teamsInPlay.length > 1 ? "s" : ""} still alive
              out of {uniqueRemaining} remaining nations.
            </p>
            {undecidedPrizes.map((p) => {
              // Each alive team has a 1/uniqueRemaining chance; player has teamsInPlay.length shots
              const chancePct = Math.round((teamsInPlay.length / uniqueRemaining) * 100);
              const potentialWin = Math.floor(TOTAL_POT * p.pct / 100);
              return (
                <div key={p.key} className="portal-odds-row">
                  <span className="portal-odds-prize">{p.emoji} {p.label}</span>
                  <span className="portal-odds-pct">{chancePct}%</span>
                  <span className="portal-odds-val">£{potentialWin}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Wooden spoon check */}
        {stillAlive.length === 0 && (
          <div className="portal-wooden-spoon">
            🥄 Both teams eliminated — watching for the Wooden Spoon prize!
          </div>
        )}

        {stillAlive.length === 0 && prizes.woodenSpoon === "" && (
          <div className="portal-note">
            Wooden spoon goes to the last team eliminated. Stay tuned!
          </div>
        )}
      </div>
    </div>
  );
}
