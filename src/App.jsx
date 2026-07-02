import { useState, useEffect } from "react";
import { useStore } from "./hooks/useStore";
import { useScores } from "./hooks/useScores";
import DrawTab from "./components/DrawTab";
import LeaderboardTab from "./components/LeaderboardTab";
import PrizesTab from "./components/PrizesTab";
import ResultsTab from "./components/ResultsTab";
import PlayerPortal from "./components/PlayerPortal";
import Countdown from "./components/Countdown";
import { TOTAL_POT, PLAYERS, DRAW } from "./data/draw";
import "./index.css";

const TABS = [
  { id: "leaderboard", label: "🏆 Leaderboard" },
  { id: "draw",        label: "🎯 The Draw" },
  { id: "results",     label: "⚽ Results" },
  { id: "prizes",      label: "💰 Prizes" },
];

export default function App() {
  const [activeTab, setActiveTab]     = useState("leaderboard");
  const [selectedPlayer, setSelected] = useState(null);
  const [theme, setTheme]             = useState(() => localStorage.getItem("theme") || "light");
  const { state, setPrize, addMatch, removeMatch, toggleEliminated } = useStore();
  const { data: liveData, loading: liveLoading } = useScores();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const liveMatches   = liveData?.matches ?? [];
  const manualMatches = state.matches.filter(
    (m) => !liveMatches.some((l) => l.team1 === m.team1 && l.team2 === m.team2 && l.date === m.date)
  );
  const allMatches    = [...liveMatches, ...manualMatches];

  const allEliminated = [...new Set([...(liveData?.eliminated ?? []), ...state.eliminated])];

  const playersEliminated = PLAYERS.filter(
    (p) => DRAW[p].every((t) => allEliminated.includes(t))
  ).length;

  // Auto-detected prizes from API; red card written back via setPrize when found
  const autoPrizes = liveData?.prizes ?? {};
  const prizes = {
    winner:      autoPrizes.winner      || "",
    runnerUp:    autoPrizes.runnerUp    || "",
    third:       autoPrizes.third       || "",
    topScorer:   autoPrizes.topScorer   || "",
    redCard:     state.prizes.redCard   || autoPrizes.redCard || "",
    woodenSpoon: autoPrizes.woodenSpoon || "",
  };

  return (
    <div className="app">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="container">
        <header className="header">
          <button
            className="theme-toggle"
            onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            title="Toggle light/dark mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <div className="header-eyebrow">OFFICIAL SWEEPSTAKE</div>
          <h1 className="header-title">
            <span className="title-fifa">FIFA</span>{" "}
            <span className="title-wc">World Cup</span>{" "}
            <span className="title-year">2026</span>
          </h1>

          <Countdown
            nextGame={liveData?.nextGame ?? null}
            matchesPlayed={(liveData?.matches?.length ?? 0) > 0}
          />

          <div className="header-stats">
            <Stat value={`£${TOTAL_POT}`}                        label="TOTAL POT"          color="#d4af37" />
            <Stat value={`${allEliminated.length}/48`}           label="TEAMS ELIMINATED"   color="#ff6b6b" />
            <Stat value={`${playersEliminated}/24`}              label="PLAYERS ELIMINATED" color="#ff6b6b" />
          </div>
        </header>

        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "tab-active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main className="content">
          {activeTab === "leaderboard" && (
            <LeaderboardTab
              prizes={prizes}
              eliminated={allEliminated}
              onSelectPlayer={setSelected}
              goalsByTeam={liveData?.goalsByTeam ?? {}}
            />
          )}
          {activeTab === "draw" && (
            <DrawTab eliminated={allEliminated} />
          )}
          {activeTab === "results" && (
            <ResultsTab
              matches={allMatches}
              upcoming={liveData?.upcoming ?? []}
              addMatch={addMatch}
              removeMatch={removeMatch}
              eliminated={allEliminated}
              toggleEliminated={toggleEliminated}
              liveLoading={liveLoading}
              updatedAt={liveData?.updatedAt}
            />
          )}
          {activeTab === "prizes" && (
            <PrizesTab
              prizes={prizes}
              setPrize={setPrize}
              goalsByTeam={liveData?.goalsByTeam ?? {}}
            />
          )}
        </main>

        <footer className="footer">
          USA · CANADA · MEXICO · 11 JUNE – 19 JULY 2026
        </footer>
      </div>

      {selectedPlayer && (
        <PlayerPortal
          player={selectedPlayer}
          prizes={prizes}
          eliminated={allEliminated}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Stat({ value, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
