import { DRAW } from "../data/draw";

export function findOwner(team) {
  for (const [person, teams] of Object.entries(DRAW)) {
    if (teams.includes(team)) return person;
  }
  return null;
}
