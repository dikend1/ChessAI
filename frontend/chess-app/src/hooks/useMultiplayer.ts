import { useCallback, useEffect, useRef } from "react";
import {
  ref,
  set,
  onValue,
  update,
  off,
  push,
} from "firebase/database";
import { rtdb } from "../lib/firebase";
import type { GameStatus, MoveRecord, MultiplayerRoom } from "../types/chess";

interface UseMultiplayerProps {
  userId: string;
  onRoomUpdate: (room: MultiplayerRoom) => void;
}

export function useMultiplayer({ userId, onRoomUpdate }: UseMultiplayerProps) {
  const roomRefCleanup = useRef<(() => void) | null>(null);

  // Создать комнату (ты — хост, играешь белыми)
  const createRoom = useCallback(async (hostName?: string): Promise<string> => {
    const roomsRef = ref(rtdb, "rooms");
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key!;

    const room: Omit<MultiplayerRoom, "id"> = {
      hostId:    userId,
      guestId:   null,
      hostName:  hostName ?? null,
      guestName: null,
      fen:       "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      turn:      "w",
      status:    "playing",
      moves:     [],
      createdAt: Date.now(),
    };

    await set(newRoomRef, room);
    return roomId;
  }, [userId]);

  // Присоединиться к комнате (ты — гость, играешь чёрными)
  const joinRoom = useCallback(
    async (roomId: string, guestName?: string): Promise<boolean> => {
      const roomRef = ref(rtdb, `rooms/${roomId}`);
      await update(roomRef, { guestId: userId, guestName: guestName ?? null });
      return true;
    },
    [userId]
  );

  // Подписаться на изменения комнаты
  const subscribeToRoom = useCallback(
    (roomId: string) => {
      const roomRef = ref(rtdb, `rooms/${roomId}`);
      onValue(roomRef, (snap) => {
        const data = snap.val();
        if (data) {
          onRoomUpdate({ id: roomId, ...data });
        }
      });

      roomRefCleanup.current = () => off(roomRef);
    },
    [onRoomUpdate]
  );

  // Отправить ход в Firebase
  const sendMove = useCallback(
    async (
      roomId: string,
      fen: string,
      turn: "w" | "b",
      status: GameStatus,
      allMoves: MoveRecord[]
    ) => {
      const roomRef = ref(rtdb, `rooms/${roomId}`);
      await update(roomRef, { fen, turn, status, moves: allMoves });
    },
    []
  );

  useEffect(() => {
    return () => {
      roomRefCleanup.current?.();
    };
  }, []);

  return { createRoom, joinRoom, subscribeToRoom, sendMove };
}
