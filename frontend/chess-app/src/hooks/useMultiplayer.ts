import { useCallback, useEffect, useRef } from "react";
import {
  ref,
  set,
  onValue,
  update,
  off,
  push,
  runTransaction,
  get,
} from "firebase/database";
import { rtdb } from "../lib/firebase";
import type { GameStatus, JoinRoomResult, MoveRecord, MultiplayerRoom } from "../types/chess";

interface UseMultiplayerProps {
  userId: string;
  onRoomUpdate: (room: MultiplayerRoom) => void;
}

function serializeMoves(moves: MoveRecord[]) {
  return moves.map((move) => ({
    san: move.san,
    from: move.from,
    to: move.to,
    color: move.color,
    ...(move.captured ? { captured: move.captured } : {}),
  }));
}

export function useMultiplayer({ userId, onRoomUpdate }: UseMultiplayerProps) {
  const roomRefCleanup = useRef<(() => void) | null>(null);

  // Создать комнату (ты — хост, играешь белыми)
  const createRoom = useCallback(async (hostName?: string): Promise<string> => {
    const roomsRef = ref(rtdb, "rooms");
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key!;

    const now = Date.now();
    const room: Omit<MultiplayerRoom, "id"> = {
      hostId:    userId,
      guestId:   null,
      hostName:  hostName ?? null,
      guestName: null,
      fen:       "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      turn:      "w",
      status:    "playing",
      moves:     [],
      createdAt: now,
      updatedAt: now,
    };

    await set(newRoomRef, room);
    return roomId;
  }, [userId]);

  // Присоединиться к комнате (ты — гость, играешь чёрными)
  const joinRoom = useCallback(
    async (roomId: string, guestName?: string): Promise<JoinRoomResult> => {
      const cleanRoomId = roomId.trim();
      if (!cleanRoomId) {
        return { ok: false, error: "Введите ID комнаты" };
      }

      const roomRef = ref(rtdb, `rooms/${cleanRoomId}`);
      const snapshot = await get(roomRef);
      const room = snapshot.val() as MultiplayerRoom | null;

      if (!room) {
        return { ok: false, error: "Комната не найдена" };
      }

      if (room.hostId === userId) {
        return { ok: true, playerColor: "w" };
      }

      if (room.guestId === userId) {
        return { ok: true, playerColor: "b" };
      }

      if (room.guestId) {
        return { ok: false, error: "Комната уже занята" };
      }

      if ((room.moves?.length ?? 0) > 0 || room.status !== "playing") {
        return { ok: false, error: "Партия уже началась" };
      }

      const guestRef = ref(rtdb, `rooms/${cleanRoomId}/guestId`);
      const transaction = await runTransaction(guestRef, (currentGuestId: string | null) => {
        if (currentGuestId && currentGuestId !== userId) return;
        return userId;
      });

      if (!transaction.committed) {
        return { ok: false, error: "Комната уже занята" };
      }

      await update(roomRef, { guestName: guestName ?? null, updatedAt: Date.now() });
      return { ok: true, playerColor: "b" };
    },
    [userId]
  );

  // Подписаться на изменения комнаты
  const subscribeToRoom = useCallback(
    (roomId: string) => {
      roomRefCleanup.current?.();
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

  const unsubscribeFromRoom = useCallback(() => {
    roomRefCleanup.current?.();
    roomRefCleanup.current = null;
  }, []);

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
      await update(roomRef, {
        fen,
        turn,
        status,
        moves: serializeMoves(allMoves),
        updatedAt: Date.now(),
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      roomRefCleanup.current?.();
    };
  }, []);

  return { createRoom, joinRoom, subscribeToRoom, unsubscribeFromRoom, sendMove };
}
