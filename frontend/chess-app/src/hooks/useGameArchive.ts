import { useCallback } from "react";
import { push, ref, set } from "firebase/database";
import { rtdb } from "../lib/firebase";
import type { SavedGameRecord } from "../types/chess";

type SaveGameInput = Omit<SavedGameRecord, "id" | "createdAt">;

export function useGameArchive() {
  const saveGame = useCallback(async (game: SaveGameInput): Promise<string> => {
    const userGamesRef = ref(rtdb, `users/${game.userId}/games`);
    const newGameRef = push(userGamesRef);
    const gameId = newGameRef.key!;

    await set(newGameRef, {
      ...game,
      id: gameId,
      createdAt: Date.now(),
    });

    return gameId;
  }, []);

  return { saveGame };
}
