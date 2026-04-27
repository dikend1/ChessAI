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

  return (
    <div className="bg-[#16213e] rounded-2xl p-4 h-64 overflow-y-auto">
      <h3 className="font-display text-board-accent text-sm mb-3 tracking-widest uppercase">
        История ходов
      </h3>
      {pairs.length === 0 && (
        <p className="text-board-muted text-sm">Ходов пока нет...</p>
      )}
      <div className="space-y-1">
        {pairs.map(({ num, white, black }) => (
          <div key={num} className="flex gap-2 text-sm font-mono">
            <span className="text-board-muted w-6">{num}.</span>
            <span className="text-white w-16">{white?.san}</span>
            <span className="text-board-muted w-16">{black?.san ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}