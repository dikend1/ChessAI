import { useCallback, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useStockfish } from "./useStockfish";
import { useMultiplayer } from "./useMultiplayer";
import type {
  GameStatus,
  MoveRecord,
  GameState,
  GameMode,
  MultiplayerRoom,
} from "../types/chess";

const START_FEN = new Chess().fen();

interface Props {
  userId: string;
}

export function useChessGame({ userId }: Props): GameState {
  const gameRef        = useRef<Chess>(new Chess());
  const [fen, setFen]  = useState<string>(START_FEN);
  const [history, setHistory]         = useState<MoveRecord[]>([]);
  const [status, setStatus]           = useState<GameStatus>("playing");
  const [gameMode, setGameModeState]  = useState<GameMode>("pvp");
  const [aiLevel, setAiLevelState]    = useState<number>(10);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [roomId, setRoomId]           = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);

  const updateStatus = useCallback((g: Chess) => {
    if (g.isCheckmate()) setStatus("checkmate");
    else if (g.isDraw()) setStatus("draw");
    else if (g.isCheck()) setStatus("check");
    else setStatus("playing");
  }, []);

  // Обновление доски из Firebase (мультиплеер)
  const handleRoomUpdate = useCallback((room: MultiplayerRoom) => {
    gameRef.current.load(room.fen);
    setFen(room.fen);
    setHistory(room.moves ?? []);
    setStatus(room.status);
  }, []);

  const { createRoom, joinRoom, subscribeToRoom, sendMove } = useMultiplayer({
    userId,
    onRoomUpdate: handleRoomUpdate,
  });

  const applyMove = useCallback(
    (from: string, to: string): MoveRecord | null => {
      const game = gameRef.current;
      try {
        const move = game.move({ from, to, promotion: "q" });
        if (!move) return null;

        const record: MoveRecord = {
          san:   move.san,
          from:  move.from,
          to:    move.to,
          color: move.color,
        };

        setFen(game.fen());
        setHistory((prev) => [...prev, record]);
        updateStatus(game);
        return record;
      } catch {
        return null;
      }
    },
    [updateStatus]
  );

  const handleBestMove = useCallback(
    (moveStr: string) => {
      // Парсим move строку типа "e2e4" на from и to
      const from = moveStr.slice(0, 2);
      const to = moveStr.slice(2, 4);
      setIsAiThinking(false);
      applyMove(from, to);
    },
    [applyMove]
  );

  const { getBestMove } = useStockfish({ onBestMove: handleBestMove, difficulty: aiLevel });

  const onDrop = useCallback(
    (sourceSquare: string, targetSquare: string): boolean => {
      const game = gameRef.current;

      // AI режим — только свой цвет
      if (gameMode === "ai" && game.turn() === "b") return false;
      if (isAiThinking) return false;

      // Мультиплеер — только свой цвет
      if (gameMode === "multiplayer") {
        if (!playerColor || game.turn() !== playerColor) return false;
      }

      const moveRecord = applyMove(sourceSquare, targetSquare);

      if (moveRecord) {
        // AI отвечает
        if (gameMode === "ai" && !gameRef.current.isGameOver()) {
          setIsAiThinking(true);
          setTimeout(() => getBestMove(gameRef.current.fen()), 300);
        }

        // Отправляем ход в Firebase
        if (gameMode === "multiplayer" && roomId) {
          const g = gameRef.current;
          const newHistory = [...history, moveRecord];
          sendMove(
            roomId,
            g.fen(),
            g.turn() as "w" | "b",
            status,
            newHistory
          );
        }
      }

      return Boolean(moveRecord);
    },
    [
      applyMove, gameMode, isAiThinking, getBestMove,
      playerColor, roomId, history, status, sendMove,
    ]
  );

  const resetGame = useCallback(() => {
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setHistory([]);
    setStatus("playing");
    setIsAiThinking(false);
    setRoomId(null);
    setPlayerColor(null);
  }, []);

  const handleCreateRoom = useCallback(async (): Promise<string> => {
    const id = await createRoom();
    setRoomId(id);
    setPlayerColor("w");
    setGameModeState("multiplayer");
    subscribeToRoom(id);
    return id;
  }, [createRoom, subscribeToRoom]);

  const handleJoinRoom = useCallback(
    async (id: string): Promise<boolean> => {
      const ok = await joinRoom(id);
      if (ok) {
        setRoomId(id);
        setPlayerColor("b");
        setGameModeState("multiplayer");
        subscribeToRoom(id);
      }
      return ok;
    },
    [joinRoom, subscribeToRoom]
  );

  const setGameMode = useCallback(
    (mode: GameMode) => {
      setGameModeState(mode);
      resetGame();
    },
    [resetGame]
  );

  return {
    fen,
    history,
    status,
    currentTurn: fen.split(" ")[1] === "w" ? "Белые" : "Чёрные",
    gameMode,
    aiLevel,
    isAiThinking,
    roomId,
    playerColor,
    onDrop,
    resetGame,
    setGameMode,
    setAiLevel: setAiLevelState,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
  };
}
