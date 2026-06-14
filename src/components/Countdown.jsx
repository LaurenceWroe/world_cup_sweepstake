import { useState, useEffect } from "react";
import { DRAW, FLAGS } from "../data/draw";

const KICKOFF = new Date("2026-06-11T20:00:00-05:00");

function findOwner(team) {
  for (const [person, teams] of Object.entries(DRAW)) {
    if (teams.includes(team)) return person;
  }
  return null;
}

function getTimeLeft(target) {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export default function Countdown({ nextGame, matchesPlayed }) {
  const tournamentStarted = matchesPlayed || Date.now() >= KICKOFF;
  const target = tournamentStarted && nextGame ? new Date(nextGame.dateISO) : KICKOFF;

  const [left, setLeft] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const t = tournamentStarted && nextGame ? new Date(nextGame.dateISO) : KICKOFF;
    setLeft(getTimeLeft(t));
    const id = setInterval(() => setLeft(getTimeLeft(t)), 1000);
    return () => clearInterval(id);
  }, [nextGame]);  // eslint-disable-line react-hooks/exhaustive-deps

  if (!tournamentStarted) {
    if (!left) {
      return <div className="countdown-started">🏆 Tournament underway</div>;
    }
    return (
      <div className="countdown">
        <div className="countdown-label">KICK-OFF IN</div>
        <Units left={left} />
      </div>
    );
  }

  if (!nextGame) {
    return <div className="countdown-started">🏆 Tournament underway</div>;
  }

  const owner1 = findOwner(nextGame.team1);
  const owner2 = findOwner(nextGame.team2);
  const label1 = owner1 ? `${owner1} (${nextGame.team1})` : nextGame.team1;
  const label2 = owner2 ? `${owner2} (${nextGame.team2})` : nextGame.team2;

  return (
    <div className="countdown">
      <div className="countdown-label">COUNTDOWN TO NEXT GAME</div>
      <div className="countdown-matchup">
        <span className="countdown-team">{FLAGS[nextGame.team1]} {label1}</span>
        <span className="countdown-vs">vs</span>
        <span className="countdown-team">{FLAGS[nextGame.team2]} {label2}</span>
      </div>
      {left
        ? <Units left={left} />
        : <div className="countdown-live">⚽ LIVE NOW</div>
      }
    </div>
  );
}

function Units({ left }) {
  return (
    <div className="countdown-units">
      <Unit value={left.d} label="DAYS" />
      <Colon />
      <Unit value={left.h} label="HRS" />
      <Colon />
      <Unit value={left.m} label="MIN" />
      <Colon />
      <Unit value={left.s} label="SEC" />
    </div>
  );
}

function Unit({ value, label }) {
  return (
    <div className="countdown-unit">
      <div className="countdown-number">{String(value).padStart(2, "0")}</div>
      <div className="countdown-unit-label">{label}</div>
    </div>
  );
}

function Colon() {
  return <div className="countdown-colon">:</div>;
}
