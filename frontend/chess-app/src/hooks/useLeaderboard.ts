import { useCallback, useEffect, useState } from "react";
import { onValue, ref, runTransaction } from "firebase/database";
import { rtdb } from "../lib/firebase";
import type { LeaderboardEntry } from "../types/chess";

const CITY_ID = "almaty";
const CITY_NAME = "Алматы";

interface SubmitResultInput {
  userId: string;
  name: string;
  won: boolean;
}

function normalizeEntry(userId: string, value: Partial<LeaderboardEntry>): LeaderboardEntry {
  return {
    userId,
    name: value.name || "Игрок",
    city: value.city || CITY_NAME,
    wins: value.wins ?? 0,
    games: value.games ?? 0,
    updatedAt: value.updatedAt ?? 0,
  };
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const leaderboardRef = ref(rtdb, `leaderboards/cities/${CITY_ID}`);
    return onValue(leaderboardRef, (snapshot) => {
      const value = snapshot.val() as Record<string, Partial<LeaderboardEntry>> | null;
      const nextEntries = Object.entries(value ?? {})
        .map(([userId, entry]) => normalizeEntry(userId, entry))
        .sort((a, b) => b.wins - a.wins || b.updatedAt - a.updatedAt)
        .slice(0, 10);

      setEntries(nextEntries);
      setIsLoading(false);
    });
  }, []);

  const submitResult = useCallback(async ({ userId, name, won }: SubmitResultInput) => {
    const entryRef = ref(rtdb, `leaderboards/cities/${CITY_ID}/${userId}`);
    await runTransaction(entryRef, (current: Partial<LeaderboardEntry> | null) => ({
      userId,
      name,
      city: CITY_NAME,
      wins: (current?.wins ?? 0) + (won ? 1 : 0),
      games: (current?.games ?? 0) + 1,
      updatedAt: Date.now(),
    }));
  }, []);

  return { cityName: CITY_NAME, entries, isLoading, submitResult };
}
