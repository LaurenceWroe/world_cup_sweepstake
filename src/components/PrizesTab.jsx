import { useState } from "react";
import { PRIZE_STRUCTURE, TOTAL_POT, FLAGS } from "../data/draw";
import { findOwner } from "../utils/helpers";

export default function PrizesTab({ prizes, goalsByTeam }) {
  const [checkingRedCard, setChecking] = useState(false);
  const [redCardChecked, setChecked]   = useState(false);

  const allSettled = PRIZE_STRUCTURE.every((p) => prizes[p.key]);

  const goalsTable = Object.entries(goalsByTeam)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  async function checkRedCard() {
    setChecking(true);
    try {
      const res  = await fetch("/api/redcard");
      const data = await res.json();
      if (data.found) {
        // Result is now in mergedPrizes via App.jsx — just flag as checked
      }
      setChecked(true);
    } catch {
      setChecked(true);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">Prize Tracker</h2>
        <span className="prize-pot">£{TOTAL_POT} pot</span>
      </div>

      {/* Prize breakdown */}
      <div className="prize-breakdown">
        {PRIZE_STRUCTURE.map((p) => (
          <div key={p.key} className="prize-breakdown-row">
            <span className="prize-breakdown-label">{p.emoji} {p.label}</span>
            <span className="prize-breakdown-pct">{p.pct}%</span>
            <span className="prize-breakdown-amount">£{Math.floor(TOTAL_POT * p.pct / 100)}</span>
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="prizes-list">
        <div className="panel-label" style={{ marginBottom: 12 }}>RESULTS</div>
        {PRIZE_STRUCTURE.map((p) => {
          const team   = prizes[p.key];
          const owner  = team ? findOwner(team) : null;
          const amount = Math.floor(TOTAL_POT * p.pct / 100);

          return (
            <div key={p.key} className={`prize-result-row ${owner ? "prize-result-won" : ""}`}>
              <div className="prize-result-left">
                <div className="prize-result-name">{p.emoji} {p.label}</div>
                <div className="prize-result-team">
                  {team
                    ? `${FLAGS[team] || ""} ${team}${p.key === "topScorer" && goalsByTeam[team] ? ` · ${goalsByTeam[team]} goals` : ""}`
                    : p.key === "redCard"
                      ? <button
                          className="redcard-check-btn"
                          onClick={checkRedCard}
                          disabled={checkingRedCard}
                        >
                          {checkingRedCard ? "Checking…" : redCardChecked ? "None found yet" : "🟥 Check for first red card"}
                        </button>
                      : p.key === "topScorer" && goalsTable.length > 0
                        ? <span className="goals-leader">
                            Leader: {goalsTable.map(([t, g]) => `${FLAGS[t] || ""}${t} (${g})`).join(" · ")}
                          </span>
                        : "TBC"
                  }
                </div>
              </div>
              <div className="prize-result-person">{owner || "—"}</div>
              <div className="prize-result-amount" style={{ color: owner ? "#51cf66" : "#333" }}>
                {owner ? `£${amount}` : "—"}
              </div>
            </div>
          );
        })}
      </div>

      {allSettled && (
        <div className="prize-complete-banner">
          🎉 <strong>Sweepstake Complete!</strong> £{TOTAL_POT} distributed.
        </div>
      )}
    </div>
  );
}
