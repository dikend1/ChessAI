import type { MoveRecord } from "../types/chess";

interface Props {
  history: MoveRecord[];
}

interface MovePair {
  num: number;
  white?: MoveRecord;
  black?: MoveRecord;
}

export default function MoveHistory({ history }: Props) {
  const pairs: MovePair[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      num: i / 2 + 1,
      white: history[i],
      black: history[i + 1],
    });
  }
  const lastMoveIndex = history.length - 1;

  return (
    <div className="app-card overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-board-accent/10 px-3 py-2.5">
        <div>
          <h3 className="text-board-accent text-xs font-bold tracking-widest uppercase">
            История ходов
          </h3>
        </div>
        <span className="rounded-full border border-board-accent/25 px-2.5 py-0.5 text-[11px] font-semibold text-board-accent">
          {history.length} ходов
        </span>
      </div>

      <div className="grid grid-cols-[34px_1fr_1fr] border-b border-board-accent/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-board-muted">
        <span>#</span>
        <span>Белые</span>
        <span>Чёрные</span>
      </div>

      <div className="max-h-44 overflow-y-auto px-2 py-2">
        {pairs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-board-accent/20 bg-[var(--page)] px-3 py-4 text-center">
            <p className="text-sm text-board-muted">Ходов пока нет</p>
          </div>
        ) : (
          <div className="space-y-1">
            {pairs.map(({ num, white, black }, pairIndex) => {
              const whiteIndex = pairIndex * 2;
              const blackIndex = whiteIndex + 1;

              return (
                <div
                  key={num}
                  className="grid grid-cols-[30px_1fr_1fr] items-center gap-1.5 rounded-lg px-1.5 py-1 transition hover:bg-board-accent/5"
                >
                  <span className="text-xs font-semibold text-board-muted">{num}.</span>
                  <span
                    className={`truncate rounded-md px-2 py-1.5 font-mono text-xs ${
                      lastMoveIndex === whiteIndex
                        ? "bg-board-accent text-[#1a1a2e]"
                        : "bg-[var(--page)] text-app"
                    }`}
                  >
                    {white?.san ?? ""}
                  </span>
                  <span
                    className={`truncate rounded-md px-2 py-1.5 font-mono text-xs ${
                      lastMoveIndex === blackIndex
                        ? "bg-board-accent text-[#1a1a2e]"
                        : "bg-[var(--page)] text-board-muted"
                    }`}
                  >
                    {black?.san ?? ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
