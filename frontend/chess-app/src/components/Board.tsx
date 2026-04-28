import { Chessboard } from "react-chessboard";
import type { GameMode, GameStatus, HintMove, MoveRecord } from "../types/chess";

interface Props {
  fen: string;
  history: MoveRecord[];
  gameMode: GameMode;
  playerColor: "w" | "b" | null;
  onDrop: (from: string, to: string) => boolean;
  status: GameStatus;
  isAIThinking: boolean;
  orientation?: "white" | "black";
  hintMove?: HintMove | null;
}

const PIECES: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
};

function getPlayerName(color: "w" | "b", gameMode: GameMode, playerColor: "w" | "b" | null) {
  if (gameMode === "ai") return color === "w" ? "Вы" : "Stockfish";
  if (gameMode === "multiplayer") return color === playerColor ? "Вы" : "Соперник";
  return color === "w" ? "Белые" : "Чёрные";
}

function PlayerBar({
  color,
  name,
  active,
  captured,
}: {
  color: "w" | "b";
  name: string;
  active: boolean;
  captured: string[];
}) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
      active
        ? "border-board-accent/50 bg-board-accent/10"
        : "border-board-accent/10 bg-[var(--surface)]"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${
          color === "w"
            ? "bg-[#ead9b8] text-[#1a1a2e]"
            : "bg-[#1a1a2e] text-[#ead9b8] ring-1 ring-board-accent/20"
        }`}>
          {color === "w" ? "♔" : "♚"}
        </div>
        <div>
          <p className="text-sm font-semibold text-app">{name}</p>
          <p className="text-[11px] uppercase tracking-widest text-board-muted">
            {color === "w" ? "Белые" : "Чёрные"}
          </p>
        </div>
      </div>
      <div className="flex min-w-16 justify-end gap-0.5 text-lg text-board-muted">
        {captured.map((piece, index) => (
          <span key={`${piece}-${index}`}>{PIECES[piece] ?? piece}</span>
        ))}
      </div>
    </div>
  );
}

export default function Board({
  fen,
  history,
  gameMode,
  playerColor,
  onDrop,
  status,
  isAIThinking,
  orientation = "white",
  hintMove,
}: Props) {
  const isGameOver = status === "checkmate" || status === "draw" || status === "resigned";
  const turn = fen.split(" ")[1] === "b" ? "b" : "w";
  const topColor = orientation === "black" ? "w" : "b";
  const bottomColor = orientation === "black" ? "b" : "w";
  const whiteCaptured = history
    .filter((move) => move.color === "w" && move.captured)
    .map((move) => move.captured!);
  const blackCaptured = history
    .filter((move) => move.color === "b" && move.captured)
    .map((move) => move.captured!);
  const lastMove = history.at(-1);
  const squareStyles = {
    ...(lastMove ? {
      [lastMove.from]: { backgroundColor: "rgba(250, 204, 21, 0.34)" },
      [lastMove.to]: { backgroundColor: "rgba(250, 204, 21, 0.48)" },
    } : {}),
    ...(hintMove ? {
      [hintMove.from]: { boxShadow: "inset 0 0 0 4px rgba(250, 204, 21, 0.55)" },
      [hintMove.to]: { boxShadow: "inset 0 0 0 4px rgba(250, 204, 21, 0.55)" },
    } : {}),
  };

  return (
    <div className="flex flex-col gap-3">
      <PlayerBar
        color={topColor}
        name={getPlayerName(topColor, gameMode, playerColor)}
        active={turn === topColor && !isGameOver}
        captured={topColor === "w" ? whiteCaptured : blackCaptured}
      />
      <div className="relative overflow-hidden rounded-xl shadow-2xl ring-1 ring-board-accent/20">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            showNotation: true,
            arrows: hintMove
              ? [{ startSquare: hintMove.from, endSquare: hintMove.to, color: "#facc15" }]
              : [],
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false;
              return onDrop(sourceSquare, targetSquare);
            },
            boardStyle: { width: 520, maxWidth: "min(88vw, 520px)" },
            squareStyles,
            lightSquareStyle: { backgroundColor: "#ead9b8" },
            darkSquareStyle: { backgroundColor: "#7a5336" },
            allowDragging: !isGameOver && !isAIThinking,
            animationDurationInMs: 200,
          }}
        />
        {isGameOver && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <p className="font-display text-4xl text-board-accent drop-shadow-lg">
              {status === "checkmate" ? "Мат!" : status === "draw" ? "Ничья!" : "Сдался!"}
            </p>
          </div>
        )}
      </div>
      <PlayerBar
        color={bottomColor}
        name={getPlayerName(bottomColor, gameMode, playerColor)}
        active={turn === bottomColor && !isGameOver}
        captured={bottomColor === "w" ? whiteCaptured : blackCaptured}
      />
    </div>
  );
}
