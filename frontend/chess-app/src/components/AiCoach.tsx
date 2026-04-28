import { useState } from "react";
import { analyzeGame } from "../lib/aiCoach";
import type { GameMode, GameStatus, MoveRecord } from "../types/chess";

interface Props {
  finalFen: string;
  gameMode: GameMode;
  history: MoveRecord[];
  status: GameStatus;
}

export default function AiCoach({ finalFen, gameMode, history, status }: Props) {
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isFinished = status === "checkmate" || status === "draw";
  const canAnalyze = isFinished && history.length > 0 && !isLoading;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setIsLoading(true);
    setError("");

    try {
      const nextAnalysis = await analyzeGame({
        finalFen,
        gameMode,
        history,
        status,
      });
      setAnalysis(nextAnalysis);
    } catch (err) {
      setAnalysis("");
      setError(err instanceof Error ? err.message : "Не удалось разобрать партию.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-board-accent text-sm tracking-widest uppercase">
          AI Coach
        </h3>
        {isLoading && (
          <span className="text-xs text-board-muted">Анализ...</span>
        )}
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className="w-full rounded-xl border border-board-accent px-3 py-2 text-sm font-medium
                   text-board-accent transition-all duration-200 hover:bg-board-accent
                   hover:text-[#1a1a2e] disabled:cursor-not-allowed disabled:border-board-muted/40
                   disabled:text-board-muted disabled:hover:bg-transparent disabled:hover:text-board-muted"
      >
        Разобрать партию
      </button>

      {!isFinished && (
        <p className="text-xs leading-relaxed text-board-muted">
          Доступен после мата или ничьей.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-xs leading-relaxed text-red-200">
          {error}
        </p>
      )}

      {analysis && (
        <div className="max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-[var(--page)] p-3">
          <p className="whitespace-pre-line text-sm leading-relaxed text-app">
            {analysis}
          </p>
        </div>
      )}
    </div>
  );
}
