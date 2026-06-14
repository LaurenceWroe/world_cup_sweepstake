import { DRAW, PLAYERS, FLAGS, PLAYER_COLORS } from "../data/draw";

export default function DrawTab({ eliminated }) {
  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">The Draw</h2>
        <span className="section-sub">£4 per person · 2 nations each</span>
      </div>
      <div className="draw-grid">
        {PLAYERS.map((person, i) => {
          const [t1, t2] = DRAW[person];
          const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
          const t1Out = eliminated.includes(t1);
          const t2Out = eliminated.includes(t2);
          const allOut = t1Out && t2Out;
          return (
            <div key={person} className="draw-card" style={{ borderTopColor: color, opacity: allOut ? 0.45 : 1 }}>
              <div className="draw-card-name" style={{ color }}>{person}</div>
              <TeamRow team={t1} flag={FLAGS[t1]} out={t1Out} />
              <TeamRow team={t2} flag={FLAGS[t2]} out={t2Out} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamRow({ team, flag, out }) {
  return (
    <div className="draw-team-row" style={{ opacity: out ? 0.4 : 1 }}>
      <span className="draw-flag">{flag}</span>
      <span className="draw-team-name" style={{ textDecoration: out ? "line-through" : "none" }}>{team}</span>
      {out && <span className="out-badge">OUT</span>}
    </div>
  );
}
