import { useState } from "react";

interface Props {
  roomId: string | null;
  playerColor: "w" | "b" | null;
  onCreateRoom: () => Promise<string>;
  onJoinRoom: (id: string) => Promise<boolean>;
}

export default function MultiplayerControls({
  roomId,
  playerColor,
  onCreateRoom,
  onJoinRoom,
}: Props) {
  const [joinId, setJoinId]     = useState("");
  const [copied, setCopied]     = useState(false);
  const [joining, setJoining]   = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    await onCreateRoom();
    setCreating(false);
  };

  const handleJoin = async () => {
    if (!joinId.trim()) return;
    setJoining(true);
    await onJoinRoom(joinId.trim());
    setJoining(false);
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
      <div className="bg-[#16213e] rounded-2xl p-4 space-y-3">
        <h3 className="font-display text-board-accent text-sm tracking-widest uppercase">
          Мультиплеер
        </h3>
        <p className="text-board-muted text-xs">
          Ты играешь за {playerColor === "w" ? "белых ♔" : "чёрных ♚"}
        </p>
        <div className="space-y-2">
          <p className="text-xs text-board-muted">ID комнаты:</p>
          <div className="flex gap-2">
            <code className="flex-1 bg-[#1a1a2e] text-board-accent text-xs px-3 py-2 rounded-lg truncate">
              {roomId}
            </code>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-2 rounded-lg border border-board-accent/30
                         text-board-muted hover:text-white transition-all duration-200"
            >
              {copied ? "✓" : "Копировать"}
            </button>
          </div>
          <p className="text-xs text-board-muted">
            Отправь ID другу — он введёт его чтобы присоединиться
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#16213e] rounded-2xl p-4 space-y-3">
      <h3 className="font-display text-board-accent text-sm tracking-widest uppercase">
        Мультиплеер
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

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="ID комнаты"
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          className="flex-1 bg-[#1a1a2e] text-white text-sm px-3 py-2 rounded-lg
                     border border-board-accent/20 focus:border-board-accent/60
                     focus:outline-none placeholder:text-board-muted/50"
        />
        <button
          onClick={handleJoin}
          disabled={joining || !joinId.trim()}
          className="px-3 py-2 rounded-lg border border-board-accent/30 text-board-muted
                     hover:text-white hover:border-board-accent/60 transition-all duration-200
                     text-sm disabled:opacity-50"
        >
          {joining ? "..." : "Войти"}
        </button>
      </div>
    </div>
  );
}