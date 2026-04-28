import { useCallback, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useStockfish } from "./useStockfish";
import { useMultiplayer } from "./useMultiplayer";
import type {
  GameStatus,
  MoveRecord,
  GameState,
  GameMode,
  HintMove,
  MultiplayerRoom,
  JoinRoomResult,
} from "../types/chess";

const START_FEN = new Chess().fen();

function getGameStatus(game: Chess): GameStatus {
  if (game.isCheckmate()) return "checkmate";
  if (game.isDraw()) return "draw";
  if (game.isCheck()) return "check";
  return "playing";
}

interface Props {
  userId: string;
  userName?: string | null;
}

export function useChessGame({ userId, userName }: Props): GameState {
  const gameRef        = useRef<Chess>(new Chess());
  const [fen, setFen]  = useState<string>(START_FEN);
  const [history, setHistory]         = useState<MoveRecord[]>([]);
  const [status, setStatus]           = useState<GameStatus>("playing");
  const [gameMode, setGameModeState]  = useState<GameMode>("pvp");
  const [aiLevel, setAiLevelState]    = useState<number>(10);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hintMove, setHintMove] = useState<HintMove | null>(null);
  const [roomId, setRoomId]           = useState<string | null>(null);
  const [room, setRoom]               = useState<MultiplayerRoom | null>(null);
  const [multiplayerError, setMultiplayerError] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const lastRoomUpdatedAtRef = useRef(0);

  const updateStatus = useCallback((g: Chess) => {
    setStatus(getGameStatus(g));
  }, []);

  // Обновление доски из Firebase (мультиплеер)
  const handleRoomUpdate = useCallback((room: MultiplayerRoom) => {
    const updatedAt = room.updatedAt ?? room.createdAt ?? 0;
    if (updatedAt < lastRoomUpdatedAtRef.current) return;

    lastRoomUpdatedAtRef.current = updatedAt;
    gameRef.current.load(room.fen);
    setFen(room.fen);
    setHistory(room.moves ?? []);
    setStatus(room.status);
    setHintMove(null);
    setRoom(room);
  }, []);

  const { createRoom, joinRoom, subscribeToRoom, unsubscribeFromRoom, sendMove } = useMultiplayer({
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
        if (move.captured) {
          record.captured = move.captured;
        }

        setFen(game.fen());
        setHistory((prev) => [...prev, record]);
        setHintMove(null);
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
      if (status === "resigned") return false;

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
          const nextFen = g.fen();
          const nextTurn = g.turn() as "w" | "b";
          const nextStatus = getGameStatus(g);
          const localUpdatedAt = Date.now();
          lastRoomUpdatedAtRef.current = localUpdatedAt;
          setRoom((prev) => prev ? {
            ...prev,
            fen: nextFen,
            turn: nextTurn,
            status: nextStatus,
            moves: newHistory,
            updatedAt: localUpdatedAt,
          } : prev);

          void sendMove(roomId, nextFen, nextTurn, nextStatus, newHistory)
            .then(() => setMultiplayerError(null))
            .catch((err) => {
              const message = err instanceof Error ? err.message : "Неизвестная ошибка";
              setMultiplayerError(`Ход не отправился: ${message}`);
            });
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
    setHintMove(null);
    setRoomId(null);
    setRoom(null);
    setMultiplayerError(null);
    setPlayerColor(null);
  }, []);

  const undoMove = useCallback((): boolean => {
    if (gameMode === "multiplayer" || isAiThinking || history.length === 0) return false;

    const steps = gameMode === "ai" && history.length > 1 ? 2 : 1;
    for (let i = 0; i < steps; i += 1) {
      gameRef.current.undo();
    }

    setHistory((prev) => prev.slice(0, Math.max(0, prev.length - steps)));
    setFen(gameRef.current.fen());
    setHintMove(null);
    updateStatus(gameRef.current);
    return true;
  }, [gameMode, history.length, isAiThinking, updateStatus]);

  const resignGame = useCallback(() => {
    if (gameRef.current.isGameOver() || status === "resigned") return;
    setIsAiThinking(false);
    setHintMove(null);
    setStatus("resigned");

    if (gameMode === "multiplayer" && roomId) {
      const localUpdatedAt = Date.now();
      lastRoomUpdatedAtRef.current = localUpdatedAt;
      setRoom((prev) => prev ? {
        ...prev,
        status: "resigned",
        updatedAt: localUpdatedAt,
      } : prev);

      void sendMove(
        roomId,
        gameRef.current.fen(),
        gameRef.current.turn() as "w" | "b",
        "resigned",
        history
      )
        .then(() => setMultiplayerError(null))
        .catch((err) => {
          const message = err instanceof Error ? err.message : "Неизвестная ошибка";
          setMultiplayerError(`Сдача не отправилась: ${message}`);
        });
    }
  }, [gameMode, history, roomId, sendMove, status]);

  const getHint = useCallback(() => {
    if (isAiThinking || gameRef.current.isGameOver() || status === "resigned") return;

    if (gameMode === "multiplayer") {
      if (!playerColor || gameRef.current.turn() !== playerColor) return;
    }

    const moves = gameRef.current.moves({ verbose: true });
    const move = moves.find((candidate) => candidate.san.includes("#"))
      ?? moves.find((candidate) => candidate.san.includes("+"))
      ?? moves.find((candidate) => candidate.captured)
      ?? moves[0];

    if (move) {
      setHintMove({ from: move.from, to: move.to, san: move.san });
    }
  }, [gameMode, isAiThinking, playerColor, status]);

  const leaveRoom = useCallback(() => {
    unsubscribeFromRoom();
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setHistory([]);
    setStatus("playing");
    setIsAiThinking(false);
    setHintMove(null);
    setRoomId(null);
    setRoom(null);
    setMultiplayerError(null);
    lastRoomUpdatedAtRef.current = 0;
    setPlayerColor(null);
    setGameModeState("pvp");
  }, [unsubscribeFromRoom]);

  const handleCreateRoom = useCallback(async (): Promise<string> => {
    const id = await createRoom(userName || "Игрок");
    lastRoomUpdatedAtRef.current = 0;
    setRoomId(id);
    setRoom(null);
    setMultiplayerError(null);
    setPlayerColor("w");
    setGameModeState("multiplayer");
    subscribeToRoom(id);
    return id;
  }, [createRoom, subscribeToRoom, userName]);

  const handleJoinRoom = useCallback(
    async (id: string): Promise<JoinRoomResult> => {
      const cleanId = id.trim();
      const result = await joinRoom(cleanId, userName || "Игрок");
      if (result.ok) {
        lastRoomUpdatedAtRef.current = 0;
        setRoomId(cleanId);
        setMultiplayerError(null);
        setPlayerColor(result.playerColor ?? "b");
        setGameModeState("multiplayer");
        subscribeToRoom(cleanId);
      }
      return result;
    },
    [joinRoom, subscribeToRoom, userName]
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
    hintMove,
    roomId,
    room,
    multiplayerError,
    playerColor,
    onDrop,
    resetGame,
    undoMove,
    resignGame,
    getHint,
    setGameMode,
    setAiLevel: setAiLevelState,
    createRoom: handleCreateRoom,
    joinRoom: handleJoinRoom,
    leaveRoom,
  };
}
