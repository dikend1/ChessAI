import type { LeaderboardEntry } from "../types/chess";

interface Props {
  cityName: string;
  entries: LeaderboardEntry[];
  isLoading: boolean;
}

export default function Leaderboard({ cityName, entries, isLoading }: Props) {
  const [leader, ...others] = entries;

  return (
    <div className="app-card overflow-hidden rounded-2xl">
      <div className="border-b border-board-accent/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl text-board-accent">
              Лидерборд
            </h3>
            <p className="text-xs uppercase tracking-widest text-board-muted">
              {cityName}, Kazakhstan
            </p>
          </div>
          <span className="rounded-full border border-board-accent/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-board-muted">
            Top 10
          </span>
        </div>
      </div>

      <div className="p-4">
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-14 animate-pulse rounded-xl bg-[var(--page)]" />
            ))}
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-board-accent/20 bg-[var(--page)] px-4 py-5 text-center">
            <p className="text-sm font-medium text-app">Побед пока нет</p>
            <p className="mt-1 text-xs text-board-muted">Первый мат попадёт в таблицу.</p>
          </div>
        )}

        {!isLoading && leader && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-board-accent/30 bg-board-accent/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-board-accent text-lg font-bold text-[#1a1a2e]">
                  1
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-app">{leader.name}</p>
                  <p className="text-xs text-board-muted">{leader.games} игр</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-board-accent">{leader.wins}</p>
                  <p className="text-[10px] uppercase tracking-widest text-board-muted">wins</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {others.map((entry, index) => {
                const rank = index + 2;
                return (
                  <div
                    key={entry.userId}
                    className="flex items-center gap-3 rounded-xl border border-board-accent/10 bg-[var(--page)] px-3 py-2.5"
                  >
                    <span className="w-6 text-center text-sm font-semibold text-board-muted">
                      {rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-app">{entry.name}</p>
                      <p className="text-[11px] text-board-muted">{entry.games} игр</p>
                    </div>
                    <span className="font-display text-xl text-board-accent">{entry.wins}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
