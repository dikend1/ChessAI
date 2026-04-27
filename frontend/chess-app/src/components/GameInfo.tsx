import type { GameStatus } from "../types/chess";

interface StatusConfig {
  label: string | null;
  color?: string;
}

const STATUS_CONFIG: Record<GameStatus, StatusConfig> = {
  playing:   { label: null },
  check:     { label: "Шах!",             color: "text-yellow-400" },
  checkmate: { label: "Мат! Игра окончена", color: "text-red-400" },
  draw:      { label: "Ничья!",            color: "text-blue-400" },
};

interface Props {
  status: GameStatus;
  currentTurn: string;
  onReset: () => void;
}

export default function GameInfo({ status, currentTurn, onReset }: Props) {
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="bg-[#16213e] rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-board-muted text-xs uppercase tracking-widest">Ход</p>
          <p className="font-display text-2xl text-white">{currentTurn}</p>
        </div>
        {cfg.label && (
          <span className={`font-display text-lg font-semibold ${cfg.color}`}>
            {cfg.label}
          </span>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full py-2 rounded-xl border border-board-accent text-board-accent
                   hover:bg-board-accent hover:text-[#1a1a2e] transition-all duration-200
                   font-body font-medium text-sm tracking-wide"
      >
        Новая игра
      </button>
    </div>
  );
}
