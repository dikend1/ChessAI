import { useState } from "react";
import type { JoinRoomResult, MultiplayerRoom } from "../types/chess";

interface Props {
  roomId: string | null;
  room: MultiplayerRoom | null;
  multiplayerError: string | null;
  playerColor: "w" | "b" | null;
  onCreateRoom: () => Promise<string>;
  onJoinRoom: (id: string) => Promise<JoinRoomResult>;
  onLeaveRoom: () => void;
}

export default function MultiplayerControls({
  roomId,
  room,
  multiplayerError,
  playerColor,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
}: Props) {
  const [joinId, setJoinId]     = useState("");
  const [copied, setCopied]     = useState(false);
  const [joining, setJoining]   = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState("");

  const handleCreate = async () => {
    setError("");
    setCreating(true);
    try {
      await onCreateRoom();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(`Не удалось создать комнату: ${message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setError("");
    setJoining(true);
    try {
      const result = await onJoinRoom(joinId.trim());
      if (!result.ok) {
        setError(result.error || "Не удалось войти в комнату");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неизвестная ошибка";
      setError(`Не удалось войти в комнату: ${message}`);
    } finally {
      setJoining(false);
    }
  };

  const handleCopy = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Комната создана — показываем ссылку
  if (roomId) {
    return (
      <div className="app-card rounded-2xl p-4 space-y-3">
        <h3 className="truncate font-display text-board-accent text-sm uppercase tracking-[0.12em]">
          Online
        </h3>
        <p className="text-board-muted text-xs">
          Ты играешь за {playerColor === "w" ? "белых ♔" : "чёрных ♚"}
        </p>
        <div className="rounded-xl border border-board-accent/15 bg-[var(--page)] p-3 text-xs text-board-muted">
          <div className="flex justify-between gap-3">
            <span>Белые</span>
            <span className="truncate text-app">{room?.hostName || "Хост"}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>Чёрные</span>
            <span className="truncate text-app">
              {room?.guestId ? room.guestName || "Игрок подключен" : "Ожидаем игрока"}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-board-muted">ID комнаты:</p>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <code className="min-w-0 bg-[var(--page)] text-board-accent text-xs px-3 py-2 rounded-lg truncate">
              {roomId}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 text-xs px-3 py-2 rounded-lg border border-board-accent/30
                         text-board-muted hover:text-app transition-all duration-200"
            >
              {copied ? "✓" : "Копировать"}
            </button>
          </div>
          <p className="text-xs text-board-muted">
            Отправь ID другу — он введёт его чтобы присоединиться
          </p>
        </div>
        <button
          onClick={onLeaveRoom}
          className="w-full rounded-xl border border-red-400/30 px-3 py-2 text-sm font-medium
                     text-red-200 transition-all duration-200 hover:border-red-300/60 hover:bg-red-500/10"
        >
          Выйти из комнаты
        </button>
        {multiplayerError && (
          <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {multiplayerError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="app-card rounded-2xl p-4 space-y-3">
      <h3 className="truncate font-display text-board-accent text-sm uppercase tracking-[0.12em]">
        Online
      </h3>

      <button
        onClick={handleCreate}
        disabled={creating}
        className="w-full py-2 rounded-xl border border-board-accent text-board-accent
                   hover:bg-board-accent hover:text-[#1a1a2e] transition-all duration-200
                   text-sm font-medium disabled:opacity-50"
      >
        {creating ? "Создаём..." : "Создать комнату"}
      </button>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <input
          type="text"
          placeholder="ID комнаты"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          className="min-w-0 w-full box-border bg-[var(--page)] text-app text-sm px-3 py-2 rounded-lg
                     border border-board-accent/20 focus:border-board-accent/60
                     focus:outline-none placeholder:text-board-muted/50"
        />
        <button
          onClick={handleJoin}
          disabled={joining || !joinId.trim()}
          className="shrink-0 px-3 py-2 rounded-lg border border-board-accent/30 text-board-muted
                     hover:text-app hover:border-board-accent/60 transition-all duration-200
                     text-sm disabled:opacity-50"
        >
          {joining ? "..." : "Войти"}
        </button>
      </div>
      {error && (
        <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
