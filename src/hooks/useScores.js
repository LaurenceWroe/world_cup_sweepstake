import { useState, useEffect, useRef } from "react";

const POLL_MS = 30 * 60 * 1000; // 30 minutes — matches server cache TTL

export function useScores() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const timer = useRef(null);

  async function fetchScores() {
    try {
      const res = await fetch("/api/scores");
      if (!res.ok) return;
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) return; // dev server serving JS file
      const json = await res.json();
      setData(json);
    } catch {
      // silently fail — show whatever we have, don't alert users
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchScores();
    timer.current = setInterval(fetchScores, POLL_MS);
    return () => clearInterval(timer.current);
  }, []);

  return { data, loading };
}
