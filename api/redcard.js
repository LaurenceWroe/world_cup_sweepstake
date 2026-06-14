// On-demand endpoint: checks completed fixtures chronologically until the
// first red card is found. Called only when someone clicks "Check" in the UI.

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE    = "https://api.football-data.org/v4";
const COMP    = "WC";

const NAME_MAP = {
  "Netherlands": "Holland", "United States": "USA",
  "Ivory Coast": "Ivory Coast", "Côte d'Ivoire": "Ivory Coast",
  "Bosnia-Herzegovina": "Bosnia", "Bosnia and Herzegovina": "Bosnia",
  "Czech Republic": "Czechia",
  "Curaçao": "Curacao", "Cape Verde Islands": "Cape Verde",
  "DR Congo": "DR Congo", "Congo DR": "DR Congo",
};
function norm(name) { return NAME_MAP[name] ?? name; }

export default async function handler(req, res) {
  try {
    const matchesRes = await fetch(
      `${BASE}/competitions/${COMP}/matches?status=FINISHED`,
      { headers: { "X-Auth-Token": API_KEY } }
    );
    if (!matchesRes.ok) throw new Error(`Matches fetch failed: ${matchesRes.status}`);
    const { matches } = await matchesRes.json();

    const sorted = [...(matches ?? [])].sort(
      (a, b) => new Date(a.utcDate) - new Date(b.utcDate)
    );

    // Check up to 20 fixtures for a red card (bookings are in the per-match response)
    for (const match of sorted.slice(0, 20)) {
      const detailRes = await fetch(
        `${BASE}/matches/${match.id}`,
        { headers: { "X-Auth-Token": API_KEY } }
      );
      if (!detailRes.ok) continue;
      const detail = await detailRes.json();

      const bookings = detail.bookings ?? [];
      const redCardEvent = bookings.find(
        b => b.card === "RED_CARD" || b.card === "YELLOW_RED_CARD"
      );

      if (redCardEvent) {
        const team  = norm(redCardEvent.team.name);
        const match = `${norm(detail.homeTeam.name)} vs ${norm(detail.awayTeam.name)}`;
        const date  = new Date(detail.utcDate).toLocaleDateString("en-GB");
        res.json({ found: true, team, match, date, minute: redCardEvent.minute });
        return;
      }
    }

    res.json({ found: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
