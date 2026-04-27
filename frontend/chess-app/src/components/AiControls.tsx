import type { GameMode } from "../types/chess";

interface Props {
  gameMode: GameMode;
  aiLevel: number;
  isAiThinking: boolean;
  onSetMode: (mode: GameMode) => void;
  onSetLevel: (level: number) => void;
}

const LEVELS = [
  { value: 1,  label: "Новичок" },
  { value: 5,  label: "Любитель" },
  { value: 10, label: "Средний" },
  { value: 15, label: "Сильный" },
  { value: 20, label: "Мастер" },
];

export default function AiControls({
  gameMode,
  aiLevel,
  isAiThinking,
  onSetMode,
  onSetLevel,
}: Props) {
  return (
    <div className="bg-[#16213e] rounded-2xl p-4 space-y-4">
      <h3 className="font-display text-board-accent text-sm tracking-widest uppercase">
        Режим игры
      </h3>

      {/* PvP / AI переключатель */}
      <div className="flex rounded-xl overflow-hidden border border-board-accent/30">
        <button
          onClick={() => onSetMode("pvp")}
          className={`flex-1 py-2 text-sm font-medium transition-all duration-200 ${
            gameMode === "pvp"
              ? "bg-board-accent text-[#1a1a2e]"
              : "text-board-muted hover:text-white"
          }`}
        >
          Вдвоём
        </button>
        <button
          onClick={() => onSetMode("ai")}
          className={`flex-1 py-2 text-sm font-medium transition-all duration-200 ${
            gameMode === "ai"
              ? "bg-board-accent text-[#1a1a2e]"
              : "text-board-muted hover:text-white"
          }`}
        >
          Против AI
        </button>
      </div>

      {/* Уровень сложности — только в режиме AI */}
      {gameMode === "ai" && (
        <div className="space-y-2">
          <p className="text-board-muted text-xs uppercase tracking-widest">
            Сложность
          </p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onSetLevel(value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 border ${
                  aiLevel === value
                    ? "bg-board-accent text-[#1a1a2e] border-board-accent"
                    : "text-board-muted border-board-accent/30 hover:text-white hover:border-board-accent/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI думает индикатор */}
      {isAiThinking && (
        <div className="flex items-center gap-2 text-board-accent">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-board-accent animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-xs font-body">AI думает...</span>
        </div>
      )}
    </div>
  );
}