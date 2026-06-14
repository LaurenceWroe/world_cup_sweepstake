import { useState, useCallback } from "react";
import { DEFAULT_STATE } from "../data/state";

const STORAGE_KEY = "wc2026_sweepstake_v1";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useStore() {
  const [state, setState] = useState(load);

  const update = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      save(next);
      return next;
    });
  }, []);

  const setPrize = useCallback((key, team) => {
    update((s) => ({ ...s, prizes: { ...s.prizes, [key]: team } }));
  }, [update]);

  const addMatch = useCallback((match) => {
    update((s) => ({
      ...s,
      matches: [{ ...match, id: Date.now(), date: new Date().toLocaleDateString("en-GB") }, ...s.matches],
    }));
  }, [update]);

  const removeMatch = useCallback((id) => {
    update((s) => ({ ...s, matches: s.matches.filter((m) => m.id !== id) }));
  }, [update]);

  const setEliminated = useCallback((teams) => {
    update((s) => ({ ...s, eliminated: teams }));
  }, [update]);

  const toggleEliminated = useCallback((team) => {
    update((s) => ({
      ...s,
      eliminated: s.eliminated.includes(team)
        ? s.eliminated.filter((t) => t !== team)
        : [...s.eliminated, team],
    }));
  }, [update]);

  return { state, setPrize, addMatch, removeMatch, setEliminated, toggleEliminated };
}
