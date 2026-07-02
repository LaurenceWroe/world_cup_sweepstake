import { useState } from "react";
import { ALL_TEAMS, FLAGS } from "../data/draw";
import { STAGES } from "../data/state";
import { findOwner } from "../utils/helpers";

export default function ResultsTab({ matches, upcoming, addMatch, removeMatch, eliminated, toggleEliminated, liveLoading, updatedAt }) {
  const [form, setForm] = useState({ team1: "", score1: "", score2: "", team2: "", stage: "Group Stage" });
  const [adminOpen, setAdminOpen] = useState(false);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  function submit() {
    if (!form.team1 || !form.team2 || form.score1 === "" || form.score2 === "") return;
    addMatch(form);
    setForm({ team1: "", score1: "", score2: "", team2: "", stage: "Group Stage" });
  }

  // Latest stage first
  const byStage = [...STAGES].reverse().map((stage) => ({
    stage,
    matches: matches.filter((m) => m.stage === stage),
  })).filter((g) => g.matches.length > 0);

  // Upcoming grouped by stage (earliest first)
  const fixturesByStage = STAGES.map((stage) => ({
    stage,
    fixtures: upcoming.filter((f) => f.stage === stage),
  })).filter((g) => g.fixtures.length > 0);

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">
          Results
          {liveLoading && <span className="live-dot" title="Fetching scores…">⟳</span>}
          {!liveLoading && updatedAt && (
            <span className="live-badge" title="Live data, cached 30 min">LIVE</span>
          )}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {updatedAt && (
            <span className="updated-at">
              Updated {new Date(updatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button className="edit-toggle" onClick={() => setAdminOpen((o) => !o)}>
            {adminOpen ? "Close Admin" : "⚙️ Admin"}
          </button>
        </div>
      </div>

      {adminOpen && (
        <div className="admin-panel">
          <div className="panel-label">ADD RESULT</div>
          <div className="result-form">
            <TeamInput value={form.team1} onChange={(v) => set("team1", v)} placeholder="Home team" />
            <input
              className="score-input"
              type="number" min="0"
              value={form.score1}
              onChange={(e) => set("score1", e.target.value)}
              placeholder="0"
            />
            <span className="score-sep">–</span>
            <input
              className="score-input"
              type="number" min="0"
              value={form.score2}
              onChange={(e) => set("score2", e.target.value)}
              placeholder="0"
            />
            <TeamInput value={form.team2} onChange={(v) => set("team2", v)} placeholder="Away team" />
          </div>
          <div className="result-form-row2">
            <select className="stage-select" value={form.stage} onChange={(e) => set("stage", e.target.value)}>
              {STAGES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button className="add-btn" onClick={submit}>Add Result</button>
          </div>

          <div className="panel-label" style={{ marginTop: 20 }}>MARK TEAMS ELIMINATED</div>
          <p className="admin-note">Toggle teams that are out of the tournament.</p>
          <div className="elim-grid">
            {ALL_TEAMS.map((team) => {
              const out = eliminated.includes(team);
              return (
                <button
                  key={team}
                  className={`elim-chip ${out ? "elim-chip-out" : ""}`}
                  onClick={() => toggleEliminated(team)}
                >
                  {FLAGS[team]} {team} {out ? "✕" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming fixtures */}
      {fixturesByStage.length > 0 && (
        <div className="results-list" style={{ marginBottom: 32 }}>
          <div className="panel-label">UPCOMING FIXTURES</div>
          {fixturesByStage.map(({ stage, fixtures }) => (
            <div key={stage}>
              <div className="stage-header">{stage}</div>
              {fixtures.map((f) => {
                const o1 = f.team1 ? findOwner(f.team1) : null;
                const o2 = f.team2 ? findOwner(f.team2) : null;
                const kickoff = new Date(f.dateISO);
                return (
                  <div key={f.id} className="match-row fixture-row">
                    <div className="match-team match-team-home">
                      {f.team1 && <span className="match-flag">{FLAGS[f.team1]}</span>}
                      <span className="match-name">{f.team1 ?? "TBD"}</span>
                      {o1 && <span className="match-owner">{o1}</span>}
                    </div>
                    <div className="fixture-time">
                      <div className="fixture-date">{kickoff.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                      <div className="fixture-kickoff">{kickoff.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div className="match-team match-team-away">
                      {o2 && <span className="match-owner">{o2}</span>}
                      <span className="match-name">{f.team2 ?? "TBD"}</span>
                      {f.team2 && <span className="match-flag">{FLAGS[f.team2]}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {matches.length === 0 ? (
        <div className="empty-state">
          No results yet. Tournament kicks off <strong>11 June 2026</strong> 🏟️
        </div>
      ) : (
        <div className="results-list">
          <div className="panel-label">RESULTS</div>
          {byStage.map(({ stage, matches: stageMatches }) => (
            <div key={stage}>
              <div className="stage-header">{stage}</div>
              {stageMatches.map((m) => {
                const o1 = findOwner(m.team1);
                const o2 = findOwner(m.team2);
                return (
                  <div key={m.id} className="match-row">
                    <div className="match-team match-team-home">
                      <span className="match-flag">{FLAGS[m.team1]}</span>
                      <span className="match-name">{m.team1}</span>
                      {o1 && <span className="match-owner">{o1}</span>}
                    </div>
                    <div className="match-score">
                      <span>{m.score1}</span>
                      <span className="score-dash">–</span>
                      <span>{m.score2}</span>
                      {m.duration === "EXTRA_TIME" && <span className="score-aet">AET</span>}
                      {m.penScore1 != null && (
                        <span className="score-pens">({m.penScore1}–{m.penScore2} pens)</span>
                      )}
                    </div>
                    <div className="match-team match-team-away">
                      {o2 && <span className="match-owner">{o2}</span>}
                      <span className="match-name">{m.team2}</span>
                      <span className="match-flag">{FLAGS[m.team2]}</span>
                    </div>
                    {adminOpen && (
                      <button className="match-delete" onClick={() => removeMatch(m.id)} title="Remove">✕</button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <input
        className="team-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list="all-teams-list"
      />
      <datalist id="all-teams-list">
        {ALL_TEAMS.map((t) => <option key={t} value={t} />)}
      </datalist>
    </div>
  );
}
