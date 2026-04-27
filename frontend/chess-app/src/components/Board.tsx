import { Chessboard } from "react-chessboard";
import type { GameStatus } from "../types/chess";

interface Props {
  fen: string;
  onDrop: (from: string, to: string) => boolean;
  status: GameStatus;
  isAIThinking: boolean;
}

export default function Board({ fen, onDrop, status, isAIThinking }: Props) {
  const isGameOver = status === "checkmate" || status === "draw";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-lg overflow-hidden shadow-2xl">
        <Chessboard
          options={{
            position: fen,
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false;
              return onDrop(sourceSquare, targetSquare);
            },
            boardStyle: { width: 500 },
            lightSquareStyle: { backgroundColor: "#e8d5b0" },
            darkSquareStyle: { backgroundColor: "#8b5e3c" },
            allowDragging: !isGameOver && !isAIThinking,
            animationDurationInMs: 200,
          }}
        />
        {isGameOver && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <p className="font-display text-4xl text-board-accent drop-shadow-lg">
              {status === "checkmate" ? "Мат!" : "Ничья!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}