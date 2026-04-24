"use client";

import { LeaderboardEntry } from "@/types/game";

const LEADERBOARD_KEY = "snake-game-leaderboard";
const MAX_ENTRIES = 10;

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (entry): entry is LeaderboardEntry =>
        typeof entry === "object" &&
        entry !== null &&
        typeof entry.score === "number" &&
        typeof entry.timestamp === "number" &&
        typeof entry.id === "string"
    );
  } catch {
    return [];
  }
}

export function saveScore(score: number): LeaderboardEntry {
  const entry: LeaderboardEntry = {
    score,
    timestamp: Date.now(),
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };

  const current = loadLeaderboard();
  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }

  return entry;
}

export function clearLeaderboard(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
