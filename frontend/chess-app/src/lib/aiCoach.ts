import type { GameMode, GameStatus, MoveRecord } from "../types/chess";

interface AnalyzeGameInput {
  finalFen: string;
  gameMode: GameMode;
  history: MoveRecord[];
  status: GameStatus;
}

interface AnalyzeGameResponse {
  analysis?: unknown;
  error?: unknown;
}

const DEFAULT_ENDPOINT = "/api/ai-coach";

function formatMoveList(history: MoveRecord[]) {
  const lines: string[] = [];

  for (let i = 0; i < history.length; i += 2) {
    const moveNumber = i / 2 + 1;
    const white = history[i]?.san || `${history[i]?.from}-${history[i]?.to}`;
    const black = history[i + 1]?.san || (
      history[i + 1] ? `${history[i + 1].from}-${history[i + 1].to}` : ""
    );

    lines.push(`${moveNumber}. ${white}${black ? ` ${black}` : ""}`);
  }

  return lines.join("\n");
}

export async function analyzeGame(input: AnalyzeGameInput) {
  const endpoint = import.meta.env.VITE_AI_COACH_ENDPOINT || DEFAULT_ENDPOINT;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      finalFen: input.finalFen,
      gameMode: input.gameMode,
      moves: input.history,
      moveText: formatMoveList(input.history),
      status: input.status,
    }),
  });

  const data = await response.json().catch((): AnalyzeGameResponse => ({}));

  if (!response.ok) {
    const message = typeof data.error === "string"
      ? data.error
      : "AI Coach сейчас недоступен.";
    throw new Error(message);
  }

  if (typeof data.analysis !== "string" || !data.analysis.trim()) {
    throw new Error("Claude вернул пустой анализ.");
  }

  return data.analysis.trim();
}
